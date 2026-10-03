import { createContext, useContext } from 'react';

export interface LocationContextValue {
  location: string | null;
  setLocation: (location: string) => void;
  clear: () => void;
}

export const LocationContext = createContext<LocationContextValue | undefined>(
  undefined,
);

export function useLocation(): LocationContextValue {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
