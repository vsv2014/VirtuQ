import { api } from './api';
// import { Product } from '../types';

export const productService = {
  getProducts: async (params?: {
    category?: string;
    page?: number;
    limit?: number;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    brands?: string[];
    sizes?: string[];
    colors?: string[];
  }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getProductsByCategory: async (categoryId: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    const response = await api.get(`/products/category/${categoryId}`, { params });
    return response.data;
  },

  getProductReviews: async (productId: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    const response = await api.get(`/products/${productId}/reviews`, { params });
    return response.data;
  },

  addProductReview: async (productId: string, data: {
    rating: number;
    comment: string;
  }) => {
    const response = await api.post(`/products/${productId}/reviews`, data);
    return response.data;
  },

  getFeaturedProducts: async (limit?: number) => {
    const response = await api.get('/products/featured', { params: { limit } });
    return response.data;
  },

  getNewArrivals: async (limit?: number) => {
    const response = await api.get('/products/new-arrivals', { params: { limit } });
    return response.data;
  },

  getBestSellers: async (limit?: number) => {
    const response = await api.get('/products/best-sellers', { params: { limit } });
    return response.data;
  }
};
