import { Injectable } from '@nestjs/common';
import { LOW_STOCK_THRESHOLD, REVENUE_STATUSES } from '../admin/admin.service';
import { Prisma } from '../generated/prisma/client';
import {
  FulfillmentStatus,
  OrderStatus,
  ProductStatus,
} from '../generated/prisma/enums';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../users/entities/user.entity';
import {
  MarkFulfillmentShippedArgs,
  SellerOrdersArgs,
  SellerProductsArgs,
} from './dto/seller.args';

const SELLER_ORDER_INCLUDE = {
  items: { include: { product: true } },
  order: { select: { status: true } },
} as const;

type FulfillmentWithOrder = Prisma.FulfillmentGetPayload<{
  include: typeof SELLER_ORDER_INCLUDE;
}>;

// Every query in this service is scoped to the calling seller's products and
// fulfillments.
@Injectable()
export class SellerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  async getStats(seller: User) {
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
      this.prisma.fulfillment.count({
        where: {
          sellerId: seller.id,
          status: { not: FulfillmentStatus.CANCELLED },
        },
      }),
      this.prisma.fulfillment.count({
        where: {
          sellerId: seller.id,
          status: FulfillmentStatus.PENDING,
          order: { status: OrderStatus.PAID },
        },
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
    const where: Prisma.FulfillmentWhereInput = {
      sellerId: seller.id,
      ...(status ? { status } : {}),
    };

    const [fulfillments, total] = await this.prisma.$transaction([
      this.prisma.fulfillment.findMany({
        where,
        include: SELLER_ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.fulfillment.count({ where }),
    ]);

    return {
      items: fulfillments.map(toSellerOrder),
      total,
      page,
      pageSize,
    };
  }

  async markShipped(
    seller: User,
    { id, trackingNumber }: MarkFulfillmentShippedArgs,
  ) {
    await this.ordersService.shipFulfillment(id, seller, trackingNumber);

    const fulfillment = await this.prisma.fulfillment.findUniqueOrThrow({
      where: { id },
      include: SELLER_ORDER_INCLUDE,
    });
    return toSellerOrder(fulfillment);
  }
}

function toSellerOrder(fulfillment: FulfillmentWithOrder) {
  return {
    id: fulfillment.id,
    orderId: fulfillment.orderId,
    status: fulfillment.status,
    orderStatus: fulfillment.order.status,
    trackingNumber: fulfillment.trackingNumber,
    shippedAt: fulfillment.shippedAt,
    items: fulfillment.items,
    subtotal: fulfillment.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    ),
    createdAt: fulfillment.createdAt,
  };
}
