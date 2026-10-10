import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderInput } from './dto/order.input';
import { User } from '../users/entities/user.entity';
import {
  OrderStatus,
  ProductStatus,
  UserRole,
} from '../generated/prisma/enums';

const ORDER_INCLUDE = { items: { include: { product: true } } } as const;

// Paid orders can't be cancelled yet — that needs a Stripe refund first.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.SHIPPED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(input: CreateOrderInput, customer: User) {
    return this.prisma.$transaction(async (tx) => {
      let total = 0;
      const itemsData: {
        productId: string;
        quantity: number;
        unitPrice: number;
      }[] = [];

      for (const item of input.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        if (product.status !== ProductStatus.ACTIVE) {
          throw new BadRequestException(
            `Product "${product.name}" is not available for purchase`,
          );
        }

        // Conditional decrement: only succeeds if stock is still sufficient at
        // write time, so two concurrent orders can't both oversell the same unit.
        const decremented = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (decremented.count === 0) {
          throw new BadRequestException(
            `Insufficient stock for product "${product.name}"`,
          );
        }

        itemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
        });
        total += product.price * item.quantity;
      }

      return tx.order.create({
        data: {
          customerId: customer.id,
          total,
          items: { create: itemsData },
        },
        include: ORDER_INCLUDE,
      });
    });
  }

  async findMyOrders(customer: User) {
    return this.prisma.order.findMany({
      where: { customerId: customer.id },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrderById(id: string, requester: User) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isOwner = order.customerId === requester.id;
    const isAdmin =
      requester.role === UserRole.ADMIN ||
      requester.role === UserRole.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to view this order',
      );
    }

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    if (status === OrderStatus.CANCELLED) {
      return this.cancelOrder(id);
    }

    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    this.assertTransitionAllowed(order.status, status);

    // Conditional on the status we just read: if another request changed it in
    // between, count is 0 and we reject instead of overwriting their change.
    const updated = await this.prisma.order.updateMany({
      where: { id, status: order.status },
      data: { status },
    });

    if (updated.count === 0) {
      throw new ConflictException(
        'Order status changed concurrently, please retry',
      );
    }

    return this.prisma.order.findUniqueOrThrow({
      where: { id },
      include: ORDER_INCLUDE,
    });
  }

  // Cancels a PENDING order and returns its reserved stock. Kept separate from
  // updateOrderStatus so the Stripe webhook can call it for expired checkouts.
  async cancelOrder(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      this.assertTransitionAllowed(order.status, OrderStatus.CANCELLED);

      // Only one concurrent cancel can flip PENDING -> CANCELLED, so stock is
      // restored exactly once.
      const cancelled = await tx.order.updateMany({
        where: { id, status: OrderStatus.PENDING },
        data: { status: OrderStatus.CANCELLED },
      });

      if (cancelled.count === 0) {
        throw new ConflictException('Order is no longer pending');
      }

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.order.findUniqueOrThrow({
        where: { id },
        include: ORDER_INCLUDE,
      });
    });
  }

  private assertTransitionAllowed(from: OrderStatus, to: OrderStatus) {
    if (!ALLOWED_TRANSITIONS[from].includes(to)) {
      throw new BadRequestException(
        `Cannot change order status from ${from} to ${to}`,
      );
    }
  }
}
