import { Field, InputType } from "@nestjs/graphql";
import { IsString, MinLength } from "class-validator";



@InputType()
export class CreateCategoryInput {
    @Field()
    @IsString()
    @MinLength(3)
    name: string;

    @Field()
    @IsString()
    @MinLength(3)
    slug: string;
}