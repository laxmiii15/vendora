'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Badge,
  InlineError,
  errorMessage,
  formatDate,
  formatLabel,
  statusTone,
} from '@/components/admin/admin-ui';
import { ErrorState } from '@/components/error-state';
import { Header } from '@/components/header';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { CANCEL_MY_ORDER, CREATE_CHECKOUT_SESSION } from '@/graphql/mutations';
import { GET_ORDER } from '@/graphql/queries';
import { useAuth } from '@/lib/auth-context';
import { formatPrice } from '@/lib/format-price';
import type {
  CancelMyOrderData,
  CreateCheckoutSessionData,
  OrderData,
} from '@/lib/types';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const { data, loading, error } = useQuery<OrderData>(GET_ORDER, {
    variables: { id },
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const [runCancel, { loading: isCancelling }] =
    useMutation<CancelMyOrderData>(CANCEL_MY_ORDER);
  const [runCreateCheckoutSession] =
    useMutation<CreateCheckoutSessionData>(CREATE_CHECKOUT_SESSION);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const order = data?.order;

  async function handlePay() {
    setActionError(null);
    setIsPaying(true);
    try {
      const { data: sessionData } = await runCreateCheckoutSession({
        variables: { orderId: id },
      });
      const url = sessionData?.createCheckoutSession.url;
      if (!url) {
        throw new Error('Could not start payment.');
      }
      window.location.href = url;
    } catch (err) {
      setActionError(errorMessage(err));
      setIsPaying(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;
    setActionError(null);
    try {
      // The mutation returns { id, status }, which Apollo merges into the
      // cached order, so the badge updates without a refetch.
      await runCancel({ variables: { id } });
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Link
          href="/orders"
          className="text-sm font-medium text-ink-muted hover:text-ink"
        >
          &larr; All orders
        </Link>

        {loading && !order && <LoadingState />}
        {error && <ErrorState message={error.message} />}

        {order && (
          <>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-semibold text-ink">
                  Order #{order.id.slice(-8).toUpperCase()}
                </h1>
                <p className="mt-1 text-sm text-ink-muted">
                  Placed {formatDate(order.createdAt)}
                </p>
              </div>
              <Badge tone={statusTone[order.status]}>
                {formatLabel(order.status)}
              </Badge>
            </div>

            <ul className="mt-8 flex flex-col divide-y divide-rule border border-rule bg-surface">
              {order.items?.map((item) => (
                <li key={item.id} className="flex items-center gap-4 p-4">
                  <div className="relative h-16 w-16 shrink-0 bg-surface-sunken">
                    {item.product?.imageUrl && (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">
                      {item.product?.name ?? 'Product no longer available'}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {item.product?.size && <>Size {item.product.size} · </>}
                      {formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-ink">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
              <li className="flex items-center justify-between p-4 text-lg">
                <span className="font-medium text-ink">Total</span>
                <span className="font-semibold text-ink">
                  {formatPrice(order.total)}
                </span>
              </li>
            </ul>

            {order.status === 'PENDING' && (
              <div className="mt-6">
                <InlineError message={actionError} />
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handlePay} disabled={isPaying || isCancelling}>
                    {isPaying ? 'Redirecting to payment…' : 'Complete payment'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isPaying || isCancelling}
                  >
                    {isCancelling ? 'Cancelling…' : 'Cancel order'}
                  </Button>
                </div>
                <p className="mt-3 text-xs text-ink-faint">
                  This order is awaiting payment. Cancelling releases the
                  reserved items.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
