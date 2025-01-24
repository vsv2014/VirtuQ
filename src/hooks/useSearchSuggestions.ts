import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { mockProducts } from '../data/mockProducts';

export interface SearchSuggestion {
  id: string;
  type: 'product' | 'category' | 'brand' | 'collection';
  text: string;
  image?: string;
  price?: number;
}

// Get unique categories from mock products
const categories = Array.from(new Set(mockProducts.map(p => p.subcategory)));
const brands = Array.from(new Set(mockProducts.map(p => p.brand)));

// Collections data
const collections = [
  { id: 'summer-2024', name: 'Summer Collection 2024' },
  { id: 'winter-basics', name: 'Winter Basics' },
  { id: 'workwear', name: 'Work From Home Essentials' },
  { id: 'party', name: 'Party Edit' },
  { id: 'sustainable', name: 'Sustainable Fashion' }
];

const fetchSuggestions = async (query: string): Promise<SearchSuggestion[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!query) return [];

  const lowerQuery = query.toLowerCase();
  const suggestions: SearchSuggestion[] = [];

  // Add matching products (limit to 3)
  const matchingProducts = mockProducts
    .filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.brand.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 3)
    .map(product => ({
      id: `product-${product.id}`,
      type: 'product' as const,
      text: product.name,
      image: product.image,
      price: product.price
    }));
  suggestions.push(...matchingProducts);

  // Add matching categories (limit to 2)
  const matchingCategories = categories
    .filter(category => 
      category.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 2)
    .map(category => ({
      id: `category-${category}`,
      type: 'category' as const,
      text: category
    }));
  suggestions.push(...matchingCategories);

  // Add matching brands (limit to 2)
  const matchingBrands = brands
    .filter(brand => 
      brand.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 2)
    .map(brand => ({
      id: `brand-${brand}`,
      type: 'brand' as const,
      text: brand
    }));
  suggestions.push(...matchingBrands);

  // Add matching collections (limit to 1)
  const matchingCollections = collections
    .filter(collection => 
      collection.name.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 1)
    .map(collection => ({
      id: `collection-${collection.id}`,
      type: 'collection' as const,
      text: collection.name
    }));
  suggestions.push(...matchingCollections);

  return suggestions;
};

export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const getSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await fetchSuggestions(debouncedQuery);
        setSuggestions(results);
      } catch (err) {
        setError('Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    getSuggestions();
  }, [debouncedQuery]);

  return { suggestions, isLoading, error };
}
