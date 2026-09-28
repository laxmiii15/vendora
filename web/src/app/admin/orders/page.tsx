'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { Fragment, use, useState } from 'react';
import {
  Badge,
  EmptyRow,
  InlineError,
  PAGE_SIZE,
  PageHeader,
  Pagination,
  SearchField,
  Select,
  Toolbar,
  errorMessage,
  formatDate,
  formatLabel,
  statusTone,
  table,
  useDebouncedValue,
} from '@/components/admin/admin-ui';
import { ErrorState } from '@/components/error-state';
import { ADMIN_ORDERS, UPDATE_ORDER_STATUS } from '@/graphql/admin';
import { formatPrice } from '@/lib/format-price';
import type { AdminOrdersData, OrderStatus } from '@/lib/types';

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

function isOrderStatus(value: unknown): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

export default function AdminOrdersPage({ searchParams }: PageProps<'/admin/orders'>) {
  // Lets the dashboard deep-link to e.g. /admin/orders?status=PENDING.
  const initialStatus = use(searchParams).status;
  const [status, setStatus] = useState<OrderStatus | ''>(
    isOrderStatus(initialStatus) ? initialStatus : '',
  );
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const { data, loading, error } = useQuery<AdminOrdersData>(ADMIN_ORDERS, {
    variables: {
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: status || undefined,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [runUpdateStatus, { loading: updating }] = useMutation(UPDATE_ORDER_STATUS);

  async function handleStatusChange(id: string, next: OrderStatus) {
    setActionError(null);
    try {
      // The mutation returns { id, status }, so Apollo updates the cached
      // order in place — no refetch needed.
      await runUpdateStatus({ variables: { id, status: next } });
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  if (error) return <ErrorState message={error.message} />;

  const result = data?.adminOrders;
  const orders = result?.items ?? [];

  return (
    <>
      <PageHeader title="Orders" description="View orders and update fulfilment status" />

      <Toolbar>
        <SearchField
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by order ID or email"
        />
        <Select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as OrderStatus | '');
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {formatLabel(value)}
            </option>
          ))}
        </Select>
      </Toolbar>

      <InlineError message={actionError} />

      <div className={table.wrap}>
        <table className={table.table}>
          <thead>
            <tr>
              <th className={table.th}>Order</th>
              <th className={table.th}>Customer</th>
              <th className={table.th}>Date</th>
              <th className={table.th}>Items</th>
              <th className={`${table.th} text-right`}>Total</th>
              <th className={table.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <EmptyRow colSpan={6}>
                {loading ? 'Loading…' : 'No orders match these filters.'}
              </EmptyRow>
            ) : (
              orders.map((order) => {
                const isOpen = expanded === order.id;
                const itemCount =
                  order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
                return (
                  <Fragment key={order.id}>
                    <tr>
                      <td className={table.td}>
                        <button
                          type="button"
                          onClick={() => setExpanded(isOpen ? null : order.id)}
                          aria-expanded={isOpen}
                          className="font-mono text-xs text-ink hover:underline"
                        >
                          {isOpen ? '▾' : '▸'} #{order.id.slice(-8)}
                        </button>
                      </td>
                      <td className={table.td}>
                        <div>{order.customer?.email ?? '—'}</div>
                        {order.customer?.firstName && (
                          <div className="text-xs text-ink-muted">
                            {order.customer.firstName} {order.customer.lastName}
                          </div>
                        )}
                      </td>
                      <td className={table.td}>{formatDate(order.createdAt)}</td>
                      <td className={table.td}>{itemCount}</td>
                      <td className={`${table.td} text-right`}>
                        {formatPrice(order.total)}
                      </td>
                      <td className={table.td}>
                        <div className="flex items-center gap-2">
                          <Badge tone={statusTone[order.status]}>
                            {formatLabel(order.status)}
                          </Badge>
                          <Select
                            value={order.status}
                            disabled={updating}
                            onChange={(event) =>
                              handleStatusChange(
                                order.id,
                                event.target.value as OrderStatus,
                              )
                            }
                            aria-label={`Change status of order ${order.id}`}
                            className="h-8 text-xs"
                          >
                            {ORDER_STATUSES.map((value) => (
                              <option key={value} value={value}>
                                {formatLabel(value)}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={6} className="border-b border-rule bg-surface-sunken px-8 py-4">
                          <p className="mb-2 font-mono text-xs text-ink-muted">{order.id}</p>
                          <ul className="flex flex-col gap-1 text-sm">
                            {order.items?.map((item) => (
                              <li key={item.id} className="flex justify-between gap-4">
                                <span>
                                  {item.product?.name ?? 'Deleted product'}
                                  {item.product?.size && (
                                    <span className="text-ink-muted"> · {item.product.size}</span>
                                  )}{' '}
                                  <span className="text-ink-muted">× {item.quantity}</span>
                                </span>
                                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {result && (
        <Pagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          onPageChange={setPage}
        />
      )}
    </>
  );
}
