/**
 * Single source of truth for the product catalog.
 *
 * Shared by the web client (browsing) and the API server (price authority).
 * Prices are generated deterministically from a fixed seed so that:
 *  - the catalog is stable across page reloads,
 *  - the server can re-derive the true price of any item and reject tampered
 *    amounts submitted by a client.
 */

/** @typedef {{ id: string, name: string, brand: string, price: number, originalPrice: number, image: string, category: string, subcategory: string, sizes: string[], colors: string[] }} Product */

const BRANDS = [
  'Essential Wear',
  'Urban Style',
  'Fashion Forward',
  'Trendsetter',
  'Luxe Life',
];

const IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&q=80',
];

const SIZES = ['S', 'M', 'L', 'XL'];
const COLORS = ['Black', 'White', 'Blue', 'Red', 'Gray'];

/**
 * category -> group -> [subcategory, count, basePrice]
 * Kept identical to the merchandising tree rendered by <Navigation />.
 */
const LAYOUT = [
  {
    category: 'men',
    groups: [
      {
        title: 'Top Wear',
        items: [
          ['Shirts & Shackets', 15, 999],
          ['T-Shirts', 20, 499],
          ['Jackets', 10, 1499],
          ['Polos', 12, 799],
          ['Hoodies & Sweatshirts', 8, 1299],
        ],
      },
      {
        title: 'Bottom Wear',
        items: [
          ['Pants & Trousers', 18, 1199],
          ['Shorts', 14, 699],
          ['Cargos & Parachutes', 10, 1399],
          ['Jeans', 16, 1599],
          ['Joggers', 12, 899],
        ],
      },
      {
        title: 'Athleisure',
        items: [
          ['Track Pants', 10, 799],
          ['Athletic Shorts', 12, 599],
          ['Athletic T-Shirts', 15, 499],
          ['Tanks', 8, 399],
        ],
      },
    ],
  },
  {
    category: 'women',
    groups: [
      {
        title: 'Top Wear',
        items: [
          ['T-Shirts', 20, 499],
          ['Tops', 25, 699],
          ['Shirts', 15, 899],
          ['Bustiers & Corsets', 10, 1299],
          ['Blazers', 12, 1999],
        ],
      },
      {
        title: 'Bottom Wear',
        items: [
          ['Jeans', 20, 1599],
          ['Skirts', 15, 899],
          ['Shorts', 12, 699],
          ['Pants & Trousers', 18, 1199],
          ['Joggers', 10, 899],
        ],
      },
      {
        title: 'Dresses',
        items: [
          ['Bodycon', 12, 1299],
          ['Midi', 15, 1499],
          ['Mini', 10, 999],
          ['Maxi', 8, 1799],
        ],
      },
    ],
  },
];

/** Deterministic PRNG (mulberry32) so the catalog is byte-identical every run. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable string hash, used to derive a per-product seed. */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** URL-safe slug: "Shirts & Shackets" -> "shirts-shackets". */
export function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildCatalog() {
  /** @type {Product[]} */
  const products = [];

  for (const { category, groups } of LAYOUT) {
    for (const group of groups) {
      for (const [subcategory, count, basePrice] of group.items) {
        for (let i = 0; i < count; i += 1) {
          const id = `${category}-${slugify(subcategory)}-${i + 1}`;
          const random = mulberry32(hash(id));

          // Price sits in [basePrice, basePrice + 1000).
          const price = Math.round(basePrice + random() * 1000);

          // Derive originalPrice from a discount rate so it is ALWAYS greater
          // than price (previously the two were drawn independently, which
          // produced ~5% of products with a negative "X% off" badge).
          const discountRate = 0.2 + random() * 0.4; // 20% - 60% off
          const originalPrice = Math.round(price / (1 - discountRate));

          products.push({
            id,
            name: `${subcategory} ${i + 1}`,
            brand: BRANDS[Math.floor(random() * BRANDS.length)],
            price,
            originalPrice,
            image: IMAGES[Math.floor(random() * IMAGES.length)],
            category,
            subcategory,
            sizes: SIZES,
            colors: COLORS,
          });
        }
      }
    }
  }

  return products;
}

/** @type {Product[]} */
export const CATALOG = buildCatalog();

const BY_ID = new Map(CATALOG.map((product) => [product.id, product]));

/** @param {string} id @returns {Product | null} */
export function findProduct(id) {
  return BY_ID.get(String(id)) || null;
}

/** Merchandising tree derived from the catalog, used by navigation + filters. */
export const CATEGORY_TREE = LAYOUT.map(({ category, groups }) => ({
  label: category === 'men' ? 'Men' : 'Women',
  slug: category,
  href: `/category/${category}`,
  groups: groups.map((group) => ({
    title: group.title,
    slug: slugify(group.title),
    items: group.items.map(([subcategory, count]) => ({
      label: subcategory,
      slug: slugify(subcategory),
      count,
    })),
  })),
}));

/** Every distinct subcategory, for the filter sidebar. */
export const SUBCATEGORIES = [...new Set(CATALOG.map((p) => p.subcategory))].sort();
