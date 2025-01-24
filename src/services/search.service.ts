import { api } from './api';
import { Product } from '../types';

export interface SearchSuggestion {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  price?: number;
  rating?: number;
}

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  sizes?: string[];
  colors?: string[];
  rating?: number;
}

export interface SearchResponse {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
  suggestions?: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  category: string;
  type: 'product' | 'category' | 'brand';
  url: string;
}

// Mock data for development
const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Nike Air Max',
    description: 'Men\'s Running Shoes',
    image: '/images/products/nike-air-max.jpg',
    price: 129.99,
    category: 'Men\'s Footwear',
    type: 'product',
    url: '/product/nike-air-max'
  },
  {
    id: '2',
    title: 'Adidas T-Shirt',
    description: 'Men\'s Cotton T-Shirt',
    image: '/images/products/adidas-tshirt.jpg',
    price: 24.99,
    category: 'Men\'s Clothing',
    type: 'product',
    url: '/product/adidas-tshirt'
  },
  {
    id: '3',
    title: 'Women\'s Dresses',
    description: 'Shop the latest dresses',
    image: '/images/categories/dresses.jpg',
    price: 0,
    category: 'Women\'s Clothing',
    type: 'category',
    url: '/category/women-dresses'
  },
  {
    id: '4',
    title: 'Nike',
    description: 'Shop all Nike products',
    image: '/images/brands/nike.jpg',
    price: 0,
    category: 'Brands',
    type: 'brand',
    url: '/brand/nike'
  }
];

export const searchService = {
  // Get search suggestions as user types
  getSuggestions: async (query: string): Promise<SearchSuggestion[]> => {
    if (!query) return [];
    
    try {
      const response = await api.get<SearchSuggestion[]>('/search/suggestions', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      return [];
    }
  },

  // Perform a full search with filters and pagination
  search: async (
    query: string,
    filters?: SearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResponse> => {
    try {
      const response = await api.get<SearchResponse>('/search', {
        params: {
          q: query,
          page,
          limit,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  },

  // Get popular searches
  getPopularSearches: async (): Promise<string[]> => {
    if (import.meta.env.DEV) {
      return Promise.resolve([
        'Nike shoes',
        'Summer dresses',
        'Men\'s t-shirts',
        'Running shoes',
        'Casual wear'
      ]);
    }
    try {
      const response = await api.get<string[]>('/search/popular');
      return response.data;
    } catch (error) {
      console.error('Error fetching popular searches:', error);
      return [];
    }
  },

  // Get recent searches for the user
  getRecentSearches: async (): Promise<string[]> => {
    try {
      const response = await api.get<string[]>('/search/recent');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent searches:', error);
      return [];
    }
  },

  // Save a search to recent searches
  saveRecentSearch: async (query: string): Promise<void> => {
    try {
      await api.post('/search/recent', { query });
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  },

  // Search with mock data for development
  searchWithMockData: async (query: string): Promise<SearchResult[]> => {
    if (import.meta.env.DEV) {
      // Simulate search in development
      const results = mockSearchResults.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return results;
    }
    const response = await api.get('/search', { params: { q: query } });
    return response.data;
  },

  // Get suggestions with mock data for development
  getSuggestionsWithMockData: async (query: string): Promise<string[]> => {
    if (import.meta.env.DEV) {
      const suggestions = [
        'nike air max',
        'nike running shoes',
        'nike casual shoes',
        'adidas originals',
        'adidas superstar',
        'women\'s dresses casual',
        'women\'s dresses formal'
      ];
      return Promise.resolve(
        suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()))
      );
    }
    const response = await api.get('/search/suggestions', { params: { q: query } });
    return response.data;
  }
};
