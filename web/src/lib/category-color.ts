// Deterministic color assigned per category (hashed from its id), so a
// product's placeholder tile and its category's pill always match — a stand-in
// for real product photography, which the schema doesn't support yet.
const PALETTE = [
  { pill: 'bg-rose-100 text-rose-700', tile: 'bg-rose-500' },
  { pill: 'bg-amber-100 text-amber-700', tile: 'bg-amber-500' },
  { pill: 'bg-emerald-100 text-emerald-700', tile: 'bg-emerald-500' },
  { pill: 'bg-sky-100 text-sky-700', tile: 'bg-sky-500' },
  { pill: 'bg-violet-100 text-violet-700', tile: 'bg-violet-500' },
  { pill: 'bg-pink-100 text-pink-700', tile: 'bg-pink-500' },
  { pill: 'bg-teal-100 text-teal-700', tile: 'bg-teal-500' },
  { pill: 'bg-orange-100 text-orange-700', tile: 'bg-orange-500' },
] as const;

export function categoryColor(categoryId: string) {
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = (hash * 31 + categoryId.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
