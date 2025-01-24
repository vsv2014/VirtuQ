import { Facebook, Twitter, Instagram, CreditCard, Wallet, IndianRupee, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNewsletter } from '../hooks/useNewsletter';
import { Link } from 'react-router-dom';

export function Footer() {
  const { subscribe, isLoading, error, success } = useNewsletter();
  const [email, setEmail] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await subscribe(email);
    if (!error) {
      setEmail('');
    }
  };

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">VirtuQuick.ai</h3>
            <p className="text-sm">Experience fashion like never before with our home trial service.</p>
            <div className="space-y-3">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Customer Support</h4>
                <div className="space-y-2">
                  <a href="tel:+919876543210" className="flex items-center space-x-2 text-sm hover:text-sky-500 dark:hover:text-sky-400 transition-colors group">
                    <Phone className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                    <span className="group-hover:underline">+91 98765 43210</span>
                  </a>
                  <a href="mailto:support@virtuquick.ai" className="flex items-center space-x-2 text-sm hover:text-sky-500 dark:hover:text-sky-400 transition-colors group">
                    <Mail className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                    <span className="group-hover:underline">support@virtuquick.ai</span>
                  </a>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-sky-500 dark:text-sky-400 flex-shrink-0" />
                    <span>123 Fashion Street, Bangalore, India</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Support Hours</h4>
                <p className="text-sm">Mon - Sat: 9:00 AM - 8:00 PM IST</p>
                <p className="text-sm">Sun: 10:00 AM - 6:00 PM IST</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">FAQ</Link></li>
              <li><Link to="/track-order" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Track Order</Link></li>
              <li><Link to="/home-trial" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Home Trial</Link></li>
              <li><Link to="/shipping" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Shipping Info</Link></li>
            </ul>
          </div>

          {/* Shop By */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Shop By</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/men" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Men</Link></li>
              <li><Link to="/women" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Women</Link></li>
              <li><Link to="/kids" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Kids</Link></li>
              <li><Link to="/new-arrivals" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">New Arrivals</Link></li>
              <li><Link to="/brands" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Brands</Link></li>
              <li><Link to="/sale" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">Sale</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Stay Updated</h3>
            <p className="text-sm mb-4">Subscribe to get exclusive offers and updates about new arrivals!</p>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  aria-label="Subscribe to our newsletter"
                  className="w-full px-4 py-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
                  disabled={isLoading}
                />
                {error && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>
                )}
                {success && (
                  <p className="text-green-500 dark:text-green-400 text-xs mt-1">
                    Thank you for subscribing!
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-sky-500 text-white py-2 rounded hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <span>Subscribe for Updates</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Social Links */}
            <div className="flex items-center space-x-4 justify-center md:justify-start">
              <a href="#" className="text-gray-400 hover:text-sky-500 dark:hover:text-sky-400">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-sky-500 dark:hover:text-sky-400">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-sky-500 dark:hover:text-sky-400">
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex items-center justify-center space-x-4 text-sm">
              <Link to="/terms" className="hover:text-sky-500 dark:hover:text-sky-400">Terms</Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-sky-500 dark:hover:text-sky-400">Privacy</Link>
              <span>•</span>
              <Link to="/refund-policy" className="hover:text-sky-500 dark:hover:text-sky-400">Refunds</Link>
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-right">
              &copy; {new Date().getFullYear()} VirtuQuick.ai
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}