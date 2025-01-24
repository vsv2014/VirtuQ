import { useEffect, useState } from 'react';
import { Product } from '../types';

interface ProductRecommendationsProps {
  currentProduct: Product;
  maxRecommendations?: number;
}

export function ProductRecommendations({ 
  currentProduct, 
  maxRecommendations = 4 
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    if (currentProduct?.recommendedProducts?.length > 0) {
      setRecommendations(currentProduct.recommendedProducts.slice(0, maxRecommendations));
    } else {
      setRecommendations([]);
    }
  }, [currentProduct, maxRecommendations]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">You might also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <div key={product.id} className="group relative">
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200">
              <img
                src={product.images?.[0] ?? product.image}
                alt={product.name}
                className="h-full w-full object-cover object-center group-hover:opacity-75"
              />
            </div>
            <div className="mt-4 flex justify-between">
              <div>
                <h3 className="text-sm text-gray-700">
                  <a href={`/product/${product.id}`}>
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.name}
                  </a>
                </h3>
                <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">₹{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
