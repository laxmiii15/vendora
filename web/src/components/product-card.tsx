'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { categoryColor } from '@/lib/category-color';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format-price';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.stock === 0 || product.status === 'OUT_OF_STOCK';
  const color = categoryColor(product.categoryId);
  const initials = product.name.slice(0, 2).toUpperCase();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
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
    <div className="flex flex-col gap-3 bg-surface">
      <Link href={`/products/${product.slug}`} className="flex flex-col gap-3">
        <div className="relative aspect-square overflow-hidden bg-[#f5f5f5]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-contain p-4"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center text-2xl font-semibold text-ink-muted ${color.tile}`}
            >
              {initials}
            </div>
          )}
          {isOutOfStock && (
            <span className="absolute top-2 left-2 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-surface uppercase">
              Out of stock
            </span>
          )}
          <span className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-ink">
            {product.size}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {product.category && (
            <span
              className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${color.pill}`}
            >
              {product.category.name}
            </span>
          )}
          <h3 className="leading-snug font-medium text-ink hover:text-brand-ink">
            {product.name}
          </h3>
        </div>
      </Link>

      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="font-semibold text-ink">{formatPrice(product.price)}</span>
        <Button
          type="button"
          variant={added ? 'secondary' : 'primary'}
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="px-4 py-1.5 text-xs"
        >
          {added ? 'Added ✓' : 'Add to cart'}
        </Button>
      </div>
    </div>
  );
}
