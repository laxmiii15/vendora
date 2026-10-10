// Prices from the backend (`price`, `unitPrice`, `total`) are whole US dollars
// stored as Int — not cents — so the raw number is rendered as-is.
export function formatPrice(rawPrice: number): string {
  return `$${rawPrice.toFixed(2)}`;
}
