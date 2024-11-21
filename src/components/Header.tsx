import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Heart, 
  ShoppingBag, 
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { Navigation } from './Navigation';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { location } = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-light tracking-wider">TryN<span className="font-medium">Style</span></span>
          </Link>

          {/* Navigation */}
          <Navigation />

          {/* Location */}
          <div className="flex items-center space-x-1 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="max-w-[150px] truncate">
              {location || '30 min delivery to your location'}
            </span>
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
            <Link to="/wishlist" className="p-2 hover:bg-gray-100 rounded-full">
              <Heart className="w-6 h-6" />
            </Link>
            <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full">
              <ShoppingBag className="w-6 h-6" />
            </Link>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}