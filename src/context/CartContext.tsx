import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { readStorage, writeStorage, STORAGE_KEYS } from '../lib/storage';
import { MAX_QUANTITY, MAX_TRIAL_ITEMS, roundRupees } from '../lib/format';
import type { CartItem } from '../types';
import { CartContext, variantKey } from './useCart';
import type { AddToCartInput } from './useCart';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Cart state.
 *
 * Fixes over the previous version:
 *  - items carry image/size/color, so the cart no longer hardcodes a photo and
 *    the text "Size: M | Color: White" for every line,
 *  - `quantity` from the caller is respected instead of always incrementing by 1,
 *  - variants of the same product are distinct lines,
 *  - the cart survives a page reload,
 *  - there is a `clear()` so checkout can empty it.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() =>
    readStorage<CartItem[]>(STORAGE_KEYS.cart, []),
  );

  useEffect(() => {
    writeStorage(STORAGE_KEYS.cart, items);
  }, [items]);

  const addItem = useCallback(
    ({ product, size, color, quantity = 1 }: AddToCartInput) => {
      setItems((current) => {
        const id = variantKey(product.id, size, color);
        const existing = current.find((item) => item.id === id);

        const currentUnits = current.reduce((sum, item) => sum + item.quantity, 0);

        if (existing) {
          const allowed = clamp(
            existing.quantity + quantity,
            1,
            Math.min(
              MAX_QUANTITY,
              existing.quantity + (MAX_TRIAL_ITEMS - currentUnits),
            ),
          );
          return current.map((item) =>
            item.id === id ? { ...item, quantity: allowed } : item,
          );
        }

        const room = MAX_TRIAL_ITEMS - currentUnits;
        if (room <= 0) return current;

        return [
          ...current,
          {
            id,
            productId: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image,
            size,
            color,
            quantity: clamp(quantity, 1, Math.min(MAX_QUANTITY, room)),
          },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (!target) return current;

      const others = current
        .filter((item) => item.id !== id)
        .reduce((sum, item) => sum + item.quantity, 0);
      const maxAllowed = Math.min(MAX_QUANTITY, MAX_TRIAL_ITEMS - others);

      // Clamp instead of accepting 0 / negative / unbounded quantities.
      const next = clamp(Math.trunc(quantity) || 1, 1, Math.max(1, maxAllowed));

      return current.map((item) =>
        item.id === id ? { ...item, quantity: next } : item,
      );
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = roundRupees(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    );
    return { items, count, subtotal, addItem, removeItem, updateQuantity, clear };
  }, [items, addItem, removeItem, updateQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
