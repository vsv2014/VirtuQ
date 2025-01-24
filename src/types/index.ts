// import { ProductRating } from './review';
// import { Review } from './review';
import { Product } from './product';

export interface ProductVariation {
  size: string;
  color: string;
  stock: number;
  sku: string;
}

export type { Product };

export interface Category {
  label: string;
  href: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  title: string;
  items: string[];
}

export interface QuestionAnswer {
  id: string;
  questionText: string;
  askedBy: string;
  askedDate: string;
  answers: Answer[];
  productId: string;
  status: 'pending' | 'answered';
}

export interface Answer {
  id: string;
  answerText: string;
  answeredBy: string;
  answeredDate: string;
  isVerified: boolean;
  isSeller: boolean;
  upvotes: number;
}