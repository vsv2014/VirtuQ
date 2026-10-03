import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { readStorage, removeStorage, writeStorage, STORAGE_KEYS } from '../lib/storage';
import { LocationContext } from './useLocation';

/**
 * Delivery location, persisted across reloads.
 * `setLocation` is now actually wired to the header's location picker —
 * previously nothing ever called it, so the fallback text was permanent.
 */
export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<string | null>(() =>
    readStorage<string | null>(STORAGE_KEYS.location, null),
  );

  useEffect(() => {
    if (location) {
      writeStorage(STORAGE_KEYS.location, location);
    }
  }, [location]);

  const setLocation = useCallback((next: string) => {
    const trimmed = next.trim();
    setLocationState(trimmed === '' ? null : trimmed);
  }, []);

  const clear = useCallback(() => {
    setLocationState(null);
    removeStorage(STORAGE_KEYS.location);
  }, []);

  const value = useMemo(
    () => ({ location, setLocation, clear }),
    [location, setLocation, clear],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}
