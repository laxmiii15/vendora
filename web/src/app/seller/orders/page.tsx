'use client';

import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import {
  PAGE_SIZE,
  PageHeader,
  Pagination,
  Select,
  Toolbar,
  formatLabel,
} from '@/components/admin/admin-ui';
import { ErrorState } from '@/components/error-state';
import { SellerOrdersTable } from '@/components/seller/seller-orders-table';
import { SELLER_ORDERS } from '@/graphql/seller';
import type { OrderStatus, SellerOrdersData } from '@/lib/types';

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function SellerOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, loading, error } = useQuery<SellerOrdersData>(SELLER_ORDERS, {
    variables: { page, pageSize: PAGE_SIZE, status: status || undefined },
    fetchPolicy: 'cache-and-network',
  });

  if (error) return <ErrorState message={error.message} />;

  const result = data?.sellerOrders;

  return (
    <>
      <PageHeader
        title="Orders"
        description="Orders that include your products. Only your items are shown; order status is updated by the store team."
      />

      <Toolbar>
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

      <SellerOrdersTable
        orders={result?.items ?? []}
        loading={loading}
        emptyMessage="No orders match this filter."
      />

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
