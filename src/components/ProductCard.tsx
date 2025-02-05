import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[3/4]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
            <Heart className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
          <p className="text-gray-500 text-sm mb-2">{product.brand}</p>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">₹{product.price}</span>
            <span className="text-gray-500 line-through text-sm">₹{product.originalPrice}</span>
            <span className="text-green-600 text-sm">{discount}% off</span>
          </div>
        </div>
      </Link>
    </div>
  );
}