import { categoryColor } from '@/lib/category-color';
import { formatPrice } from '@/lib/format-price';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.stock === 0 || product.status === 'OUT_OF_STOCK';
  const color = categoryColor(product.categoryId);
  const initials = product.name.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <div
        className={`flex aspect-square items-center justify-center rounded-lg text-2xl font-semibold text-white ${color.tile}`}
      >
        {initials}
      </div>

      <div className="flex flex-col gap-1">
        {product.category && (
          <span
            className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${color.pill}`}
          >
            {product.category.name}
          </span>
        )}
        <h3 className="font-medium leading-snug">{product.name}</h3>
      </div>

      <div className="mt-auto flex items-center justify-between text-sm">
        <span className="font-semibold">{formatPrice(product.price)}</span>
        <span
          className={
            isOutOfStock
              ? 'text-red-600 dark:text-red-400'
              : 'text-zinc-500 dark:text-zinc-400'
          }
        >
          {isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}
        </span>
      </div>
    </div>
  );
}
