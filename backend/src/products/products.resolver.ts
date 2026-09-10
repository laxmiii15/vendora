import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { CreateProductInput, UpdateProductInput } from './dto/product.input';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/generated/prisma/client';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Query(() => [Product])
  getProducts(): Promise<Product[]> {
    return this.productService.getProducts();
  }

  @Mutation(() => Product)
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createProduct(
    @CurrentUser() user: User,
    @Args('input') createProductInput: CreateProductInput,
  ) {
    return this.productService.createProduct(createProductInput, user);
  }

  @Mutation(() => Product)
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateProduct(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProductInput,
  ) {
    return this.productService.updateProduct(user, id, input);
  }

  @Mutation(() => Product)
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async deleteProduct(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.productService.deleteProduct(user, id);
  }
}
