import { FC } from 'react';
import { Product } from '../types/product';
import { ProductCard } from './ProductCard';
import { Pagination } from '../components/Pagination';

interface ProductListProps {
  products: Product[];
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  viewMode?: 'grid' | 'list';
}

export const ProductList: FC<ProductListProps> = ({
  products,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  viewMode = 'grid'
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div>
      <div className={`grid ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      } gap-6`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            viewMode={viewMode}
          />
        ))}
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="mt-8">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};