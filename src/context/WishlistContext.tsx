import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { readStorage, writeStorage, STORAGE_KEYS } from '../lib/storage';
import type { Product } from '../types';
import { WishlistContext } from './useWishlist';

/**
 * Wishlist state. Previously the heart button was decorative — it lived inside
 * a <Link> (so it navigated instead of saving) and there was no state at all.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(() =>
    readStorage<Product[]>(STORAGE_KEYS.wishlist, []),
  );

  useEffect(() => {
    writeStorage(STORAGE_KEYS.wishlist, items);
  }, [items]);

  const toggle = useCallback((product: Product) => {
    setItems((current) =>
      current.some((item) => item.id === product.id)
        ? current.filter((item) => item.id !== product.id)
        : [...current, product],
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const ids = items.map((item) => item.id);
    return {
      items,
      ids,
      isSaved: (productId: string) => ids.includes(productId),
      toggle,
      remove,
      clear,
    };
  }, [items, toggle, remove, clear]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
