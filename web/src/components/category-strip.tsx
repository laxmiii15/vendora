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
    <div className="flex gap-4 overflow-x-auto pb-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex h-32 w-40 flex-shrink-0 items-end rounded-2xl border p-3 text-left transition-colors ${
          selectedId === null
            ? 'border-brand bg-brand-soft'
            : 'border-rule bg-surface-sunken hover:bg-rule'
        }`}
      >
        <span className="text-sm font-semibold text-ink">All</span>
      </button>

      {categories.map((category) => {
        const isSelected = category.id === selectedId;
        const color = categoryColor(category.id);
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(isSelected ? null : category.id)}
            className={`group relative h-32 w-40 flex-shrink-0 overflow-hidden rounded-2xl transition-shadow ${
              isSelected ? 'ring-brand ring-offset-paper ring-2 ring-offset-2' : ''
            }`}
          >
            <div
              className={`absolute inset-0 ${color.tile} opacity-90 transition-opacity group-hover:opacity-100`}
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink">
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
