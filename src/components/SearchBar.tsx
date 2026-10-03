import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import type { FormEvent } from 'react';

/**
 * Functional search: submitting navigates to /search?q=…, which the product
 * listing renders. Previously the input had no state and did nothing.
 */
export function SearchBar() {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const query = term.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/');
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="relative hidden flex-1 md:block"
    >
      <label htmlFor="site-search" className="sr-only">
        Search for products, brands and more
      </label>
      <div className="flex items-center rounded-full bg-gray-100">
        <input
          id="site-search"
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search for products, brands and more"
          className="w-full bg-transparent py-2 pl-4 pr-10 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-0 top-0 flex h-full items-center px-3 text-gray-500 hover:text-purple-600"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
