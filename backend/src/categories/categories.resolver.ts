import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Category } from './entities/category.entity';
import { CategoriesService } from './categories.service';
import { GqlJwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from './dto/create-category.input';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/generated/prisma/client';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Query(() => [Category])
  getCategories(): Promise<Category[]> {
    return this.categoriesService.getCategories();
  }

  @Mutation(() => Category)
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createCategory(
    @CurrentUser() user: User,
    @Args('input') createCategoryInput: CreateCategoryInput,
  ) {
    return this.categoriesService.createCategory(createCategoryInput, user);
  }

  @Mutation(() => Category)
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateCategory(
    @CurrentUser() user: User,
    @Args('id') id: string,
    @Args('input') updateCategoryInput: UpdateCategoryInput,
  ) {
    return this.categoriesService.updateCategory(updateCategoryInput, user, id);
  }

  @Mutation(() => Category)
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  deleteCategory(@CurrentUser() user: User, @Args('id') id: string) {
    return this.categoriesService.deleteCategory(user, id);
  }
}
