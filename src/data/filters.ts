import { discountPercent } from '../lib/format';
import { mockProducts } from './mockProducts';
import type { Product } from '../types';

export interface FilterOption {
  label: string;
  count: number;
  hex?: string;
  min?: number;
  max?: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

const COLORS: { label: string; hex: string }[] = [
  { label: 'Black', hex: '#000000' },
  { label: 'White', hex: '#FFFFFF' },
  { label: 'Blue', hex: '#2563eb' },
  { label: 'Red', hex: '#dc2626' },
  { label: 'Gray', hex: '#6b7280' },
];

const PRICE_RANGES = [
  { label: 'Below ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹1000', min: 500, max: 1000 },
  { label: '₹1001 – ₹1500', min: 1001, max: 1500 },
  { label: '₹1501 – ₹2000', min: 1501, max: 2000 },
  { label: 'Above ₹2000', min: 2000, max: Infinity },
];

const DISCOUNT_RANGES = [
  { label: '20% and below', min: 0, max: 20 },
  { label: '21% – 40%', min: 21, max: 40 },
  { label: '41% – 60%', min: 41, max: 60 },
];

function tally(products: Product[], getKey: (product: Product) => string) {
  const counts = new Map<string, number>();
  for (const product of products) {
    const key = getKey(product);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/**
 * Filter options derived from the catalog, so the counts shown in the sidebar
 * always match what the grid can actually return.
 */
export function buildFilters(products: Product[] = mockProducts): FilterGroup[] {
  const categoryCounts = tally(products, (p) => p.subcategory);
  const brandCounts = tally(products, (p) => p.brand);

  return [
    {
      key: 'category',
      label: 'Category',
      options: [...categoryCounts.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    },
    {
      key: 'brand',
      label: 'Brand',
      options: [...brandCounts.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    },
    {
      key: 'price',
      label: 'Price',
      options: PRICE_RANGES.map((range) => ({
        label: range.label,
        min: range.min,
        max: range.max,
        count: products.filter((p) => p.price >= range.min && p.price < range.max)
          .length,
      })),
    },
    {
      key: 'discount',
      label: 'Discount',
      options: DISCOUNT_RANGES.map((range) => ({
        label: range.label,
        min: range.min,
        max: range.max,
        count: products.filter((p) => {
          const value = discountPercent(p.price, p.originalPrice);
          return value >= range.min && value <= range.max;
        }).length,
      })),
    },
    {
      key: 'color',
      label: 'Color',
      options: COLORS.map(({ label, hex }) => ({
        label,
        hex,
        count: products.filter((p) => p.colors.includes(label)).length,
      })),
    },
    {
      key: 'size',
      label: 'Size',
      options: ['S', 'M', 'L', 'XL'].map((size) => ({
        label: size,
        count: products.filter((p) => p.sizes.includes(size)).length,
      })),
    },
  ];
}

export type SelectedFilters = Record<string, string[]>;

export const EMPTY_FILTERS: SelectedFilters = {};

/** Applies the selected facets to a product list. */
export function applyFilters(
  products: Product[],
  selected: SelectedFilters,
): Product[] {
  const active = Object.entries(selected).filter(([, values]) => values.length > 0);
  if (active.length === 0) return products;

  return products.filter((product) => {
    return active.every(([key, values]) => {
      switch (key) {
        case 'category':
          return values.includes(product.subcategory);
        case 'brand':
          return values.includes(product.brand);
        case 'color':
          return values.some((color) => product.colors.includes(color));
        case 'size':
          return values.some((size) => product.sizes.includes(size));
        case 'price': {
          const range = PRICE_RANGES.find((r) => r.label === values[0]);
          return range ? product.price >= range.min && product.price < range.max : true;
        }
        case 'discount': {
          const range = DISCOUNT_RANGES.find((r) => r.label === values[0]);
          if (!range) return true;
          const value = discountPercent(product.price, product.originalPrice);
          return value >= range.min && value <= range.max;
        }
        default:
          return true;
      }
    });
  });
}
