import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CheckoutSession {
  @Field()
  url: string;
}
