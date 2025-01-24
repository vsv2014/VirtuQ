import { api } from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
}

// Mock data for development
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Men',
    slug: 'men',
    description: 'Men\'s Fashion',
    image: '/images/categories/men.jpg',
    children: [
      {
        id: '1-1',
        name: 'Clothing',
        slug: 'men-clothing',
        children: [
          { id: '1-1-1', name: 'T-Shirts', slug: 'men-tshirts' },
          { id: '1-1-2', name: 'Shirts', slug: 'men-shirts' },
          { id: '1-1-3', name: 'Jeans', slug: 'men-jeans' },
          { id: '1-1-4', name: 'Trousers', slug: 'men-trousers' }
        ]
      },
      {
        id: '1-2',
        name: 'Footwear',
        slug: 'men-footwear',
        children: [
          { id: '1-2-1', name: 'Casual Shoes', slug: 'men-casual-shoes' },
          { id: '1-2-2', name: 'Formal Shoes', slug: 'men-formal-shoes' },
          { id: '1-2-3', name: 'Sports Shoes', slug: 'men-sports-shoes' }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Women',
    slug: 'women',
    description: 'Women\'s Fashion',
    image: '/images/categories/women.jpg',
    children: [
      {
        id: '2-1',
        name: 'Clothing',
        slug: 'women-clothing',
        children: [
          { id: '2-1-1', name: 'Dresses', slug: 'women-dresses' },
          { id: '2-1-2', name: 'Tops', slug: 'women-tops' },
          { id: '2-1-3', name: 'Jeans', slug: 'women-jeans' },
          { id: '2-1-4', name: 'Skirts', slug: 'women-skirts' }
        ]
      },
      {
        id: '2-2',
        name: 'Footwear',
        slug: 'women-footwear',
        children: [
          { id: '2-2-1', name: 'Heels', slug: 'women-heels' },
          { id: '2-2-2', name: 'Flats', slug: 'women-flats' },
          { id: '2-2-3', name: 'Sneakers', slug: 'women-sneakers' }
        ]
      }
    ]
  }
];

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    if (import.meta.env.DEV) {
      return Promise.resolve(mockCategories);
    }
    const response = await api.get('/categories');
    return response.data;
  },

  getCategoryBySlug: async (slug: string): Promise<Category | null> => {
    if (import.meta.env.DEV) {
      const findCategory = (categories: Category[], targetSlug: string): Category | null => {
        for (const category of categories) {
          if (category.slug === targetSlug) return category;
          if (category.children) {
            const found = findCategory(category.children, targetSlug);
            if (found) return found;
          }
        }
        return null;
      };
      return Promise.resolve(findCategory(mockCategories, slug));
    }
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  },

  getSubcategories: async (parentId: string): Promise<Category[]> => {
    if (import.meta.env.DEV) {
      const findSubcategories = (categories: Category[], id: string): Category[] => {
        for (const category of categories) {
          if (category.id === id) return category.children || [];
          if (category.children) {
            const found = findSubcategories(category.children, id);
            if (found.length) return found;
          }
        }
        return [];
      };
      return Promise.resolve(findSubcategories(mockCategories, parentId));
    }
    const response = await api.get(`/categories/${parentId}/subcategories`);
    return response.data;
  }
};
