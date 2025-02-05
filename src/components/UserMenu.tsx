import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Bell, 
  FileText, 
  HelpCircle, 
  Gift, 
  Info, 
  Shield, 
  DollarSign 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { label: user ? 'My Orders' : 'Login / Signup', icon: ShoppingBag, href: user ? '/orders' : '/login' },
    { label: 'Wishlist', icon: Heart, href: '/wishlist' },
    { label: 'Address', icon: MapPin, href: '/address' },
    { label: 'Notifications', icon: Bell, href: '/notifications' },
    { label: 'Profile Edit', icon: User, href: '/profile' },
    { label: 'Returns', icon: FileText, href: '/returns' },
    { label: 'Home Trial', icon: HelpCircle, href: '/home-trial' },
    { label: 'Orders', icon: FileText, href: '/orders' }, 
    { label: 'Customer Care', icon: Bell, href: '/customer-care' },
    { label: 'Invite Friends & Earn', icon: Gift, href: '/invite' },
    { label: 'How to Return?', icon: Info, href: '/how-to-return' },
    { label: 'Terms & Conditions', icon: FileText, href: '/terms' },
    { label: 'Return & Refund Policy', icon: FileText, href: '/refund-policy' },
    { label: 'We Respect Your Privacy', icon: Shield, href: '/privacy' },
    { label: 'Fees & Payments', icon: DollarSign, href: '/fees-payments' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <User className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50">
          {user && (
            <div className="px-4 py-2 border-b">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          )}

          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}

          {user && (
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
