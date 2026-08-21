import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Category } from './entities/category.entity';
import { CategoriesService } from './categories.service';
import { GqlJwtAuthGuard } from 'src/auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { CreateCategoryInput, UpdateCategoryInput } from './dto/create-category.input';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Category)
export class CategoriesResolver {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Query(() => [Category])
    @UseGuards(GqlJwtAuthGuard)

    getCategories(): Promise<Category[]> {
        return this.categoriesService.getCategories()
    }

    @Mutation(() => Category)
    @UseGuards(GqlJwtAuthGuard)
    createCategory(@CurrentUser() user: User, @Args("input") createCategoryInput: CreateCategoryInput) {
        return this.categoriesService.createCategory(createCategoryInput, user)
    }

    @Mutation(() => Category)
    @UseGuards(GqlJwtAuthGuard)
    updateCategory(@CurrentUser() user: User, @Args("id")id: string, @Args("input")updateCategoryInput: UpdateCategoryInput) {
        return this.categoriesService.updateCategory(updateCategoryInput, user, id);
    }


}
