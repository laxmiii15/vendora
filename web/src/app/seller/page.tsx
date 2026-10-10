'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { PageHeader, StatCard } from '@/components/admin/admin-ui';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { SellerOrdersTable } from '@/components/seller/seller-orders-table';
import { SELLER_ORDERS, SELLER_STATS } from '@/graphql/seller';
import { formatPrice } from '@/lib/format-price';
import type { SellerOrdersData, SellerStatsData } from '@/lib/types';

export default function SellerDashboardPage() {
  const stats = useQuery<SellerStatsData>(SELLER_STATS, {
    fetchPolicy: 'cache-and-network',
  });
  const recent = useQuery<SellerOrdersData>(SELLER_ORDERS, {
    variables: { page: 1, pageSize: 5 },
    fetchPolicy: 'cache-and-network',
  });

  if (stats.loading && !stats.data) return <LoadingState />;
  if (stats.error) return <ErrorState message={stats.error.message} />;

  const s = stats.data?.sellerStats;

  return (
    <>
      <PageHeader title="Dashboard" description="How your listings are doing" />

      {s && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Revenue" value={formatPrice(s.revenue)} />
          <StatCard label="Orders" value={s.orderCount} href="/seller/orders" />
          <StatCard
            label="Paid, awaiting shipment"
            value={s.awaitingShipmentCount}
            href="/seller/orders"
            highlight={s.awaitingShipmentCount > 0}
          />
          <StatCard
            label="Active products"
            value={s.activeProductCount}
            href="/seller/products"
          />
          <StatCard
            label="Low stock (≤ 5)"
            value={s.lowStockCount}
            href="/seller/products"
            highlight={s.lowStockCount > 0}
          />
        </div>
      )}

      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-ink">
          Recent orders
        </h2>
        <Link href="/seller/orders" className="text-sm text-ink-muted hover:text-ink">
          View all →
        </Link>
      </div>

      <SellerOrdersTable
        orders={recent.data?.sellerOrders.items ?? []}
        loading={recent.loading}
      />
    </>
  );
}
