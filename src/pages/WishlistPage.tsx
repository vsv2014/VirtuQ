import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { Link, Navigate } from 'react-router-dom';
import { LoginSignup } from '../components/auth/LoginSignup';

export function WishlistPage() {
  const { wishlist, loading, error } = useWishlist();
  const { user } = useAuth();

  // If not authenticated, show login component
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4 text-center">Login Required</h1>
          <p className="text-gray-600 mb-8 text-center">Please login to view your wishlist</p>
          <LoginSignup />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-gray-600">Loading wishlist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Your Wishlist is Empty</h1>
        <p className="text-gray-600 mb-8">Start adding items to your wishlist by browsing our products!</p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">My Wishlist ({wishlist.length})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
