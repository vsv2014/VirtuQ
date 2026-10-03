import { useEffect, useState } from 'react';
import { Link, useLocation as useRouterLocation } from 'react-router-dom';
import { Heart, ShoppingBag, Menu, X } from 'lucide-react';

import { Navigation } from './Navigation';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';
import { LocationPicker } from './LocationPicker';
import { useCart } from '../context/useCart';
import { useWishlist } from '../context/useWishlist';
import { categories } from '../data/mockProducts';

function CartIconLink({
  to,
  label,
  badge,
  children,
}: {
  to: string;
  label: string;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={badge ? `${label} (${badge} items)` : label}
      className="relative rounded-full p-2 hover:bg-gray-100"
    >
      {children}
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-600 px-1 text-xs font-semibold text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </Link>
  );
}

export function Header() {
  const { count } = useCart();
  const { items: wishlist } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useRouterLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-light tracking-wider">
              TryN<span className="font-medium">Style</span>
            </span>
          </Link>

          <Navigation />

          <LocationPicker />

          <SearchBar />

          <div className="flex items-center gap-1">
            <CartIconLink to="/wishlist" label="Wishlist" badge={wishlist.length}>
              <Heart className="h-6 w-6" />
            </CartIconLink>

            <CartIconLink to="/cart" label="Cart" badge={count}>
              <ShoppingBag className="h-6 w-6" />
            </CartIconLink>

            <UserMenu />

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="rounded-full p-2 hover:bg-gray-100 md:hidden"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation — previously there was none at all */}
        {mobileOpen ? (
          <nav className="border-t py-4 md:hidden" aria-label="Mobile">
            <form
              role="search"
              action="/search"
              className="mb-4 flex items-center rounded-full bg-gray-100 px-4 py-2"
            >
              <label htmlFor="mobile-search" className="sr-only">
                Search products
              </label>
              <input
                id="mobile-search"
                type="search"
                name="q"
                placeholder="Search products"
                className="w-full bg-transparent focus:outline-none"
              />
            </form>

            <ul className="space-y-1">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    to={category.href}
                    className="block rounded px-2 py-2 font-medium text-gray-800 hover:bg-gray-50"
                  >
                    {category.label}
                  </Link>
                  <ul className="mb-2 ml-3 grid grid-cols-2 gap-1">
                    {category.groups.flatMap((group) =>
                      group.items.map((item) => (
                        <li key={`${group.slug}-${item.slug}`}>
                          <Link
                            to={`/category/${category.slug}/${item.slug}`}
                            className="block rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-50"
                          >
                            {item.label}
                          </Link>
                        </li>
                      )),
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
