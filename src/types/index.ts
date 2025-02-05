export interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice: number;
    image: string;
    category: string;
    subcategory: string;
    size: string;
    color: string;
  }
  
  export interface Category {
    label: string;
    href: string;
    subcategories: Subcategory[];
  }
  
  export interface Subcategory {
    title: string;
    items: string[];
  }