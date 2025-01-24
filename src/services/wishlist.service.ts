import { api } from './api';

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  brand: string;
  category: string;
  addedAt: string;
}

// Mock data for development
const mockWishlistItems: WishlistItem[] = [
  {
    id: '1',
    productId: 'p1',
    name: 'Nike Air Max 270',
    description: 'Men\'s Running Shoes',
    price: 149.99,
    image: '/images/products/nike-air-max-270.jpg',
    brand: 'Nike',
    category: 'Men\'s Footwear',
    addedAt: new Date().toISOString()
  },
  {
    id: '2',
    productId: 'p2',
    name: 'Adidas Originals T-Shirt',
    description: 'Men\'s Cotton Blend T-Shirt',
    price: 29.99,
    image: '/images/products/adidas-tshirt.jpg',
    brand: 'Adidas',
    category: 'Men\'s Clothing',
    addedAt: new Date().toISOString()
  }
];

// Store mock wishlist in localStorage for persistence during development
const getStoredWishlist = (): WishlistItem[] => {
  if (import.meta.env.DEV) {
    const stored = localStorage.getItem('dev_wishlist');
    if (!stored) {
      localStorage.setItem('dev_wishlist', JSON.stringify(mockWishlistItems));
      return mockWishlistItems;
    }
    return JSON.parse(stored);
  }
  return [];
};

const updateStoredWishlist = (items: WishlistItem[]) => {
  if (import.meta.env.DEV) {
    localStorage.setItem('dev_wishlist', JSON.stringify(items));
  }
};

export const wishlistService = {
  getWishlist: async (): Promise<WishlistItem[]> => {
    if (import.meta.env.DEV) {
      return Promise.resolve(getStoredWishlist());
    }
    const response = await api.get('/wishlist');
    return response.data;
  },

  addToWishlist: async (productId: string): Promise<WishlistItem> => {
    if (import.meta.env.DEV) {
      const wishlist = getStoredWishlist();
      const existingItem = wishlist.find(item => item.productId === productId);
      
      if (existingItem) {
        return Promise.resolve(existingItem);
      }

      const newItem: WishlistItem = {
        id: Date.now().toString(),
        productId,
        name: 'New Wishlist Item',
        description: 'Product description',
        price: 99.99,
        image: '/images/products/placeholder.jpg',
        brand: 'Brand Name',
        category: 'Category',
        addedAt: new Date().toISOString()
      };

      const updatedWishlist = [...wishlist, newItem];
      updateStoredWishlist(updatedWishlist);
      return Promise.resolve(newItem);
    }
    const response = await api.post('/wishlist', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId: string): Promise<void> => {
    if (import.meta.env.DEV) {
      const wishlist = getStoredWishlist();
      const updatedWishlist = wishlist.filter(item => item.productId !== productId);
      updateStoredWishlist(updatedWishlist);
      return Promise.resolve();
    }
    await api.delete(`/wishlist/${productId}`);
  },

  clearWishlist: async (): Promise<void> => {
    if (import.meta.env.DEV) {
      updateStoredWishlist([]);
      return Promise.resolve();
    }
    await api.delete('/wishlist');
  },

  moveToCart: async (productId: string): Promise<void> => {
    if (import.meta.env.DEV) {
      // In development, just remove from wishlist
      await wishlistService.removeFromWishlist(productId);
      return Promise.resolve();
    }
    await api.post(`/wishlist/${productId}/move-to-cart`);
  }
};
