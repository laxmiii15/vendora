import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/paginated';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class OrderPage extends Paginated(Order) {}

@ObjectType()
export class ProductPage extends Paginated(Product) {}

@ObjectType()
export class UserPage extends Paginated(User) {}

@ObjectType()
export class AdminStats {
  // Sum of PAID + SHIPPED + DELIVERED orders, in the same minor units as
  // Order.total.
  @Field()
  revenue: number;

  @Field(() => Int)
  orderCount: number;

  @Field(() => Int)
  pendingOrderCount: number;

  @Field(() => Int)
  customerCount: number;

  @Field(() => Int)
  activeProductCount: number;

  @Field(() => Int)
  lowStockCount: number;
}
