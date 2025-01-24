import { NavigationItem } from '../../types/navigation';

export const mockNavigation: NavigationItem[] = [
  {
    id: 'men',
    label: 'Men',
    href: '/category/men',
    type: 'category',
    subcategories: [
      {
        title: 'Clothing',
        items: ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets']
      },
      {
        title: 'Footwear',
        items: ['Sneakers', 'Formal Shoes', 'Boots', 'Sandals']
      },
      {
        title: 'Accessories',
        items: ['Watches', 'Belts', 'Wallets', 'Sunglasses']
      }
    ]
  },
  {
    id: 'women',
    label: 'Women',
    href: '/category/women',
    type: 'category',
    subcategories: [
      {
        title: 'Clothing',
        items: ['Dresses', 'Tops', 'Jeans', 'Skirts', 'Jackets']
      },
      {
        title: 'Footwear',
        items: ['Heels', 'Flats', 'Boots', 'Sneakers']
      },
      {
        title: 'Accessories',
        items: ['Jewelry', 'Bags', 'Scarves', 'Sunglasses']
      }
    ]
  },
  {
    id: 'kids',
    label: 'Kids',
    href: '/category/kids',
    type: 'category',
    subcategories: [
      {
        title: 'Boys',
        items: ['T-Shirts', 'Shirts', 'Jeans', 'Shorts']
      },
      {
        title: 'Girls',
        items: ['Dresses', 'Tops', 'Skirts', 'Jeans']
      }
    ]
  }
];
