import { createContext, useContext } from 'react';
import type { Product } from '../types';

export interface WishlistContextValue {
  items: Product[];
  ids: string[];
  isSaved: (productId: string) => boolean;
  toggle: (product: Product) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined,
);

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
