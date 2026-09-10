import { categoryColor } from '@/lib/category-color';
import type { Category } from '@/lib/types';

interface CategoryStripProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryStrip({
  categories,
  selectedId,
  onSelect,
}: CategoryStripProps) {
  return (
    <div className="flex flex-wrap gap-2 py-4">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
          selectedId === null
            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
        }`}
      >
        All
      </button>
      {categories.map((category) => {
        const isSelected = category.id === selectedId;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(isSelected ? null : category.id)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              isSelected
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : `${categoryColor(category.id).pill} hover:opacity-80`
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
