import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PageArgs } from '../common/paginated';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { GqlJwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrderStatus, UserRole } from '../generated/prisma/enums';
import { User } from '../users/entities/user.entity';
import { CreateOrderInput } from './dto/order.input';
import { Order, OrderPage } from './entities/order.entity';
import { OrdersService } from './orders.service';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation(() => Order)
  @UseGuards(GqlJwtAuthGuard)
  createOrder(
    @CurrentUser() user: User,
    @Args('input') input: CreateOrderInput,
  ) {
    return this.ordersService.createOrder(input, user);
  }

  @Query(() => OrderPage, { name: 'myOrders' })
  @UseGuards(GqlJwtAuthGuard)
  myOrders(@CurrentUser() user: User, @Args() args: PageArgs) {
    return this.ordersService.findMyOrders(user, args);
  }

  @Mutation(() => Order)
  @UseGuards(GqlJwtAuthGuard)
  cancelMyOrder(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.ordersService.cancelMyOrder(id, user);
  }

  @Query(() => Order, { name: 'order' })
  @UseGuards(GqlJwtAuthGuard)
  order(@CurrentUser() user: User, @Args('id', { type: () => ID }) id: string) {
    return this.ordersService.findOrderById(id, user);
  }

  @Mutation(() => Order)
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateOrderStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => OrderStatus }) status: OrderStatus,
  ) {
    return this.ordersService.updateOrderStatus(id, status);
  }
}
