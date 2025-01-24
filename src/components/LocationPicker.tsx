import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '../context/LocationContext';

interface Location {
  id: string;
  address: string;
  pincode: string;
}

export function LocationPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedLocations, setSavedLocations] = useState<Location[]>([
    { id: '1', address: 'Home, 123 Main St', pincode: '560001' },
    { id: '2', address: 'Work, 456 Business Park', pincode: '560002' },
  ]);
  const { location, setLocation, setCoordinates } = useLocation();
  const [geoLocationError, setGeoLocationError] = useState<string | null>(null);

  const handleUseCurrentLocation = () => {
    setIsLoading(true);
    setGeoLocationError(null);

    if (!navigator.geolocation) {
      setGeoLocationError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lng } = position.coords;
          // In production, replace with actual reverse geocoding API call
          const mockAddress = 'Current Location, Bangalore';
          setLocation(mockAddress);
          setCoordinates({ lat, lng });
          setIsOpen(false);
        } catch (error) {
          setGeoLocationError('Failed to get address from coordinates');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        let errorMessage = 'Failed to get your location. Please enable location services.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setGeoLocationError(errorMessage);
        setIsLoading(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const handleSelectLocation = (selectedLocation: Location) => {
    setLocation(selectedLocation.address);
    setCoordinates(null); // Clear coordinates when selecting a saved location
    setIsOpen(false);
  };

  // Filter locations based on search query
  const filteredLocations = savedLocations.filter(loc =>
    loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.pincode.includes(searchQuery)
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 text-sm hover:text-purple-600 transition-colors"
        aria-label="Select location"
        aria-expanded={isOpen}
      >
        <MapPin className="w-4 h-4" />
        <span className="max-w-[150px] truncate">
          {location || 'Select your location'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-12 right-0 w-96 bg-white rounded-lg shadow-xl z-50"
              role="dialog"
              aria-modal="true"
              aria-label="Location picker"
            >
              <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Select Location</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close location picker"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for area, street name..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Search locations"
                />
              </div>

              <div className="p-4">
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isLoading}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Navigation className="w-5 h-5" />
                  <span>{isLoading ? 'Getting location...' : 'Use current location'}</span>
                </button>

                {geoLocationError && (
                  <p className="mt-2 text-sm text-red-500" role="alert">{geoLocationError}</p>
                )}

                {filteredLocations.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      {searchQuery ? 'Search Results' : 'Saved Locations'}
                    </h3>
                    <div className="space-y-2">
                      {filteredLocations.map((loc) => (
                        <button
                          key={loc.id}
                          onClick={() => handleSelectLocation(loc)}
                          className="flex items-start space-x-3 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <div className="text-left">
                            <p className="text-sm font-medium">{loc.address}</p>
                            <p className="text-xs text-gray-500">{loc.pincode}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchQuery && filteredLocations.length === 0 && (
                  <p className="mt-4 text-sm text-gray-500 text-center">
                    No locations found matching "{searchQuery}"
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
