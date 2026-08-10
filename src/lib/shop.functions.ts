import { CATEGORIES, PRODUCTS } from "./catalog";
import { checkoutSchema } from "./schemas";
import { shippingFor } from "./types";
import type { Category, Order, OrderItem, Product } from "./types";

export async function listProducts(): Promise<Product[]> {
  return PRODUCTS.filter((p) => p.status === "active");
}

export async function listCategories(): Promise<Category[]> {
  return CATEGORIES.filter((c) => c.status === "active").sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export async function getProductBySlug(
  slug: string,
): Promise<{ product: Product | null; related: Product[] }> {
  const cleanSlug = String(slug).slice(0, 200);
  const product = PRODUCTS.find((p) => p.slug === cleanSlug && p.status === "active") ?? null;
  if (!product) return { product: null, related: [] };

  const related = PRODUCTS.filter(
    (p) => p.status === "active" && p.category_id === product.category_id && p.id !== product.id,
  ).slice(0, 4);

  return { product, related };
}

/**
 * This storefront has no backend — "placing an order" just validates the
 * cart against the static catalog and returns a receipt. Nothing is persisted.
 */
export function placeOrder(input: unknown): Order {
  const data = checkoutSchema.parse(input);

  const items: OrderItem[] = [];
  for (const line of data.items) {
    const product = PRODUCTS.find((p) => p.id === line.product_id);
    if (!product || product.status !== "active") {
      throw new Error("One of the products in your cart is no longer available.");
    }
    if (product.inventory < line.quantity) {
      throw new Error(`${product.name} does not have enough stock left.`);
    }
    items.push({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] ?? null,
      price_cents: product.price_cents,
      quantity: line.quantity,
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
  const shipping = shippingFor(subtotal);

  return {
    id: crypto.randomUUID(),
    order_number: `TH-${Math.floor(100000 + Math.random() * 900000)}`,
    items,
    subtotal_cents: subtotal,
    shipping_cents: shipping,
    total_cents: subtotal + shipping,
    customer: data.customer,
    status: "pending",
    created_at: new Date().toISOString(),
  };
}
