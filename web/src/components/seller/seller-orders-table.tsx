'use client';

import {
  Badge,
  EmptyRow,
  formatDate,
  formatLabel,
  statusTone,
  table,
} from '@/components/admin/admin-ui';
import { formatPrice } from '@/lib/format-price';
import type { SellerOrder } from '@/lib/types';

// Read-only: order status is managed by admins (an order can contain items
// from several sellers but has a single status).
export function SellerOrdersTable({
  orders,
  loading,
  emptyMessage = 'No orders yet.',
}: {
  orders: SellerOrder[];
  loading: boolean;
  emptyMessage?: string;
}) {
  return (
    <div className={table.wrap}>
      <table className={table.table}>
        <thead>
          <tr>
            <th className={table.th}>Order</th>
            <th className={table.th}>Date</th>
            <th className={table.th}>Your items</th>
            <th className={table.th}>Status</th>
            <th className={`${table.th} text-right`}>Your subtotal</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <EmptyRow colSpan={5}>{loading ? 'Loading…' : emptyMessage}</EmptyRow>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td className={`${table.td} font-mono text-xs`}>
                  #{order.id.slice(-8)}
                </td>
                <td className={table.td}>{formatDate(order.createdAt)}</td>
                <td className={table.td}>
                  <ul className="flex flex-col gap-0.5">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity} × {item.product?.name ?? 'Unknown product'}
                        {item.product?.size && (
                          <span className="text-ink-muted"> ({item.product.size})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className={table.td}>
                  <Badge tone={statusTone[order.status]}>
                    {formatLabel(order.status)}
                  </Badge>
                </td>
                <td className={`${table.td} text-right`}>
                  {formatPrice(order.subtotal)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
