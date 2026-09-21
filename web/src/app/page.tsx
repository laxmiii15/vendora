'use client';

import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { CategoryStrip } from '@/components/category-strip';
import { ErrorState } from '@/components/error-state';
import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
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

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <Hero />
      <main id="shop" className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        {loading && <LoadingState />}
        {error && <ErrorState message={error.message} />}
        {!loading && !error && (
          <>
            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Shop by category
              </h2>
              <div className="mt-4">
                <CategoryStrip
                  categories={categories}
                  selectedId={selectedCategoryId}
                  onSelect={setSelectedCategoryId}
                />
              </div>
            </section>

            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-ink">
                {selectedCategory ? selectedCategory.name : 'All products'}
              </h2>
              <div className="mt-4">
                <ProductGrid products={visibleProducts} />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
