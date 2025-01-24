import React, { createContext, useContext, useState, useEffect } from 'react';

interface SearchContextType {
  recentSearches: string[];
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  trendingSearches: string[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const MAX_RECENT_SEARCHES = 5;

// Mock trending searches - replace with API call in production
const TRENDING_SEARCHES = [
  'Summer Collection 2024',
  'Casual Wear',
  'Party Dresses',
  'Work from Home Fashion',
  'Sustainable Fashion'
];

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });

  const [trendingSearches] = useState<string[]>(TRENDING_SEARCHES);

  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const addRecentSearch = (search: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== search);
      return [search, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  return (
    <SearchContext.Provider
      value={{
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        trendingSearches,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
