import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import {
  OrderStatus,
  ProductStatus,
  UserRole,
  UserStatus,
} from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../users/entities/user.entity';
import {
  AdminOrdersArgs,
  AdminProductsArgs,
  AdminUsersArgs,
} from './dto/admin.args';

// Never let the password hash leave the service, even though the GraphQL
// User type doesn't expose it.
const SAFE_USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

const REVENUE_STATUSES = [
  OrderStatus.PAID,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

const LOW_STOCK_THRESHOLD = 5;

const ELEVATED_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      revenue,
      orderCount,
      pendingOrderCount,
      customerCount,
      activeProductCount,
      lowStockCount,
    ] = await this.prisma.$transaction([
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: REVENUE_STATUSES } },
      }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      this.prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
      this.prisma.product.count({
        where: {
          status: ProductStatus.ACTIVE,
          stock: { lte: LOW_STOCK_THRESHOLD },
        },
      }),
    ]);

    return {
      revenue: revenue._sum.total ?? 0,
      orderCount,
      pendingOrderCount,
      customerCount,
      activeProductCount,
      lowStockCount,
    };
  }

  async findOrders({ page, pageSize, search, status }: AdminOrdersArgs) {
    const term = search?.trim();
    const where: Prisma.OrderWhereInput = {
      ...(status ? { status } : {}),
      ...(term
        ? {
            OR: [
              { id: { contains: term } },
              { customer: { email: { contains: term, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: {
          customer: { select: SAFE_USER_SELECT },
          items: { include: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  // Unlike the storefront's getProducts, this includes every status
  // (DRAFT, ARCHIVED, ...) so admins can manage the whole catalogue.
  async findProducts({ page, pageSize, search, status }: AdminProductsArgs) {
    const term = search?.trim();
    const where: Prisma.ProductWhereInput = {
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

  async findUsers({ page, pageSize, search, role, status }: AdminUsersArgs) {
    const term = search?.trim();
    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(term
        ? {
            OR: [
              { email: { contains: term, mode: 'insensitive' } },
              { firstName: { contains: term, mode: 'insensitive' } },
              { lastName: { contains: term, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: SAFE_USER_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async updateUserRole(requester: User, id: string, role: UserRole) {
    const target = await this.findManageableUser(requester, id);

    // Granting or revoking admin rights is SUPER_ADMIN-only.
    if (
      ELEVATED_ROLES.includes(role) &&
      requester.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Only a super admin can grant admin roles');
    }

    return this.prisma.user.update({
      where: { id: target.id },
      data: { role },
      select: SAFE_USER_SELECT,
    });
  }

  async updateUserStatus(requester: User, id: string, status: UserStatus) {
    const target = await this.findManageableUser(requester, id);

    return this.prisma.user.update({
      where: { id: target.id },
      data: { status },
      select: SAFE_USER_SELECT,
    });
  }

  // Shared guard rails for any admin action on another user account:
  // no self-modification (can't lock yourself out or self-promote), and only
  // a SUPER_ADMIN may touch another admin.
  private async findManageableUser(requester: User, id: string) {
    if (requester.id === id) {
      throw new ForbiddenException('You cannot modify your own account here');
    }

    const target = await this.prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (
      ELEVATED_ROLES.includes(target.role) &&
      requester.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Only a super admin can modify admins');
    }

    return target;
  }
}
