import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { OrderStatus } from '../../generated/prisma/enums';
import { OrderItem } from './order-item.entity';

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

@ObjectType()
export class Order {
  @Field(() => ID)
  id: string;

  @Field()
  customerId: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field()
  total: number;

  @Field(() => [OrderItem], { nullable: true })
  items?: OrderItem[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
