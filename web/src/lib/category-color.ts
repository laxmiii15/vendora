// Deterministic color assigned per category (hashed from its id), so a
// product's placeholder tile and its category's pill always match — a stand-in
// for real product photography where none exists. Hand-picked soft, muted
// tones (not Tailwind's saturated defaults) to stay consistent with the
// site's dusty-rose, boutique palette.
const PALETTE = [
  { pill: 'bg-[#F8E8EC] text-[#8F4357]', tile: 'bg-[#C97B8C]' }, // dusty rose
  { pill: 'bg-[#F3E6ED] text-[#6E4258]', tile: 'bg-[#A8748A]' }, // mauve
  { pill: 'bg-[#FCEEEF] text-[#A85560]', tile: 'bg-[#E8A0A8]' }, // blush
  { pill: 'bg-[#EFEAF7] text-[#5D4A85]', tile: 'bg-[#A18FC7]' }, // soft lavender
  { pill: 'bg-[#E9F1E7] text-[#4F6B4A]', tile: 'bg-[#8FA888]' }, // soft sage
  { pill: 'bg-[#F6EAE2] text-[#8A5333]', tile: 'bg-[#C98B6B]' }, // terracotta
  { pill: 'bg-[#F7EFDD] text-[#8A6B2E]', tile: 'bg-[#C9A063]' }, // soft gold
  { pill: 'bg-[#EFE1E7] text-[#5C3547]', tile: 'bg-[#8A5A72]' }, // plum
] as const;

export function categoryColor(categoryId: string) {
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = (hash * 31 + categoryId.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
