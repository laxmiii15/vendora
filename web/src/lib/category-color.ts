// Deterministic color assigned per category (hashed from its id), so a
// product's placeholder tile and its category's pill always match — a stand-in
// for real product photography where none exists. Hand-picked neutral greys to stay consistent with the site's monochrome palette.
const PALETTE = [
  { pill: 'bg-[#f5f5f5] text-[#212121]', tile: 'bg-[#f5f5f5]' },
  { pill: 'bg-[#f5f5f5] text-[#212121]', tile: 'bg-[#f0f0f0]' },
  { pill: 'bg-[#f5f5f5] text-[#212121]', tile: 'bg-[#ebebeb]' },
  { pill: 'bg-[#f5f5f5] text-[#212121]', tile: 'bg-[#f3f3f3]' },
  { pill: 'bg-[#f5f5f5] text-[#212121]', tile: 'bg-[#eeeeee]' },
  { pill: 'bg-[#f5f5f5] text-[#212121]', tile: 'bg-[#f7f7f7]' },
  { pill: 'bg-[#f5f5f5] text-[#212121]', tile: 'bg-[#e9e9e9]' },
  { pill: 'bg-[#f5f5f5] text-[#212121]', tile: 'bg-[#f1f1f1]' },
] as const;

export function categoryColor(categoryId: string) {
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = (hash * 31 + categoryId.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
