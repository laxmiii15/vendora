'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import {
  Badge,
  EmptyRow,
  PageHeader,
  formatDate,
  formatLabel,
  statusTone,
  table,
} from '@/components/admin/admin-ui';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { ADMIN_ORDERS, ADMIN_STATS } from '@/graphql/admin';
import { formatPrice } from '@/lib/format-price';
import type { AdminOrdersData, AdminStatsData } from '@/lib/types';

function StatCard({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: string | number;
  href?: string;
  highlight?: boolean;
}) {
  const body = (
    <div
      className={`h-full border bg-surface p-5 transition-colors ${
        highlight ? 'border-warning' : 'border-rule'
      } ${href ? 'hover:border-ink' : ''}`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default function AdminDashboardPage() {
  const stats = useQuery<AdminStatsData>(ADMIN_STATS, {
    fetchPolicy: 'cache-and-network',
  });
  const recent = useQuery<AdminOrdersData>(ADMIN_ORDERS, {
    variables: { page: 1, pageSize: 5 },
    fetchPolicy: 'cache-and-network',
  });

  if (stats.loading && !stats.data) return <LoadingState />;
  if (stats.error) return <ErrorState message={stats.error.message} />;

  const s = stats.data?.adminStats;
  const orders = recent.data?.adminOrders.items ?? [];

  return (
    <>
      <PageHeader title="Dashboard" description="Store overview" />

      {s && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Revenue" value={formatPrice(s.revenue)} />
          <StatCard label="Orders" value={s.orderCount} href="/admin/orders" />
          <StatCard
            label="Pending orders"
            value={s.pendingOrderCount}
            href="/admin/orders?status=PENDING"
            highlight={s.pendingOrderCount > 0}
          />
          <StatCard label="Customers" value={s.customerCount} href="/admin/users" />
          <StatCard
            label="Active products"
            value={s.activeProductCount}
            href="/admin/products"
          />
          <StatCard
            label="Low stock (≤ 5)"
            value={s.lowStockCount}
            href="/admin/products"
            highlight={s.lowStockCount > 0}
          />
        </div>
      )}

      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-ink">
          Recent orders
        </h2>
        <Link href="/admin/orders" className="text-sm text-ink-muted hover:text-ink">
          View all →
        </Link>
      </div>

      <div className={table.wrap}>
        <table className={table.table}>
          <thead>
            <tr>
              <th className={table.th}>Order</th>
              <th className={table.th}>Customer</th>
              <th className={table.th}>Date</th>
              <th className={table.th}>Status</th>
              <th className={`${table.th} text-right`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <EmptyRow colSpan={5}>
                {recent.loading ? 'Loading…' : 'No orders yet.'}
              </EmptyRow>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className={`${table.td} font-mono text-xs`}>
                    #{order.id.slice(-8)}
                  </td>
                  <td className={table.td}>{order.customer?.email ?? '—'}</td>
                  <td className={table.td}>{formatDate(order.createdAt)}</td>
                  <td className={table.td}>
                    <Badge tone={statusTone[order.status]}>
                      {formatLabel(order.status)}
                    </Badge>
                  </td>
                  <td className={`${table.td} text-right`}>
                    {formatPrice(order.total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
