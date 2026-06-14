import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserRole, UserStatus } from '../../generated/prisma/client';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string | null;

  @Field({ nullable: true })
  lastName?: string | null;

  @Field(() => String)
  role: UserRole;

  @Field(() => String)
  status: UserStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
