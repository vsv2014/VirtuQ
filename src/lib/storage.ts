export const STORAGE_KEYS = {
  cart: 'trynstyle.cart',
  wishlist: 'trynstyle.wishlist',
  location: 'trynstyle.location',
  measurements: 'trynstyle.measurements',
} as const;

/** localStorage access that never throws (private mode, quota, SSR). */
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / disabled storage */
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
