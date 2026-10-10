import { Injectable } from '@nestjs/common';
import { LOW_STOCK_THRESHOLD, REVENUE_STATUSES } from '../admin/admin.service';
import { Prisma } from '../generated/prisma/client';
import { OrderStatus, ProductStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../users/entities/user.entity';
import { SellerOrdersArgs, SellerProductsArgs } from './dto/seller.args';

// Every query in this service is scoped to the calling seller's products.
@Injectable()
export class SellerService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(seller: User) {
    const hasMyItems: Prisma.OrderWhereInput = {
      items: { some: { product: { sellerId: seller.id } } },
    };

    // Prisma can't aggregate quantity * unitPrice, so revenue is raw SQL.
    const revenueQuery = this.prisma.$queryRaw<{ revenue: bigint | null }[]>`
      SELECT SUM(oi."unitPrice" * oi."quantity") AS revenue
      FROM "OrderItem" oi
      JOIN "Product" p ON p."id" = oi."productId"
      JOIN "Order" o ON o."id" = oi."orderId"
      WHERE p."sellerId" = ${seller.id}
        AND o."status"::text IN (${Prisma.join(REVENUE_STATUSES)})
    `;

    const [
      revenueRows,
      orderCount,
      awaitingShipmentCount,
      activeProductCount,
      lowStockCount,
    ] = await this.prisma.$transaction([
      revenueQuery,
      this.prisma.order.count({
        where: { ...hasMyItems, status: { not: OrderStatus.CANCELLED } },
      }),
      this.prisma.order.count({
        where: { ...hasMyItems, status: OrderStatus.PAID },
      }),
      this.prisma.product.count({
        where: { sellerId: seller.id, status: ProductStatus.ACTIVE },
      }),
      this.prisma.product.count({
        where: {
          sellerId: seller.id,
          status: ProductStatus.ACTIVE,
          stock: { lte: LOW_STOCK_THRESHOLD },
        },
      }),
    ]);

    return {
      revenue: Number(revenueRows[0]?.revenue ?? 0),
      orderCount,
      awaitingShipmentCount,
      activeProductCount,
      lowStockCount,
    };
  }

  async findProducts(
    seller: User,
    { page, pageSize, search, status }: SellerProductsArgs,
  ) {
    const term = search?.trim();
    const where: Prisma.ProductWhereInput = {
      sellerId: seller.id,
      ...(status ? { status } : {}),
      ...(term
        ? {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { slug: { contains: term, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOrders(seller: User, { page, pageSize, status }: SellerOrdersArgs) {
    const myItems = { product: { sellerId: seller.id } };
    const where: Prisma.OrderWhereInput = {
      items: { some: myItems },
      ...(status ? { status } : {}),
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        // Only load this seller's lines — other sellers' items never leave
        // the database.
        include: { items: { where: myItems, include: { product: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    const items = orders.map((order) => ({
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items,
      subtotal: order.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      ),
    }));

    return { items, total, page, pageSize };
  }
}
