export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images?: string[];
  category: string;
  brand?: string;
  rating?: {
    average: number;
    total: number;
  };
  reviews?: number;
  inStock?: boolean;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  variations?: {
    size: string;
    color: string;
    stock: number;
    sku: string;
  }[];
}

export interface Answer {
  id: string;
  answerText: string;
  answeredBy: string;
  answeredDate: string;
  upvotes: number;
  isSeller?: boolean;
  isVerified?: boolean;
}

export interface QuestionAnswer {
  id: string;
  questionText: string;
  askedBy: string;
  askedDate: string;
  answers: Answer[];
  productId: string;
  status: 'pending' | 'answered' | 'closed';
}

export interface CategoryFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  sizes?: string[];
  colors?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  parentId?: string;
  children?: Category[];
  products?: Product[];
  attributes?: CategoryAttribute[];
  productCount?: number;
  featured?: boolean;
  subcategories?: Category[];
}

export interface CategoryAttribute {
  name: string;
  values: string[];
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  type?: 'category' | 'collection' | 'brand' | 'sale' | 'featured';
  featured?: boolean;
  columns?: NavigationColumn[];
  isNew?: boolean;
  image?: string;
}

export interface NavigationColumn {
  title: string;
  items: NavigationItem[];
}
