import { Product } from '../types';

// Helper function to generate mock products
const generateMockProducts = (
  subcategory: string,
  count: number,
  basePrice: number,
  category: string
): Product[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${category}-${subcategory}-${i + 1}`,
    name: `${subcategory} ${i + 1}`,
    brand: ['Essential Wear', 'Urban Style', 'Fashion Forward', 'Trendsetter', 'Luxe Life'][
      Math.floor(Math.random() * 5)
    ],
    price: Math.floor(basePrice + Math.random() * 1000),
    originalPrice: Math.floor(basePrice * 1.5 + Math.random() * 2000),
    image: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&q=80'
    ][Math.floor(Math.random() * 3)],
    category,
    subcategory,
    size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)],
    color: ['Black', 'White', 'Blue', 'Red', 'Gray'][Math.floor(Math.random() * 5)]
  }));
};

// Generate mock products for each subcategory
export const mockProducts: Product[] = [
  // Men's Top Wear
  ...generateMockProducts('Shirts & Shackets', 15, 999, 'men'),
  ...generateMockProducts('T-Shirts', 20, 499, 'men'),
  ...generateMockProducts('Jackets', 10, 1499, 'men'),
  ...generateMockProducts('Polos', 12, 799, 'men'),
  ...generateMockProducts('Hoodies & Sweatshirts', 8, 1299, 'men'),

  // Men's Bottom Wear
  ...generateMockProducts('Pants & Trousers', 18, 1199, 'men'),
  ...generateMockProducts('Shorts', 14, 699, 'men'),
  ...generateMockProducts('Cargos & Parachutes', 10, 1399, 'men'),
  ...generateMockProducts('Jeans', 16, 1599, 'men'),
  ...generateMockProducts('Joggers', 12, 899, 'men'),

  // Men's Athleisure
  ...generateMockProducts('Track Pants', 10, 799, 'men'),
  ...generateMockProducts('Athletic Shorts', 12, 599, 'men'),
  ...generateMockProducts('Athletic T-Shirts', 15, 499, 'men'),
  ...generateMockProducts('Tanks', 8, 399, 'men'),

  // Women's Top Wear
  ...generateMockProducts('T-Shirts', 20, 499, 'women'),
  ...generateMockProducts('Tops', 25, 699, 'women'),
  ...generateMockProducts('Shirts', 15, 899, 'women'),
  ...generateMockProducts('Bustiers & Corsets', 10, 1299, 'women'),
  ...generateMockProducts('Blazers', 12, 1999, 'women'),

  // Women's Bottom Wear
  ...generateMockProducts('Jeans', 20, 1599, 'women'),
  ...generateMockProducts('Skirts', 15, 899, 'women'),
  ...generateMockProducts('Shorts', 12, 699, 'women'),
  ...generateMockProducts('Pants & Trousers', 18, 1199, 'women'),
  ...generateMockProducts('Joggers', 10, 899, 'women'),

  // Women's Dresses
  ...generateMockProducts('Bodycon', 12, 1299, 'women'),
  ...generateMockProducts('Midi', 15, 1499, 'women'),
  ...generateMockProducts('Mini', 10, 999, 'women'),
  ...generateMockProducts('Maxi', 8, 1799, 'women')
];