import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PageArgs } from '../common/paginated';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderInput } from './dto/order.input';
import { User } from '../users/entities/user.entity';
import {
  FulfillmentStatus,
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
      // Lines grouped by seller: each seller ships their slice of the order
      // as its own fulfillment.
      const itemsBySeller = new Map<
        string,
        { productId: string; quantity: number; unitPrice: number }[]
      >();

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

        const sellerItems = itemsBySeller.get(product.sellerId) ?? [];
        sellerItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
        });
        itemsBySeller.set(product.sellerId, sellerItems);
        total += product.price * item.quantity;
      }

      const order = await tx.order.create({
        data: { customerId: customer.id, total },
      });

      // Items need both orderId and fulfillmentId, so they're created under
      // each fulfillment once the order exists.
      for (const [sellerId, items] of itemsBySeller) {
        await tx.fulfillment.create({
          data: {
            orderId: order.id,
            sellerId,
            items: {
              create: items.map((item) => ({ ...item, orderId: order.id })),
            },
          },
        });
      }

      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: ORDER_INCLUDE,
      });
    });
  }

  async findMyOrders(customer: User, { page, pageSize }: PageArgs) {
    const where = { customerId: customer.id };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async cancelMyOrder(id: string, customer: User) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    // Same 404 for "doesn't exist" and "not yours" so customers can't probe
    // other people's order ids.
    if (!order || order.customerId !== customer.id) {
      throw new NotFoundException('Order not found');
    }

    return this.cancelOrder(id);
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

    return this.prisma.$transaction(async (tx) => {
      // Conditional on the status we just read: if another request changed it
      // in between, count is 0 and we reject instead of overwriting their change.
      const updated = await tx.order.updateMany({
        where: { id, status: order.status },
        data: { status },
      });

      if (updated.count === 0) {
        throw new ConflictException(
          'Order status changed concurrently, please retry',
        );
      }

      // An admin override applies to every seller's part of the order, so the
      // order and its fulfillments never disagree.
      if (status === OrderStatus.SHIPPED) {
        await tx.fulfillment.updateMany({
          where: { orderId: id, status: FulfillmentStatus.PENDING },
          data: { status: FulfillmentStatus.SHIPPED, shippedAt: new Date() },
        });
      } else if (status === OrderStatus.DELIVERED) {
        await tx.fulfillment.updateMany({
          where: { orderId: id, status: { not: FulfillmentStatus.CANCELLED } },
          data: { status: FulfillmentStatus.DELIVERED },
        });
      }

      return tx.order.findUniqueOrThrow({
        where: { id },
        include: ORDER_INCLUDE,
      });
    });
  }

  // A seller ships their part of a paid order. Once every part is shipped the
  // order itself moves to SHIPPED.
  async shipFulfillment(id: string, seller: User, trackingNumber?: string) {
    await this.prisma.$transaction(async (tx) => {
      const fulfillment = await tx.fulfillment.findUnique({ where: { id } });

      if (!fulfillment) {
        throw new NotFoundException('Fulfillment not found');
      }

      if (fulfillment.sellerId !== seller.id) {
        throw new ForbiddenException('You can only ship your own orders');
      }

      // Lock the order row so concurrent shipments of the same order run one
      // at a time; otherwise each could still see the other's part as PENDING
      // and the order would never move to SHIPPED.
      await tx.$queryRaw`SELECT 1 FROM "Order" WHERE "id" = ${fulfillment.orderId} FOR UPDATE`;

      const order = await tx.order.findUniqueOrThrow({
        where: { id: fulfillment.orderId },
      });

      if (order.status !== OrderStatus.PAID) {
        throw new BadRequestException(
          `Only paid orders can be shipped (order is ${order.status})`,
        );
      }

      const shipped = await tx.fulfillment.updateMany({
        where: { id, status: FulfillmentStatus.PENDING },
        data: {
          status: FulfillmentStatus.SHIPPED,
          trackingNumber: trackingNumber?.trim() || null,
          shippedAt: new Date(),
        },
      });

      if (shipped.count === 0) {
        throw new ConflictException('This order has already been shipped');
      }

      const stillPending = await tx.fulfillment.count({
        where: { orderId: order.id, status: FulfillmentStatus.PENDING },
      });

      if (stillPending === 0) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.SHIPPED },
        });
      }
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

      await tx.fulfillment.updateMany({
        where: { orderId: id },
        data: { status: FulfillmentStatus.CANCELLED },
      });

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
