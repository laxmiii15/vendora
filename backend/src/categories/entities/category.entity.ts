import { Field, ID, ObjectType } from "@nestjs/graphql";


@ObjectType()
export class Category {
    @Field(() => ID)
    id: String;

    @Field()
    name: string;

    @Field()
    slug: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}