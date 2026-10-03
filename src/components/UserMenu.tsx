import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  LogOut,
  ShoppingBag,
  Heart,
  MapPin,
  FileText,
  Clock,
  Shield,
} from 'lucide-react';

import { useAuth } from '../context/useAuth';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

/** Every entry points at a route that actually exists. */
const MENU_ITEMS = [
  { label: 'My Orders', icon: ShoppingBag, href: '/orders' },
  { label: 'Wishlist', icon: Heart, href: '/wishlist' },
  { label: 'Home Trial', icon: Clock, href: '/home-trial' },
  { label: 'Returns', icon: FileText, href: '/returns' },
  { label: 'Saved Addresses', icon: MapPin, href: '/address' },
  { label: 'Profile', icon: User, href: '/profile' },
  { label: 'How to Return?', icon: FileText, href: '/how-to-return' },
  { label: 'Privacy', icon: Shield, href: '/privacy' },
];

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Closes on outside click and on Escape.
  const ref = useOnClickOutside<HTMLDivElement>(() => setIsOpen(false), isOpen);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={isAuthenticated ? 'Account menu' : 'Sign in'}
        className="rounded-full p-2 hover:bg-gray-100"
      >
        <User className="h-6 w-6" />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-lg bg-white py-2 shadow-lg ring-1 ring-black/5"
        >
          {user ? (
            <div className="border-b px-4 py-2">
              <p className="font-medium">{user.name || 'TryNStyle shopper'}</p>
              <p className="text-sm text-gray-500">+91 {user.phone}</p>
            </div>
          ) : (
            <div className="border-b px-4 py-2 text-sm text-gray-600">
              You’re browsing as a guest
            </div>
          )}

          {MENU_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}

          {isAuthenticated ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 border-t px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 border-t px-4 py-2 font-medium text-purple-600 hover:bg-gray-50"
            >
              <LogOut className="h-5 w-5" />
              <span>Login / Signup</span>
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
