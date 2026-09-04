import {
  BadRequestException,
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
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: ORDER_INCLUDE,
    });
  }
}
