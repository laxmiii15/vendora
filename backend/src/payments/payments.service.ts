import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(secretKey);
  }

  async createCheckoutSession(orderId: string, requester: User) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== requester.id) {
      throw new ForbiddenException(
        'You do not have permission to pay for this order',
      );
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Order cannot be paid — current status is ${order.status}`,
      );
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL is not configured');
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: order.items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.product.name },
          // Stripe expects the smallest currency unit (cents for USD).
          // Product.price/unitPrice's unit was never confirmed elsewhere in
          // the codebase — assuming whole dollars here (matching the
          // frontend's formatPrice). Revisit both together if that changes.
          unit_amount: item.unitPrice * 100,
        },
        quantity: item.quantity,
      })),
      success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout/cancel`,
      metadata: {
        orderId: order.id,
      },
    });

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }

    return { url: session.url };
  }
  async handleWebhookEvent(rawBody: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(
        `Webhook signature verification failed: ${(err as Error).message}`,
      );
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        });
      }
    }

    return { received: true };
  }
}
