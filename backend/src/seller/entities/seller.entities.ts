import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../common/paginated';
import { OrderStatus } from '../../generated/prisma/enums';
import { OrderItem } from '../../orders/entities/order-item.entity';

// A seller's view of an order: only their own line items, and the subtotal of
// those items — never other sellers' items, the order's grand total, or the
// customer's details.
@ObjectType()
export class SellerOrder {
  @Field(() => ID)
  id: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => [OrderItem])
  items: OrderItem[];

  @Field(() => Int)
  subtotal: number;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class SellerOrderPage extends Paginated(SellerOrder) {}

@ObjectType()
export class SellerStats {
  // Sum of this seller's items in PAID + SHIPPED + DELIVERED orders. Float
  // because a running total can outgrow GraphQL's 32-bit Int.
  @Field()
  revenue: number;

  // Orders containing at least one of this seller's items, excluding
  // cancelled ones.
  @Field(() => Int)
  orderCount: number;

  @Field(() => Int)
  awaitingShipmentCount: number;

  @Field(() => Int)
  activeProductCount: number;

  @Field(() => Int)
  lowStockCount: number;
}
