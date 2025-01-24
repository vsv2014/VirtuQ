import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  category: string;
  rating: number;
  discount?: number;
}

export interface RecommendationType {
  type: 'recently_viewed' | 'based_on_history' | 'trending' | 'similar_items';
  title: string;
  products: Product[];
}

interface UseRecommendationsResult {
  recommendations: RecommendationType[];
  isLoading: boolean;
  error: string | null;
  refreshRecommendations: () => void;
}

export function useRecommendations(
  productId?: string,
  limit: number = 10
): UseRecommendationsResult {
  const [recommendations, setRecommendations] = useState<RecommendationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Function to fetch recommendations from API
  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // This is mock data for demonstration
      const mockRecommendations: RecommendationType[] = [
        {
          type: 'recently_viewed',
          title: 'Recently Viewed',
          products: generateMockProducts(4),
        },
        {
          type: 'based_on_history',
          title: 'Based on Your History',
          products: generateMockProducts(4),
        },
        {
          type: 'trending',
          title: 'Trending Now',
          products: generateMockProducts(4),
        },
      ];

      // If productId is provided, add similar items
      if (productId) {
        mockRecommendations.push({
          type: 'similar_items',
          title: 'Similar Items',
          products: generateMockProducts(4),
        });
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecommendations(mockRecommendations);
    } catch (err) {
      setError('Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recommendations on mount or when dependencies change
  useEffect(() => {
    fetchRecommendations();
  }, [user?.id, productId]);

  return {
    recommendations,
    isLoading,
    error,
    refreshRecommendations: fetchRecommendations,
  };
}

// Helper function to generate mock products
function generateMockProducts(count: number): Product[] {
  const categories = ['Shirts', 'Pants', 'Dresses', 'Shoes', 'Accessories'];
  const brands = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour'];

  return Array.from({ length: count }, (_, i) => ({
    id: `product-${Math.random().toString(36).substr(2, 9)}`,
    name: `Product ${i + 1}`,
    price: Math.floor(Math.random() * 10000) + 500,
    image: `https://source.unsplash.com/400x400/?fashion,${categories[i % categories.length]}`,
    brand: brands[Math.floor(Math.random() * brands.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    rating: Math.floor(Math.random() * 5) + 1,
    discount: Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 10 : undefined,
  }));
}
