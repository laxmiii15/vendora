import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ProductSize, ProductStatus } from '../../generated/prisma/enums';
import { Category } from '../../categories/entities/category.entity';

registerEnumType(ProductStatus, {
  name: 'ProductStautus',
});

registerEnumType(ProductSize, {
  name: 'ProductSize',
});

@ObjectType()
export class Product {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field()
  price: number;

  @Field(() => Int)
  stock: number;

  @Field(() => ProductStatus)
  status: ProductStatus;

  @Field(() => ProductSize)
  size: ProductSize;

  @Field(() => String, { nullable: true })
  imageUrl?: string | null;

  @Field()
  sellerId: string;

  @Field()
  categoryId: string;

  @Field(() => Category, { nullable: true })
  category?: Category;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
