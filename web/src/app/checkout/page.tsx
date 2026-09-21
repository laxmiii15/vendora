'use client';

import { useMutation } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { CREATE_CHECKOUT_SESSION, CREATE_ORDER } from '@/graphql/mutations';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format-price';
import type { CreateCheckoutSessionData, CreateOrderData } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalPrice, clear } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [runCreateOrder] = useMutation<CreateOrderData>(CREATE_ORDER);
  const [runCreateCheckoutSession] =
    useMutation<CreateCheckoutSessionData>(CREATE_CHECKOUT_SESSION);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  async function handlePlaceOrder() {
    setError(null);
    setIsProcessing(true);
    try {
      const { data: orderData } = await runCreateOrder({
        variables: {
          items: items.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
          })),
        },
      });
      const orderId = orderData?.createOrder.id;
      if (!orderId) {
        throw new Error('Order was not created.');
      }

      // The order (and its stock decrement) already succeeded server-side at
      // this point, so the cart's job is done regardless of what happens next.
      clear();

      const { data: sessionData } = await runCreateCheckoutSession({
        variables: { orderId },
      });
      const url = sessionData?.createCheckoutSession.url;
      if (!url) {
        throw new Error('Could not start payment.');
      }

      window.location.href = url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Try again.',
      );
      setIsProcessing(false);
    }
  }

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 text-center">
          <p className="text-ink-muted">Your cart is empty.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <h1 className="font-display text-3xl font-semibold text-ink">Checkout</h1>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-rule bg-surface p-6">
          {items.map((line) => (
            <div key={line.productId} className="flex items-center justify-between text-sm">
              <span className="text-ink">
                {line.name} <span className="text-ink-muted">× {line.quantity}</span>
              </span>
              <span className="text-ink">{formatPrice(line.price * line.quantity)}</span>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-rule pt-3 text-lg">
            <span className="font-medium text-ink">Total</span>
            <span className="font-semibold text-ink">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className="mt-6 w-full"
        >
          {isProcessing ? 'Redirecting to payment…' : 'Place order & pay'}
        </Button>
        <p className="mt-3 text-center text-xs text-ink-faint">
          You&apos;ll be redirected to Stripe to complete payment.
        </p>
      </main>
    </div>
  );
}
