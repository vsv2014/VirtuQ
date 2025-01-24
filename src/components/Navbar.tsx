import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export function Navbar() {
  const { user } = useAuth();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-purple-600">
            Bolt
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link to="/category/men" className="text-gray-600 hover:text-purple-600">
              Men
            </Link>
            <Link to="/category/women" className="text-gray-600 hover:text-purple-600">
              Women
            </Link>
            <Link to="/category/kids" className="text-gray-600 hover:text-purple-600">
              Kids
            </Link>
            <Link to="/category/accessories" className="text-gray-600 hover:text-purple-600">
              Accessories
            </Link>
            <Link to="/category/footwear" className="text-gray-600 hover:text-purple-600">
              Footwear
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-purple-500"
              />
              <Search className="absolute right-4 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-6">
            <Link to="/wishlist" className="text-gray-600 hover:text-purple-600 relative">
              <Heart size={24} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="text-gray-600 hover:text-purple-600 relative">
              <ShoppingBag size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
            <Link
              to={user ? "/profile" : "/auth"}
              className="text-gray-600 hover:text-purple-600"
            >
              <User size={24} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
