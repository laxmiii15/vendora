// The backend's Prisma column `Product.price` is an Int, but GraphQL exposes
// it as Float, and nothing in the codebase confirms whether it's whole
// currency units or minor units (cents). Do NOT divide by 100 here until
// that's confirmed — doing so silently would misrepresent every price on the
// site. Render the raw number as-is for now; this is the one place to fix
// once the unit is confirmed.
export function formatPrice(rawPrice: number): string {
  return `$${rawPrice.toFixed(2)}`;
}
