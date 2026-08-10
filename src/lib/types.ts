export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  status: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  images: string[];
  category_id: string | null;
  tags: string[];
  inventory: number;
  status: string;
  featured: boolean;
  sales_count: number;
  created_at: string;
  category?: { name: string; slug: string } | null;
};

export type OrderItem = {
  product_id: string;
  name: string;
  slug: string;
  image: string | null;
  price_cents: number;
  quantity: number;
};

export type CustomerInfo = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

export type Order = {
  id: string;
  order_number: string;
  items: OrderItem[];
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  customer: CustomerInfo;
  status: string;
  created_at: string;
};

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const FREE_SHIPPING_THRESHOLD_CENTS = 15000;
export const SHIPPING_FLAT_CENTS = 800;

export function shippingFor(subtotalCents: number) {
  if (subtotalCents === 0) return 0;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
}
