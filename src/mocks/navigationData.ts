import { NavigationItem } from '../types';

export const mainNavigationData: NavigationItem[] = [
  {
    id: 'new-arrivals',
    label: 'New Arrivals',
    href: '/new-arrivals',
    type: 'collection',
    featured: true
  },
  {
    id: 'women',
    label: 'Women',
    href: '/women',
    type: 'category',
    columns: [
      {
        title: 'Clothing',
        items: [
          { label: 'Dresses', href: '/women/clothing/dresses' },
          { label: 'Tops', href: '/women/clothing/tops' },
          { label: 'Jeans', href: '/women/clothing/jeans', isNew: true },
          { label: 'Skirts', href: '/women/clothing/skirts' },
          { label: 'Activewear', href: '/women/clothing/activewear' }
        ]
      },
      {
        title: 'Accessories',
        items: [
          { label: 'Jewelry', href: '/women/accessories/jewelry' },
          { label: 'Bags', href: '/women/accessories/bags' },
          { label: 'Watches', href: '/women/accessories/watches' },
          { label: 'Sunglasses', href: '/women/accessories/sunglasses' }
        ]
      },
      {
        title: 'Footwear',
        items: [
          { label: 'Heels', href: '/women/footwear/heels' },
          { label: 'Flats', href: '/women/footwear/flats' },
          { label: 'Sneakers', href: '/women/footwear/sneakers', isNew: true },
          { label: 'Boots', href: '/women/footwear/boots' }
        ]
      }
    ]
  },
  {
    id: 'men',
    label: 'Men',
    href: '/men',
    type: 'category',
    columns: [
      {
        title: 'Clothing',
        items: [
          { label: 'T-Shirts', href: '/men/clothing/t-shirts' },
          { label: 'Shirts', href: '/men/clothing/shirts' },
          { label: 'Jeans', href: '/men/clothing/jeans' },
          { label: 'Suits', href: '/men/clothing/suits', isNew: true }
        ]
      },
      {
        title: 'Accessories',
        items: [
          { label: 'Watches', href: '/men/accessories/watches' },
          { label: 'Belts', href: '/men/accessories/belts' },
          { label: 'Sunglasses', href: '/men/accessories/sunglasses' }
        ]
      },
      {
        title: 'Footwear',
        items: [
          { label: 'Sneakers', href: '/men/footwear/sneakers' },
          { label: 'Formal Shoes', href: '/men/footwear/formal' },
          { label: 'Boots', href: '/men/footwear/boots', isNew: true }
        ]
      }
    ]
  },
  {
    id: 'kids',
    label: 'Kids',
    href: '/kids',
    type: 'category'
  },
  {
    id: 'brands',
    label: 'Brands',
    href: '/brands',
    type: 'brand'
  },
  {
    id: 'sale',
    label: 'Sale',
    href: '/sale',
    type: 'sale',
    featured: true
  }
];
