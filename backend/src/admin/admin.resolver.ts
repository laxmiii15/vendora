import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { GqlJwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole, UserStatus } from '../generated/prisma/enums';
import { User } from '../users/entities/user.entity';
import { AdminService } from './admin.service';
import {
  AdminOrdersArgs,
  AdminProductsArgs,
  AdminUsersArgs,
} from './dto/admin.args';
import {
  AdminStats,
  OrderPage,
  ProductPage,
  UserPage,
} from './entities/admin.entities';

// Guards are applied at class level so every admin operation, including ones
// added later, is admin-only by default.
@Resolver()
@UseGuards(GqlJwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => AdminStats)
  adminStats() {
    return this.adminService.getStats();
  }

  @Query(() => OrderPage)
  adminOrders(@Args() args: AdminOrdersArgs) {
    return this.adminService.findOrders(args);
  }

  @Query(() => ProductPage)
  adminProducts(@Args() args: AdminProductsArgs) {
    return this.adminService.findProducts(args);
  }

  @Query(() => UserPage)
  adminUsers(@Args() args: AdminUsersArgs) {
    return this.adminService.findUsers(args);
  }

  @Mutation(() => User)
  updateUserRole(
    @CurrentUser() requester: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('role', { type: () => UserRole }) role: UserRole,
  ) {
    return this.adminService.updateUserRole(requester, id, role);
  }

  @Mutation(() => User)
  updateUserStatus(
    @CurrentUser() requester: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => UserStatus }) status: UserStatus,
  ) {
    return this.adminService.updateUserStatus(requester, id, status);
  }
}
