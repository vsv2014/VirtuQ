export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  image: string;
  images?: string[];
  brand: string;
  category: string;
  subcategory?: string;
  gender?: string;
  size?: string;
  sizes?: string[];
  color?: string;
  colors?: string[];
  occasion?: string;
  rating?: {
    average: number;
    total: number;
  };
  reviews?: number;
  inStock?: boolean;
  reviewCount?: number;
  stock?: number;
  tags?: string[];
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProductFilter {
  gender?: string[];
  categories?: string[];
  brands?: string[];
  occasions?: string[];
  colors?: string[];
  sizes?: string[];
  priceRanges?: {
    min: number;
    max: number;
    label: string;
  }[];
}
