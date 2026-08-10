import { Field, InputType, Int, PartialType, registerEnumType } from '@nestjs/graphql';
import { IsString, MinLength, Min, IsInt, IsOptional, IsEnum } from 'class-validator';
import { ProductStatus } from 'src/generated/prisma/enums';


registerEnumType(ProductStatus, {
  name: "ProductStatus"
})

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  @MinLength(3)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsInt()
  @Min(0)
  price: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  stock: number;

  @Field()
  @IsString()
  slug: string;

  @Field(() => ProductStatus)
  @IsEnum(ProductStatus)
  status: ProductStatus;

  
}

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput){}

