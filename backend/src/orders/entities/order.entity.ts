import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Paginated } from '../../common/paginated';
import { OrderStatus } from '../../generated/prisma/enums';
import { User } from '../../users/entities/user.entity';
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

  // Only populated by queries that include it (e.g. adminOrders).
  @Field(() => User, { nullable: true })
  customer?: User;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Int)
  total: number;

  @Field(() => [OrderItem], { nullable: true })
  items?: OrderItem[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class OrderPage extends Paginated(Order) {}
