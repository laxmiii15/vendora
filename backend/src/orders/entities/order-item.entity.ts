import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Product } from '../../products/entities/product.entity';

@ObjectType()
export class OrderItem {
  @Field(() => ID)
  id: string;

  @Field()
  orderId: string;

  @Field()
  productId: string;

  @Field(() => Product, { nullable: true })
  product?: Product;

  @Field(() => Int)
  quantity: number;

  @Field()
  unitPrice: number;
}
