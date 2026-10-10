import { Type } from '@nestjs/common';
import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, Max, Min } from 'class-validator';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// GraphQL has no generics, so each paginated type is stamped out from this
// factory (e.g. `class OrderPage extends Paginated(Order) {}`), giving every
// admin list the same { items, total, page, pageSize } shape.
export function Paginated<T>(itemType: Type<T>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements PaginatedResult<T> {
    @Field(() => [itemType])
    items: T[];

    @Field(() => Int)
    total: number;

    @Field(() => Int)
    page: number;

    @Field(() => Int)
    pageSize: number;
  }
  return PaginatedType;
}

@ArgsType()
export class PageArgs {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number;
}
