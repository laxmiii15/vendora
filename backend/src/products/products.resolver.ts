import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ProductService } from "./product.service";
import { Product } from "./entities/product.entity";
import { CreateProductInput } from "./dto/product.input";
import { UseGuards } from "@nestjs/common";
import { GqlJwtAuthGuard } from "src/auth/guards/auth.guard";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { User } from "src/users/entities/user.entity";





@Resolver(() => Product)
export class ProductResolver {
    constructor(private readonly productService: ProductService) { }

    @Query(() => [Product])
    @UseGuards(GqlJwtAuthGuard)

    getProducts(): Promise<Product[]> {
        return this.productService.getProducts()
    }

    @Mutation(() => Product)
    @UseGuards(GqlJwtAuthGuard)
    createProduct(@CurrentUser() user: User, @Args("input") createProductInput: CreateProductInput) {
        return this.productService.createProduct(createProductInput, user)
    }


}