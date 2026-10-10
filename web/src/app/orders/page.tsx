'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Badge,
  PAGE_SIZE,
  Pagination,
  formatDate,
  formatLabel,
  statusTone,
} from '@/components/admin/admin-ui';
import { ErrorState } from '@/components/error-state';
import { Header } from '@/components/header';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { GET_MY_ORDERS } from '@/graphql/queries';
import { useAuth } from '@/lib/auth-context';
import { formatPrice } from '@/lib/format-price';
import type { MyOrdersData } from '@/lib/types';

export default function MyOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data, loading, error } = useQuery<MyOrdersData>(GET_MY_ORDERS, {
    variables: { page, pageSize: PAGE_SIZE },
    skip: !user,
    // Statuses change server-side (payment webhook, admin), so don't trust
    // a cached list from earlier in the session.
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const orders = data?.myOrders;

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="font-display text-3xl font-semibold text-ink">My orders</h1>

        {loading && !orders && <LoadingState />}
        {error && <ErrorState message={error.message} />}

        {orders && orders.items.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-ink-muted">You haven&apos;t placed any orders yet.</p>
            <Link href="/#shop" className="mt-6 inline-block">
              <Button>Start shopping</Button>
            </Link>
          </div>
        )}

        {orders && orders.items.length > 0 && (
          <>
            <ul className="mt-8 flex flex-col gap-3">
              {orders.items.map((order) => {
                const itemCount =
                  order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
                return (
                  <li key={order.id}>
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 border border-rule bg-surface p-5 transition-colors hover:border-ink"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="mt-1 text-xs text-ink-muted">
                          {formatDate(order.createdAt)} · {itemCount}{' '}
                          {itemCount === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge tone={statusTone[order.status]}>
                          {formatLabel(order.status)}
                        </Badge>
                        <span className="text-sm font-semibold text-ink">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Pagination
              page={orders.page}
              pageSize={orders.pageSize}
              total={orders.total}
              onPageChange={setPage}
            />
          </>
        )}
      </main>
    </div>
  );
}
