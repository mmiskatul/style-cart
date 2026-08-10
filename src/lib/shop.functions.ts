import { createServerFn } from "@tanstack/react-start";

import { checkoutSchema } from "./schemas";
import type { Category, Order, OrderItem, Product } from "./types";

const PRODUCT_COLUMNS =
  "id,name,slug,description,price_cents,images,category_id,tags,inventory,status,featured,sales_count,created_at,category:categories(name,slug)";

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./db.server");
  const { data, error } = await getPublicClient()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Products could not be loaded.");
  return (data ?? []) as unknown as Product[];
});

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./db.server");
  const { data, error } = await getPublicClient()
    .from("categories")
    .select("id,name,slug,description,image,status")
    .eq("status", "active")
    .order("name");
  if (error) throw new Error("Categories could not be loaded.");
  return (data ?? []) as Category[];
});

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 200) }))
  .handler(async ({ data }) => {
    const { getPublicClient } = await import("./db.server");
    const client = getPublicClient();
    const { data: product, error } = await client
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", data.slug)
      .eq("status", "active")
      .maybeSingle();
    if (error) throw new Error("Product could not be loaded.");
    if (!product) return { product: null, related: [] as Product[] };

    const { data: related } = await client
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("status", "active")
      .eq("category_id", (product as { category_id: string | null }).category_id ?? "")
      .neq("id", (product as { id: string }).id)
      .limit(4);

    return {
      product: product as unknown as Product,
      related: (related ?? []) as unknown as Product[],
    };
  });

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => checkoutSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { shippingFor } = await import("./types");

    const ids = data.items.map((i) => i.product_id);
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("id,name,slug,images,price_cents,inventory,status")
      .in("id", ids);
    if (error) throw new Error("We could not verify your cart. Please try again.");

    const items: OrderItem[] = [];
    for (const line of data.items) {
      const product = products?.find((p) => p.id === line.product_id);
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
        image: product.images?.[0] ?? null,
        price_cents: product.price_cents,
        quantity: line.quantity,
      });
    }

    const subtotal = items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
    const shipping = shippingFor(subtotal);

    const { data: order, error: insertError } = await supabaseAdmin
      .from("orders")
      .insert({
        items: items as unknown as never,
        subtotal_cents: subtotal,
        shipping_cents: shipping,
        total_cents: subtotal + shipping,
        customer: data.customer as unknown as never,
        status: "pending",
      })
      .select("id,order_number")
      .single();
    if (insertError || !order) throw new Error("Your order could not be placed. Please try again.");

    for (const item of items) {
      const product = products?.find((p) => p.id === item.product_id);
      if (!product) continue;
      await supabaseAdmin
        .from("products")
        .update({ inventory: Math.max(0, product.inventory - item.quantity) })
        .eq("id", product.id);
    }

    return { id: order.id as string, orderNumber: order.order_number as string };
  });

export const getOrder = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => ({ id: String(data.id).slice(0, 64) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuid.test(data.id)) return null;
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "id,order_number,items,subtotal_cents,shipping_cents,total_cents,customer,status,created_at",
      )
      .eq("id", data.id)
      .maybeSingle();
    return (order ?? null) as unknown as Order | null;
  });
