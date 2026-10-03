import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

/**
 * Catch-all route. Previously an unknown URL rendered an empty <main> with no
 * explanation and no way back.
 */
export function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <p className="mb-2 text-sm font-medium text-purple-600">404</p>
      <h1 className="mb-4 text-3xl font-bold">We couldn’t find that page</h1>
      <p className="mx-auto mb-8 max-w-md text-gray-600">
        The link may be out of date, or the page may have moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/" className="btn btn-primary">
          <Home className="h-4 w-4" />
          Back to home
        </Link>
        <Link to="/category/men" className="btn btn-secondary">
          <Search className="h-4 w-4" />
          Browse styles
        </Link>
      </div>
    </div>
  );
}
