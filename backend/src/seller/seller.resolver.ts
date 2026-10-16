import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductPage } from '../products/entities/product-page.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { GqlJwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../generated/prisma/enums';
import { User } from '../users/entities/user.entity';
import {
  MarkFulfillmentShippedArgs,
  SellerOrdersArgs,
  SellerProductsArgs,
} from './dto/seller.args';
import {
  SellerOrder,
  SellerOrderPage,
  SellerStats,
} from './entities/seller.entities';
import { SellerService } from './seller.service';

// Sellers manage listings through the existing product mutations (which check
// ownership) and ship their own part of each order here; the order's status
// otherwise stays with admins. Admins are allowed in too and see their own
// listings.
@Resolver()
@UseGuards(GqlJwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class SellerResolver {
  constructor(private readonly sellerService: SellerService) {}

  @Query(() => SellerStats)
  sellerStats(@CurrentUser() seller: User) {
    return this.sellerService.getStats(seller);
  }

  @Query(() => ProductPage)
  sellerProducts(
    @CurrentUser() seller: User,
    @Args() args: SellerProductsArgs,
  ) {
    return this.sellerService.findProducts(seller, args);
  }

  @Query(() => SellerOrderPage)
  sellerOrders(@CurrentUser() seller: User, @Args() args: SellerOrdersArgs) {
    return this.sellerService.findOrders(seller, args);
  }

  @Mutation(() => SellerOrder)
  markFulfillmentShipped(
    @CurrentUser() seller: User,
    @Args() args: MarkFulfillmentShippedArgs,
  ) {
    return this.sellerService.markShipped(seller, args);
  }
}
