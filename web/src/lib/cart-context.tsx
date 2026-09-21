'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  addToCart as addToCartStorage,
  clearCart as clearCartStorage,
  getCartServerSnapshot,
  getCartSnapshot,
  removeFromCart as removeFromCartStorage,
  subscribeToCart,
  updateCartQuantity as updateCartQuantityStorage,
} from './cart-storage';
import type { CartItem } from './types';

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1) =>
      addToCartStorage(item, quantity),
    [],
  );
  const updateQuantity = useCallback(
    (productId: string, quantity: number) =>
      updateCartQuantityStorage(productId, quantity),
    [],
  );
  const removeItem = useCallback(
    (productId: string) => removeFromCartStorage(productId),
    [],
  );
  const clear = useCallback(() => clearCartStorage(), []);

  const totalCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items],
  );
  const totalPrice = useMemo(
    () => items.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{ items, totalCount, totalPrice, addItem, updateQuantity, removeItem, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
