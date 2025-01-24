import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchSuggestion {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
}

interface SearchBarProps {
  isCompact?: boolean;
}

// Mock suggestions data - replace with actual API call
const getMockSuggestions = async (query: string): Promise<SearchSuggestion[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!query) return [];
  
  return [
    {
      id: '1',
      name: 'Cotton T-Shirt',
      category: 'Men / Clothing',
      imageUrl: '/images/products/cotton-tshirt.jpg'
    },
    {
      id: '2',
      name: 'Denim Jeans',
      category: 'Men / Clothing',
      imageUrl: '/images/products/denim-jeans.jpg'
    },
    {
      id: '3',
      name: 'Summer Dress',
      category: 'Women / Clothing',
      imageUrl: '/images/products/summer-dress.jpg'
    },
  ].filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );
};

export function SearchBar({ isCompact = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getMockSuggestions(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search for products..."
            className={`w-full pl-10 pr-10 bg-gray-100 dark:bg-gray-800 border border-transparent
                     focus:border-purple-500 dark:focus:border-purple-400 rounded-lg
                     text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all
                     ${isCompact ? 'py-1.5 text-sm' : 'py-2 text-base'}`}
            aria-label="Search"
          />
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-300
            ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className={`transition-all duration-300 ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isFocused && (query || isLoading) && (
        <div className={`absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                      border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50
                      transition-all duration-300 ${isCompact ? 'text-sm' : 'text-base'}`}>
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              <p className="mt-2">Searching...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <a
                    href={`/product/${suggestion.id}`}
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsFocused(false)}
                  >
                    {suggestion.imageUrl && (
                      <img
                        src={suggestion.imageUrl}
                        alt={suggestion.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {suggestion.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {suggestion.category}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          ) : query ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No results found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
