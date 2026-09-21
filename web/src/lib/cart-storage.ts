import type { CartItem } from './types';

const CART_KEY = 'vendora_cart';
const EMPTY_CART: CartItem[] = [];

function readCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return EMPTY_CART;
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}

let cachedCart: CartItem[] = readCartFromStorage();
const listeners = new Set<() => void>();

function persist(next: CartItem[]) {
  cachedCart = next;
  localStorage.setItem(CART_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function subscribeToCart(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getCartSnapshot(): CartItem[] {
  return cachedCart;
}

export function getCartServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

export function addToCart(item: Omit<CartItem, 'quantity'>, quantity = 1) {
  const existing = cachedCart.find((line) => line.productId === item.productId);
  if (existing) {
    persist(
      cachedCart.map((line) =>
        line.productId === item.productId
          ? { ...line, quantity: line.quantity + quantity }
          : line,
      ),
    );
  } else {
    persist([...cachedCart, { ...item, quantity }]);
  }
}

export function updateCartQuantity(productId: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  persist(
    cachedCart.map((line) =>
      line.productId === productId ? { ...line, quantity } : line,
    ),
  );
}

export function removeFromCart(productId: string) {
  persist(cachedCart.filter((line) => line.productId !== productId));
}

export function clearCart() {
  persist([]);
}
