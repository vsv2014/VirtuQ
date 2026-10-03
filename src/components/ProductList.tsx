import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Sliders, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { ProductCard } from './ProductCard';
import { Pagination } from './Pagination';
import { productsByCategory } from '../data/mockProducts';
import { applyFilters, buildFilters } from '../data/filters';
import type { SelectedFilters } from '../data/filters';
import type { Product } from '../types';

const ITEMS_PER_PAGE = 12;

type SortKey = 'popular' | 'newest' | 'price-low' | 'price-high';

/** "men-t-shirts-10" -> 10, so "newest" sorts numerically instead of by text. */
function numericSuffix(id: string): number {
  const last = id.split('-').pop() ?? '0';
  return Number(last) || 0;
}

function sortProducts(products: Product[], sortBy: SortKey): Product[] {
  const sorted = [...products];
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      return sorted.sort((a, b) => numericSuffix(b.id) - numericSuffix(a.id));
    default:
      return sorted;
  }
}

export function ProductList() {
  const { category, subcategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Math.max(1, Number(searchParams.get('page') || '1'));
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<SortKey>('popular');
  const [filters, setFilters] = useState<SelectedFilters>({});

  // A new category invalidates the active facets and the current page.
  useEffect(() => {
    setFilters({});
    setSortBy('popular');
    if (searchParams.get('page')) {
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subcategory, query]);

  const baseProducts = useMemo(() => {
    const list = productsByCategory(category, subcategory);
    if (!query) return list;
    return list.filter((product) =>
      [product.name, product.brand, product.subcategory, product.category]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [category, subcategory, query]);

  const filterGroups = useMemo(() => buildFilters(baseProducts), [baseProducts]);

  const filteredProducts = useMemo(
    () => sortProducts(applyFilters(baseProducts, filters), sortBy),
    [baseProducts, filters, sortBy],
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  // Clamp an out-of-range ?page= (e.g. after narrowing the filters).
  useEffect(() => {
    if (currentPage > totalPages) {
      setSearchParams({ page: String(totalPages) }, { replace: true });
    }
  }, [currentPage, totalPages, setSearchParams]);

  const pageItems = useMemo(() => {
    const start = (Math.min(currentPage, totalPages) - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setSearchParams({ page: String(page) });
  };

  const toggleFilter = (group: string, value: string) => {
    setFilters((current) => {
      const values = current[group] ?? [];
      const next = values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];
      return { ...current, [group]: next };
    });
  };

  const activeFilterCount = Object.values(filters).reduce(
    (sum, values) => sum + values.length,
    0,
  );

  const heading = query
    ? `Results for “${searchParams.get('q')?.trim()}”`
    : subcategory
      ? subcategory.replace(/-/g, ' ')
      : (category ?? 'All Products');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold capitalize">{heading}</h1>
          <p className="text-gray-600">
            {filteredProducts.length}{' '}
            {filteredProducts.length === 1 ? 'product' : 'products'}
            {activeFilterCount > 0 ? ` · ${activeFilterCount} filters` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"
            aria-expanded={isSidebarOpen}
            aria-controls="filter-sidebar"
          >
            <Sliders className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-purple-600 px-2 text-xs text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>

          <div className="relative">
            <label htmlFor="sort" className="sr-only">
              Sort products
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortKey)}
              className="appearance-none rounded-lg border bg-white px-4 py-2 pr-8"
            >
              <option value="popular">Popular</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filter sidebar — collapsed it takes no layout space */}
        {isSidebarOpen ? (
          <aside
            id="filter-sidebar"
            className="w-full flex-shrink-0 lg:w-64"
            aria-label="Product filters"
          >
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 ? (
                    <button
                      type="button"
                      onClick={() => setFilters({})}
                      className="text-sm text-purple-600 hover:underline"
                    >
                      Clear all
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-label="Close filters"
                    className="p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {filterGroups.map((group) => {
                const options = group.options;
                const expanded = showMoreFilters[group.key] ?? false;
                const visible = expanded ? options : options.slice(0, 5);

                return (
                  <div key={group.key} className="mb-4 border-b pb-4 last:border-b-0">
                    <h3 className="mb-3 font-medium">{group.label}</h3>
                    <div className="space-y-2">
                      {visible.map((option) => {
                        const checked =
                          filters[group.key]?.includes(option.label) ?? false;
                        return (
                          <label
                            key={option.label}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleFilter(group.key, option.label)}
                              className="rounded text-purple-600"
                            />
                            <span className="flex flex-1 items-center">
                              {option.hex ? (
                                <span
                                  className="mr-2 h-4 w-4 rounded-full border"
                                  style={{ backgroundColor: option.hex }}
                                />
                              ) : null}
                              {option.label}
                            </span>
                            <span className="text-gray-500">({option.count})</span>
                          </label>
                        );
                      })}

                      {options.length > 5 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setShowMoreFilters((prev) => ({
                              ...prev,
                              [group.key]: !prev[group.key],
                            }))
                          }
                          className="text-sm text-purple-600 hover:underline"
                        >
                          {expanded ? 'Show less' : `Show all ${options.length}`}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        ) : null}

        {/* Product grid */}
        <div className="flex-1">
          {pageItems.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center shadow-sm">
              <h2 className="mb-2 text-lg font-semibold">No products match</h2>
              <p className="mb-6 text-gray-600">
                Try removing a filter or picking a different category.
              </p>
              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setFilters({})}
                  className="btn btn-primary"
                >
                  Clear filters
                </button>
              ) : (
                <Link to="/" className="btn btn-secondary">
                  Back to home
                </Link>
              )}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${sortBy}-${currentPage}-${activeFilterCount}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {pageItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {totalPages > 1 ? (
            <Pagination
              currentPage={Math.min(currentPage, totalPages)}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
