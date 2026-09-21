import Image from 'next/image';
import { categoryColor } from '@/lib/category-color';
import { formatPrice } from '@/lib/format-price';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.stock === 0 || product.status === 'OUT_OF_STOCK';
  const color = categoryColor(product.categoryId);
  const initials = product.name.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-rule bg-surface p-4 shadow-sm">
      <div className="relative aspect-square overflow-hidden rounded-xl">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center text-2xl font-semibold text-white ${color.tile}`}
          >
            {initials}
          </div>
        )}
        {isOutOfStock && (
          <span className="absolute top-2 left-2 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
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
        <h3 className="leading-snug font-medium text-ink">{product.name}</h3>
      </div>

      <div className="mt-auto flex items-center justify-between text-sm">
        <span className="font-semibold text-ink">{formatPrice(product.price)}</span>
        {!isOutOfStock && (
          <span className="text-ink-muted">{product.stock} in stock</span>
        )}
      </div>
    </div>
  );
}
