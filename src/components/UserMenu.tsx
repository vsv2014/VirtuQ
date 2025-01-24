import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  LogOut,
  ShoppingBag,
  Heart,
  MapPin,
  Bell,
  Settings,
  HelpCircle,
  RefreshCw,
  Home,
  FileText,
  Lock,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  label: string;
  icon: JSX.Element;
  href: string;
}

const accountItems: MenuItem[] = [
  { label: 'My Orders', icon: <ShoppingBag className="w-4 h-4" />, href: '/orders' },
  { label: 'Wishlist', icon: <Heart className="w-4 h-4" />, href: '/wishlist' },
  { label: 'Saved Addresses', icon: <MapPin className="w-4 h-4" />, href: '/addresses' },
  { label: 'Notifications', icon: <Bell className="w-4 h-4" />, href: '/notifications' },
  { label: 'Edit Profile', icon: <Settings className="w-4 h-4" />, href: '/profile/edit' }
];

const supportItems: MenuItem[] = [
  { label: 'Customer Support', icon: <HelpCircle className="w-4 h-4" />, href: '/support' },
  { label: 'Returns & Refunds', icon: <RefreshCw className="w-4 h-4" />, href: '/returns' },
  { label: 'Home Trial', icon: <Home className="w-4 h-4" />, href: '/home-trial' }
];

const legalItems: MenuItem[] = [
  { label: 'Terms & Conditions', icon: <FileText className="w-4 h-4" />, href: '/terms' },
  { label: 'Privacy Policy', icon: <Lock className="w-4 h-4" />, href: '/privacy' },
  { label: 'Payment Terms', icon: <DollarSign className="w-4 h-4" />, href: '/payment-terms' }
];

interface User {
  name: string;
  email: string;
}

interface AuthContext {
  user: User | null;
  logout: () => Promise<void>;
}

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout }: AuthContext = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          to="/login"
          className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
            >
              {/* User Info */}
              <div className="p-4 border-b dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>

              {/* Account Section */}
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  ACCOUNT
                </p>
                {accountItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Support Section */}
              <div className="p-2 border-t dark:border-gray-700">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  SUPPORT
                </p>
                {supportItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Legal Section */}
              <div className="p-2 border-t dark:border-gray-700">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  LEGAL
                </p>
                {legalItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Logout */}
              <div className="p-2 border-t dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
