import { ArgsType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  OrderStatus,
  ProductStatus,
  UserRole,
  UserStatus,
} from '../../generated/prisma/enums';

registerEnumType(UserRole, { name: 'UserRole' });
registerEnumType(UserStatus, { name: 'UserStatus' });

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

@ArgsType()
export class AdminOrdersArgs extends PaginationArgs {
  @Field(() => OrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

@ArgsType()
export class AdminProductsArgs extends PaginationArgs {
  @Field(() => ProductStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}

@ArgsType()
export class AdminUsersArgs extends PaginationArgs {
  @Field(() => UserRole, { nullable: true })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @Field(() => UserStatus, { nullable: true })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
