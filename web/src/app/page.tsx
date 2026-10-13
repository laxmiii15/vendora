'use client';

import { useQuery } from '@apollo/client/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Pagination } from '@/components/admin/admin-ui';
import { CategoryStrip } from '@/components/category-strip';
import { ErrorState } from '@/components/error-state';
import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { LoadingState } from '@/components/loading-state';
import { ProductGrid } from '@/components/product-grid';
import { GET_CATEGORIES, GET_PRODUCTS } from '@/graphql/queries';
import type { GetCategoriesData, GetProductsData } from '@/lib/types';

// 12 fills rows of 2, 3 or 4 columns evenly.
const SHOP_PAGE_SIZE = 12;

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get('category');
  const searchTerm = searchParams.get('q')?.trim() || null;
  const parsedPage = Number(searchParams.get('page'));
  const page = Number.isInteger(parsedPage) && parsedPage > 1 ? parsedPage : 1;

  // Category and page live in the URL so back, refresh and shared links keep
  // them. Changing the category drops `page`, starting again from page 1.
  const navigate = (changes: { category?: string | null; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (changes.category !== undefined) {
      if (changes.category) params.set('category', changes.category);
      else params.delete('category');
      params.delete('page');
    }
    if (changes.page !== undefined) {
      if (changes.page > 1) params.set('page', String(changes.page));
      else params.delete('page');
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : '/', { scroll: false });
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  };

  const categoriesResult = useQuery<GetCategoriesData>(GET_CATEGORIES);
  const productsResult = useQuery<GetProductsData>(GET_PRODUCTS, {
    variables: {
      search: searchTerm,
      categoryId: selectedCategoryId,
      page,
      pageSize: SHOP_PAGE_SIZE,
    },
  });

  // Keep showing the current page while the next one loads, instead of
  // swapping the whole shop for a spinner.
  const productPage =
    productsResult.data?.getProducts ??
    productsResult.previousData?.getProducts;
  const loading =
    categoriesResult.loading || (!productPage && productsResult.loading);
  const error = categoriesResult.error ?? productsResult.error;

  const categories = categoriesResult.data?.getCategories ?? [];
  // `getProducts` already excludes DRAFT/ARCHIVED and filters by category on the server.
  const visibleProducts = productPage?.items ?? [];

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
                  onSelect={(id) => navigate({ category: id })}
                />
              </div>
            </section>

            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-ink">
                {searchTerm
                  ? `Results for "${searchTerm}"`
                  : selectedCategory
                    ? selectedCategory.name
                    : 'All products'}
              </h2>
              <div className="mt-4">
                <ProductGrid products={visibleProducts} />
              </div>
              {productPage &&
                (productPage.total > productPage.pageSize || page > 1) && (
                  <Pagination
                    page={productPage.page}
                    pageSize={productPage.pageSize}
                    total={productPage.total}
                    // Clamped so "Previous" from a stale `?page=99` link
                    // lands on the last real page, not page 98.
                    onPageChange={(next) =>
                      navigate({
                        page: Math.min(
                          next,
                          Math.max(
                            1,
                            Math.ceil(productPage.total / productPage.pageSize),
                          ),
                        ),
                      })
                    }
                  />
                )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
