import {
  CATALOG,
  CATEGORY_TREE,
  SUBCATEGORIES,
  findProduct,
  slugify,
} from '../../shared/catalog.js';
import type { Category, Product } from '../types';

/**
 * The catalog lives in `shared/catalog.js` so the API server and this client
 * agree on ids, prices and variants.
 *
 * Previously it was generated with `Math.random()` at module scope, so every
 * page reload produced different prices, brands and images.
 */
export const mockProducts = CATALOG as Product[];

export const categories = CATEGORY_TREE as unknown as Category[];

export const subcategories = SUBCATEGORIES;

export { slugify };

const PRODUCTS_BY_ID = new Map(mockProducts.map((p) => [p.id, p]));

export function getProduct(id: string | undefined): Product | null {
  if (!id) return null;
  return PRODUCTS_BY_ID.get(id) ?? (findProduct(id) as Product | null);
}

export function productsByCategory(category?: string, subcategory?: string) {
  return mockProducts.filter((product) => {
    if (category && product.category !== category) return false;
    if (subcategory && slugify(product.subcategory) !== slugify(subcategory)) {
      return false;
    }
    return true;
  });
}

/** All brands present in the catalog, alphabetically. */
export const brands = [...new Set(mockProducts.map((p) => p.brand))].sort();
