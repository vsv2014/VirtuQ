import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, MicOff, Loader2, Clock, Trash2, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useSearchSuggestions, SearchSuggestion } from '../hooks/useSearchSuggestions';
import { useSearch } from '../context/SearchContext';
import { useNavigate } from 'react-router-dom';
import { useUserBehavior } from '../hooks/useUserBehavior';
import { useRecommendations } from '../hooks/useRecommendations';
import { RecommendationCard } from './RecommendationCard';

interface SearchBarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SearchBar({ isOpen, onToggle }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [lastSearchTime, setLastSearchTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { trackEvent } = useUserBehavior();
  
  const {
    isListening,
    text: voiceText,
    startListening,
    stopListening,
    error: voiceError
  } = useVoiceSearch();

  const { suggestions, isLoading, error } = useSearchSuggestions(query);
  const { recentSearches, trendingSearches, addRecentSearch, clearRecentSearches } = useSearch();
  const { recommendations } = useRecommendations(undefined, 4);

  // Focus input when search is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (voiceText) {
      setQuery(voiceText);
      // Track voice search
      trackEvent('search', { query: voiceText, metadata: { method: 'voice' } });
    }
  }, [voiceText]);

  // Track search query changes with debounce
  useEffect(() => {
    const now = Date.now();
    if (query && now - lastSearchTime > 1000) { // Only track if 1 second has passed
      trackEvent('search', {
        query,
        metadata: { 
          method: 'text',
          suggestionCount: suggestions.length
        }
      });
      setLastSearchTime(now);
    }
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    addRecentSearch(searchQuery);
    trackEvent('search', {
      query: searchQuery,
      metadata: { 
        method: 'submit',
        source: voiceText ? 'voice' : 'manual'
      }
    });
    
    setQuery('');
    onToggle();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    trackEvent('click', {
      itemType: suggestion.type,
      itemId: suggestion.id,
      metadata: { 
        query,
        suggestionPosition: suggestions.indexOf(suggestion)
      }
    });
    handleSearch(suggestion.text);
  };

  const handleRecommendationClick = (productId: string) => {
    trackEvent('click', {
      itemType: 'product',
      itemId: productId,
      metadata: { source: 'search_recommendations' }
    });
    navigate(`/product/${productId}`);
    onToggle();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const renderSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product':
        return <Search className="w-4 h-4 text-gray-400" />;
      case 'category':
        return <Search className="w-4 h-4 text-purple-400" />;
      case 'brand':
        return <Search className="w-4 h-4 text-blue-400" />;
      case 'collection':
        return <Search className="w-4 h-4 text-green-400" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        onToggle(); // Close search when clicking outside
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onToggle]);

  return (
    <div className="relative w-full" role="search">
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for products, brands and more"
          className="w-full bg-transparent py-2 pl-4 pr-20 focus:outline-none dark:text-white"
          aria-label="Search"
          aria-expanded={isOpen}
          aria-controls="search-suggestions"
          aria-describedby={error ? 'search-error' : undefined}
        />
        <div className="absolute right-0 top-0 h-full flex items-center space-x-1 px-3">
          {isLoading && (
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          )}
          <button
            onClick={() => isListening ? stopListening() : startListening()}
            className={`p-1.5 rounded-full transition-all duration-200 ${
              isListening 
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 ring-4 ring-purple-100/50 dark:ring-purple-900/50' 
                : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/50'
            }`}
            aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
            title={isListening ? 'Stop voice search' : 'Search with your voice'}
          >
            {isListening ? (
              <div className="relative">
                <MicOff className="w-5 h-5" />
                <div className="absolute inset-0 animate-ping rounded-full bg-purple-400/30" />
              </div>
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => handleSearch(query)}
            className="p-1.5 rounded-full text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/50 transition-all duration-200"
            aria-label="Search"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Voice search feedback */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="relative">
                <Mic className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <div className="absolute inset-0 animate-ping rounded-full bg-purple-400/30" />
              </div>
              <span className="text-sm font-medium">Listening...</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Speak now to search for products
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice search error message */}
      <AnimatePresence>
        {voiceError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300 text-sm"
            role="alert"
          >
            <div className="flex items-center space-x-2">
              <MicOff className="w-4 h-4" />
              <span>
                {voiceError === 'not-allowed' 
                  ? 'Please allow microphone access to use voice search'
                  : voiceError === 'no-speech'
                  ? 'No speech was detected. Please try again.'
                  : 'Voice search is not supported in your browser'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search error message */}
      {error && (
        <div id="search-error" className="absolute top-full mt-1 text-sm text-red-500" role="alert">
          {error}
        </div>
      )}

      {/* Search suggestions dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
            id="search-suggestions"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && !query && (
              <div className="p-2 border-b dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Searches</h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="flex items-center space-x-2 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm dark:text-gray-300">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            {!query && (
              <div className="p-2 border-b dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Trending Searches</h3>
                <div className="space-y-1">
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="flex items-center space-x-2 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                    >
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      <span className="text-sm dark:text-gray-300">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Personalized Recommendations */}
            {!query && recommendations.length > 0 && (
              <div className="p-4 border-t dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Recommended for You
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {recommendations[0].products.slice(0, 4).map((product, index) => (
                    <div
                      key={product.id}
                      className="cursor-pointer"
                      onClick={() => handleRecommendationClick(product.id)}
                    >
                      <RecommendationCard product={product} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {query && suggestions.length > 0 && (
              <div className="p-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center space-x-2 w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                  >
                    {renderSuggestionIcon(suggestion.type)}
                    <div className="flex-1">
                      <span className="text-sm dark:text-gray-300">{suggestion.text}</span>
                      {suggestion.type !== 'product' && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                          in {suggestion.type}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results but Show Recommendations */}
            {query && !isLoading && suggestions.length === 0 && recommendations.length > 0 && (
              <div className="p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  No results found for "{query}". Here are some recommendations:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {recommendations[0].products.slice(0, 4).map((product, index) => (
                    <div
                      key={product.id}
                      className="cursor-pointer"
                      onClick={() => handleRecommendationClick(product.id)}
                    >
                      <RecommendationCard product={product} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}