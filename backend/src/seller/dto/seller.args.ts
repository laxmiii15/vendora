import { ArgsType, Field, ID } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationArgs } from '../../admin/dto/admin.args';
import { PageArgs } from '../../common/paginated';
import { FulfillmentStatus, ProductStatus } from '../../generated/prisma/enums';

@ArgsType()
export class SellerProductsArgs extends PaginationArgs {
  @Field(() => ProductStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}

@ArgsType()
export class SellerOrdersArgs extends PageArgs {
  @Field(() => FulfillmentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(FulfillmentStatus)
  status?: FulfillmentStatus;
}

@ArgsType()
export class MarkFulfillmentShippedArgs {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string;
}
