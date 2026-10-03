import { slugify } from '../../shared/catalog.js';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  subcategory: string;
  /** Variants a shopper can choose from (arrays, not single values). */
  sizes: string[];
  colors: string[];
}

export interface CartItem {
  /** productId + variant, so two sizes of the same product stay separate. */
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export interface Address {
  id?: string;
  name: string;
  phone: string;
  pincode: string;
  city: string;
  state: string;
  locality: string;
  building: string;
  landmark?: string;
  type: 'home' | 'office' | 'other';
  isDefault?: boolean;
}

export type OrderItemStatus = 'pending' | 'kept' | 'returned';

export interface OrderItem {
  id: string;
  itemId: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  status: OrderItemStatus;
}

export const ORDER_STATUSES = [
  'created',
  'confirmed',
  'out_for_delivery',
  'delivered',
  'trial_started',
  'trial_completed',
  'return_initiated',
  'return_completed',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  /** Mirrored from Mongo's `_id` by the API serializer. */
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  address: Address;
  orderTime: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  trialStartedAt?: string;
  trialEndsAt?: string;
  trialCompletedAt?: string;
  returnInitiatedAt?: string;
  returnCompletedAt?: string;
  cancelledAt?: string;
  subtotal: number;
  gst: number;
  deliveryFee: number;
  handlingFee: number;
  total: number;
  paymentStatus: 'pending' | 'completed' | 'refunded';
  paymentId?: string;
  returnPickupCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  addresses: Address[];
}

export interface SubcategoryLink {
  label: string;
  slug: string;
  count: number;
}

export interface CategoryGroup {
  title: string;
  slug: string;
  items: SubcategoryLink[];
}

export interface Category {
  label: string;
  slug: string;
  href: string;
  groups: CategoryGroup[];
}

export { slugify };
