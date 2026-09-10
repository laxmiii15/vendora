import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';

@Controller('webhooks/stripe')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw request body');
    }

    return this.paymentsService.handleWebhookEvent(req.rawBody, signature);
  }
}
