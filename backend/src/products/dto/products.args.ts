import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { PageArgs } from '../../common/paginated';

@ArgsType()
export class ProductsArgs extends PageArgs {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
