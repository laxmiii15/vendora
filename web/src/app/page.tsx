'use client';

import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { CategoryStrip } from '@/components/category-strip';
import { ErrorState } from '@/components/error-state';
import { Header } from '@/components/header';
import { LoadingState } from '@/components/loading-state';
import { ProductGrid } from '@/components/product-grid';
import { GET_CATEGORIES, GET_PRODUCTS } from '@/graphql/queries';
import type { GetCategoriesData, GetProductsData } from '@/lib/types';

export default function Home() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const categoriesResult = useQuery<GetCategoriesData>(GET_CATEGORIES);
  const productsResult = useQuery<GetProductsData>(GET_PRODUCTS);

  const loading = categoriesResult.loading || productsResult.loading;
  const error = categoriesResult.error ?? productsResult.error;

  const categories = categoriesResult.data?.getCategories ?? [];

  // Anonymous visitors should only ever see live, purchasable products —
  // `getProducts` doesn't filter server-side, so DRAFT/ARCHIVED are excluded here.
  const activeProducts = (productsResult.data?.getProducts ?? []).filter(
    (product) => product.status !== 'DRAFT' && product.status !== 'ARCHIVED',
  );
  const visibleProducts = selectedCategoryId
    ? activeProducts.filter(
        (product) => product.categoryId === selectedCategoryId,
      )
    : activeProducts;

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Shop everything.
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Browse products across every category on Vendora.
        </p>

        {loading && <LoadingState />}
        {error && <ErrorState message={error.message} />}
        {!loading && !error && (
          <>
            <CategoryStrip
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
            <ProductGrid products={visibleProducts} />
          </>
        )}
      </main>
    </div>
  );
}
