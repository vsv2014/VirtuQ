import { Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Download Apps */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get the TryNStyle App</h3>
            <div className="space-y-3">
              <a href="#" className="block">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  className="h-10"
                />
              </a>
              <a href="#" className="block">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                  alt="Download on the App Store"
                  className="h-10"
                />
              </a>
            </div>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Help</h3>
            <ul className="space-y-2">
              <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
              <li><a href="/faq" className="hover:text-white">FAQ</a></li>
              <li><a href="/track-order" className="hover:text-white">Track Order</a></li>
              <li><a href="/returns" className="hover:text-white">Returns</a></li>
            </ul>
          </div>

          {/* Shop By */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop By</h3>
            <ul className="space-y-2">
              <li><a href="/men" className="hover:text-white">Men</a></li>
              <li><a href="/women" className="hover:text-white">Women</a></li>
              <li><a href="/kids" className="hover:text-white">Kids</a></li>
              <li><a href="/new-arrivals" className="hover:text-white">New Arrivals</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="hover:text-white">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-white">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-white">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} TryNStyle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}