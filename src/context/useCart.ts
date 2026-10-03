import { createContext, useContext } from 'react';
import type { CartItem, Product } from '../types';

export interface AddToCartInput {
  product: Product;
  size: string;
  color: string;
  quantity?: number;
}

export interface CartContextValue {
  items: CartItem[];
  /** Total number of units in the cart. */
  count: number;
  subtotal: number;
  addItem: (input: AddToCartInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

/** Stable identity for a product + variant, so sizes/colours never collide. */
export function variantKey(productId: string, size: string, color: string) {
  return `${productId}::${size}::${color}`;
}
