import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlJwtAuthGuard } from '../auth/guards/auth.guard';
import { User } from '../users/entities/user.entity';
import { CheckoutSession } from './entities/checkout-session.entity';
import { PaymentsService } from './payments.service';

@Resolver()
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Mutation(() => CheckoutSession)
  @UseGuards(GqlJwtAuthGuard)
  createCheckoutSession(
    @CurrentUser() user: User,
    @Args('orderId', { type: () => ID }) orderId: string,
  ) {
    return this.paymentsService.createCheckoutSession(orderId, user);
  }
}
