import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Sliders, ChevronDown } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Pagination } from './Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProducts } from '../data/mockProducts';
import { MOCK_FILTERS } from '../data/filters';

const ITEMS_PER_PAGE = 12;

export function ProductList() {
  const { category, subcategory } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currentPage = parseInt(queryParams.get('page') || '1');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showMoreFilters, setShowMoreFilters] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState('popular');
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [totalPages, setTotalPages] = useState(1);

  // Filter products based on category and subcategory
  useEffect(() => {
    let result = mockProducts;

    if (category) {
      result = result.filter(product => product.category === category);
    }

    if (subcategory) {
      result = result.filter(product => 
        product.subcategory.toLowerCase() === subcategory.toLowerCase()
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return b.id.localeCompare(a.id);
        default:
          return 0;
      }
    });

    setFilteredProducts(result);
    setTotalPages(Math.ceil(result.length / ITEMS_PER_PAGE));
  }, [category, subcategory, sortBy]);

  const handlePageChange = (page: number) => {
    queryParams.set('page', page.toString());
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold capitalize">
          {subcategory || category || 'All Products'}
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">{filteredProducts.length} Products</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8"
            >
              <option value="popular">Popular</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className={`w-64 flex-shrink-0 transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <Sliders className="w-5 h-5" />
              </button>
            </div>

            {/* Filter sections */}
            {Object.entries(MOCK_FILTERS).map(([key, items]) => (
              <div key={key} className="border-b pb-4 mb-4">
                <h3 className="font-medium mb-3 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                <div className="space-y-2">
                  {items.slice(0, showMoreFilters[key] ? undefined : 5).map((item: any) => (
                    <label key={item.label} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded text-purple-600"
                      />
                      <span className="flex items-center">
                        {item.hex && (
                          <span 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: item.hex }}
                          />
                        )}
                        {item.label}
                      </span>
                      <span className="text-gray-500 text-sm">({item.count || 0})</span>
                    </label>
                  ))}
                  {items.length > 5 && (
                    <button
                      onClick={() => setShowMoreFilters(prev => ({
                        ...prev,
                        [key]: !prev[key]
                      }))}
                      className="text-purple-600 text-sm hover:underline"
                    >
                      {showMoreFilters[key] ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div 
              key={sortBy + currentPage}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {getCurrentPageItems().map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}