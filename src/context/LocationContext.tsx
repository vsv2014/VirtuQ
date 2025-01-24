import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
  location: string | null;
  setLocation: (location: string) => void;
  coordinates: { lat: number; lng: number } | null;
  setCoordinates: (coords: { lat: number; lng: number } | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<string | null>(() => {
    const saved = localStorage.getItem('userLocation');
    return saved || null;
  });

  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (location) {
      localStorage.setItem('userLocation', location);
    } else {
      localStorage.removeItem('userLocation');
    }
  }, [location]);

  return (
    <LocationContext.Provider 
      value={{ 
        location, 
        setLocation, 
        coordinates, 
        setCoordinates 
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}