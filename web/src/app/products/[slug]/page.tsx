'use client';

import { useQuery } from '@apollo/client/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '@/components/error-state';
import { Header } from '@/components/header';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { GET_PRODUCT_BY_SLUG } from '@/graphql/queries';
import { categoryColor } from '@/lib/category-color';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format-price';
import type { GetProductBySlugData } from '@/lib/types';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error } = useQuery<GetProductBySlugData>(
    GET_PRODUCT_BY_SLUG,
    { variables: { slug } },
  );
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const product = data?.productBySlug;
  const isOutOfStock =
    product && (product.stock === 0 || product.status === 'OUT_OF_STOCK');

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      size: product.size,
      categoryId: product.categoryId,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        {loading && <LoadingState />}
        {error && <ErrorState message={error.message} />}

        {product && (
          <>
            <Link
              href="/#shop"
              className="text-sm font-medium text-ink-muted hover:text-ink"
            >
              &larr; Back to shop
            </Link>

            <div className="mt-6 grid gap-10 sm:grid-cols-2">
              <div className="relative aspect-square overflow-hidden bg-[#f5f5f5]">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-contain p-6"
                    priority
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center text-5xl font-semibold text-ink-muted ${categoryColor(product.categoryId).tile}`}
                  >
                    {product.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {isOutOfStock && (
                  <span className="absolute top-3 left-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold tracking-wide text-surface uppercase">
                    Out of stock
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {product.category && (
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${categoryColor(product.categoryId).pill}`}
                  >
                    {product.category.name}
                  </span>
                )}

                <h1 className="font-display text-3xl font-semibold text-ink">
                  {product.name}
                </h1>

                <p className="text-2xl font-semibold text-ink">
                  {formatPrice(product.price)}
                </p>

                {product.description && (
                  <p className="text-ink-muted">{product.description}</p>
                )}

                <dl className="grid grid-cols-2 gap-4 border-t border-b border-rule py-4 text-sm">
                  <div>
                    <dt className="text-ink-faint">Size</dt>
                    <dd className="mt-1 font-medium text-ink">{product.size}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-faint">Availability</dt>
                    <dd className="mt-1 font-medium text-ink">
                      {isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}
                    </dd>
                  </div>
                </dl>

                <Button
                  type="button"
                  variant={added ? 'secondary' : 'primary'}
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="w-full"
                >
                  {added ? 'Added ✓' : 'Add to cart'}
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
