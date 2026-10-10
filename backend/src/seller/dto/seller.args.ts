import { ArgsType, Field } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationArgs } from '../../admin/dto/admin.args';
import { PageArgs } from '../../common/paginated';
import { OrderStatus, ProductStatus } from '../../generated/prisma/enums';

@ArgsType()
export class SellerProductsArgs extends PaginationArgs {
  @Field(() => ProductStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}

@ArgsType()
export class SellerOrdersArgs extends PageArgs {
  @Field(() => OrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
