import { ArgsType, Field, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageArgs } from '../../common/paginated';
import {
  OrderStatus,
  ProductStatus,
  UserRole,
  UserStatus,
} from '../../generated/prisma/enums';

registerEnumType(UserRole, { name: 'UserRole' });
registerEnumType(UserStatus, { name: 'UserStatus' });

@ArgsType()
export class PaginationArgs extends PageArgs {
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
