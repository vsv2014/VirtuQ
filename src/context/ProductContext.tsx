import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { productService, FilterOptions } from '../services/product.service';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
  availableFilters: {
    genders: string[];
    categories: string[];
    brands: string[];
    occasions: string[];
    colors: string[];
    sizes: string[];
    priceRanges: string[];
  };
  totalProducts: number;
  currentPage: number;
  setFilters: (filters: FilterOptions) => void;
  setCurrentPage: (page: number) => void;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    page: 1,
    limit: 12,
  });
  const [availableFilters, setAvailableFilters] = useState({
    genders: [],
    categories: [],
    brands: [],
    occasions: [],
    colors: [],
    sizes: [],
    priceRanges: [],
  });

  const fetchFilters = async () => {
    try {
      const filterData = await productService.getFilters();
      setAvailableFilters(filterData);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const refreshProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts({
        ...filters,
        page: currentPage,
      });
      setProducts(response.products);
      setTotalProducts(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch filters on mount
  useEffect(() => {
    fetchFilters();
  }, []);

  // Fetch products when filters or page changes
  useEffect(() => {
    refreshProducts();
  }, [filters, currentPage]);

  const value = {
    products,
    loading,
    error,
    filters,
    availableFilters,
    totalProducts,
    currentPage,
    setFilters,
    setCurrentPage,
    refreshProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;
