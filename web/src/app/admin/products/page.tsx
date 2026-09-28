'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
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
  formatLabel,
  statusTone,
  table,
  useDebouncedValue,
} from '@/components/admin/admin-ui';
import { Drawer } from '@/components/admin/drawer';
import { ProductForm } from '@/components/admin/product-form';
import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import { ADMIN_PRODUCTS, DELETE_PRODUCT, UPDATE_PRODUCT } from '@/graphql/admin';
import { formatPrice } from '@/lib/format-price';
import type { AdminProduct, AdminProductsData, ProductStatus } from '@/lib/types';

const PRODUCT_STATUSES: ProductStatus[] = ['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'];

// `null` = drawer closed, 'new' = create form, otherwise the product to edit.
type Editing = null | 'new' | AdminProduct;

export default function AdminProductsPage() {
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Editing>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const { data, loading, error } = useQuery<AdminProductsData>(ADMIN_PRODUCTS, {
    variables: {
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: status || undefined,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [runUpdate] = useMutation(UPDATE_PRODUCT, { refetchQueries: ['AdminStats'] });
  const [runDelete] = useMutation(DELETE_PRODUCT, {
    refetchQueries: ['AdminProducts', 'AdminStats'],
  });

  async function handleArchive(product: AdminProduct) {
    setActionError(null);
    try {
      await runUpdate({ variables: { id: product.id, input: { status: 'ARCHIVED' } } });
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  async function handleDelete(product: AdminProduct) {
    if (!window.confirm(`Permanently delete "${product.name}"? This cannot be undone.`)) {
      return;
    }
    setActionError(null);
    try {
      await runDelete({ variables: { id: product.id } });
    } catch {
      // Products that appear in past orders are referenced by OrderItem, so
      // the database refuses the delete. Archiving is the safe alternative.
      setActionError(
        `"${product.name}" couldn't be deleted — it is probably part of existing orders. Archive it instead to hide it from the store.`,
      );
    }
  }

  if (error) return <ErrorState message={error.message} />;

  const result = data?.adminProducts;
  const products = result?.items ?? [];

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage the full catalogue, including drafts and archived items"
        action={<Button onClick={() => setEditing('new')}>New product</Button>}
      />

      <Toolbar>
        <SearchField
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by name or slug"
        />
        <Select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ProductStatus | '');
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {PRODUCT_STATUSES.map((value) => (
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
              <th className={table.th}>Product</th>
              <th className={table.th}>Category</th>
              <th className={table.th}>Size</th>
              <th className={`${table.th} text-right`}>Price</th>
              <th className={`${table.th} text-right`}>Stock</th>
              <th className={table.th}>Status</th>
              <th className={`${table.th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <EmptyRow colSpan={7}>
                {loading ? 'Loading…' : 'No products match these filters.'}
              </EmptyRow>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className={table.td}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden bg-surface-sunken">
                        {product.imageUrl && (
                          // Plain <img>: admin-entered URLs can be on any host,
                          // which next/image would reject unless allow-listed.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-ink-muted">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className={table.td}>{product.category?.name ?? '—'}</td>
                  <td className={table.td}>{product.size}</td>
                  <td className={`${table.td} text-right`}>{formatPrice(product.price)}</td>
                  <td
                    className={`${table.td} text-right ${
                      product.stock <= 5 ? 'font-semibold text-warning' : ''
                    }`}
                  >
                    {product.stock}
                  </td>
                  <td className={table.td}>
                    <Badge tone={statusTone[product.status]}>
                      {formatLabel(product.status)}
                    </Badge>
                  </td>
                  <td className={`${table.td} whitespace-nowrap text-right`}>
                    <div className="flex justify-end gap-3 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setEditing(product)}
                        className="text-ink hover:underline"
                      >
                        Edit
                      </button>
                      {product.status !== 'ARCHIVED' && (
                        <button
                          type="button"
                          onClick={() => handleArchive(product)}
                          className="text-ink-muted hover:underline"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="text-danger hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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

      {editing && (
        <Drawer
          title={editing === 'new' ? 'New product' : 'Edit product'}
          onClose={() => setEditing(null)}
        >
          <ProductForm
            // Remount per product so the form's initial state resets.
            key={editing === 'new' ? 'new' : editing.id}
            product={editing === 'new' ? undefined : editing}
            onDone={() => setEditing(null)}
          />
        </Drawer>
      )}
    </>
  );
}
