import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ProductStatus } from '../../generated/prisma/enums';

registerEnumType(ProductStatus, {
  name: 'ProductStautus',
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

  @Field()
  sellerId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
