import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Heart, 
  ShoppingBag,
  Menu,
  X,
  Bell, 
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { Navigation } from './Navigation';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';
import { LocationPicker } from './LocationPicker';

const categories = [
  { name: 'New Arrivals', href: '/new-arrivals' },
  { name: 'Women', href: '/women' },
  { name: 'Men', href: '/men' },
  { name: 'Kids', href: '/kids' },
  { name: 'Brands', href: '/brands' },
  { name: 'Sale', href: '/sale' },
];

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New collection just dropped!', isRead: false },
    { id: 2, text: 'Special offer: Free delivery today', isRead: false }
  ]);
  const { location } = useLocation();
  const { items } = useCart();
  const { wishlist } = useWishlist();
  const { theme, toggleTheme } = useTheme();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <header 
      className={`sticky top-0 z-50 bg-white dark:bg-gray-900 transition-all duration-300 ${
        hasScrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      <div className="container mx-auto px-4">
        {/* Top Bar - Mobile Only */}
        <div className="h-10 border-b border-gray-100 dark:border-gray-800 items-center justify-center text-sm text-gray-600 dark:text-gray-400 hidden md:flex">
          <p>Free Delivery | 2-Hour Trial | Easy Returns</p>
        </div>

        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 md:hidden text-gray-600 dark:text-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-light tracking-wider text-gray-900 dark:text-white">
              TryN<span className="font-medium">Style</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="flex items-center space-x-1 py-2 text-gray-700 dark:text-gray-300"
              >
                <span>Categories</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {isCategoryMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2"
                  >
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        to={category.href}
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Navigation />
          </nav>

          {/* Location - Desktop Only */}
          <div className="hidden md:block">
            <LocationPicker />
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xl mx-4">
            <SearchBar 
              isOpen={isSearchOpen}
              onToggle={() => setIsSearchOpen(!isSearchOpen)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300"
                onClick={() => {
                  setNotifications(prev => 
                    prev.map(n => ({ ...n, isRead: true }))
                  );
                }}
              >
                <Bell className="w-6 h-6" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              aria-label="View wishlist"
            >
              <Heart className="w-6 h-6" />
              {wishlist && wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="fixed inset-0 bg-white z-50 md:hidden"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <span className="text-xl font-semibold">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4">
              <nav className="space-y-4">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.href}
                    className="block py-2 hover:text-purple-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-8 space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{location || 'Set your location'}</span>
                </div>
                
                <Link
                  to="/wishlist"
                  className="flex items-center space-x-2 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  <span>Wishlist</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}