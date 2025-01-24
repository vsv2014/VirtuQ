import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useCart } from './CartContext';
import { wishlistService } from '../services/wishlist.service';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Product[];
  wishlistItemsCount: number;
  loading: boolean;
  error: string | null;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  moveToCart: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const refreshWishlist = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping wishlist refresh');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await wishlistService.getWishlist();
      console.log('Wishlist data received:', data);
      setWishlist(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch wishlist';
      console.error('Error fetching wishlist:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [isAuthenticated]);

  const addToWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to wishlist');
    }

    setError(null);
    try {
      await wishlistService.addToWishlist(product.id);
      setWishlist(prev => [...prev, product]);
    } catch (error) {
      setError('Failed to add item to wishlist');
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated) return;

    setError(null);
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item.id !== productId));
    } catch (error) {
      setError('Failed to remove item from wishlist');
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  const moveToCart = async (productId: string) => {
    if (!isAuthenticated) {
      throw new Error('Please login to move items to cart');
    }

    setError(null);
    try {
      await wishlistService.moveToCart(productId);
      const product = wishlist.find(item => item.id === productId);
      if (product) {
        await addToCart(product);
        await removeFromWishlist(productId);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to move item to cart';
      console.error('Error moving to cart:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data
      });
      setError(errorMessage);
      throw error;
    }
  };

  const clearWishlist = async () => {
    if (!isAuthenticated) return;

    setError(null);
    try {
      await wishlistService.clearWishlist();
      setWishlist([]);
    } catch (error) {
      setError('Failed to clear wishlist');
      console.error('Error clearing wishlist:', error);
      throw error;
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  const wishlistItemsCount = wishlist.length;

  const value = {
    wishlist,
    wishlistItemsCount,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    isInWishlist,
    clearWishlist,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
