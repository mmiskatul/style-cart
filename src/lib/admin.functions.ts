import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { PRODUCT_COLUMNS } from "./queries";
import { productInputSchema } from "./schemas";
import type { Order, Product } from "./types";

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: isAdmin }, { data: orders }] = await Promise.all([
      supabase.from("profiles").select("id,name,email").eq("id", userId).maybeSingle(),
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      supabase
        .from("orders")
        .select("id,order_number,total_cents,status,created_at,items")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);
    return {
      profile: (profile ?? null) as { id: string; name: string | null; email: string | null } | null,
      isAdmin: Boolean(isAdmin),
      orders: (orders ?? []) as unknown as Order[],
    };
  });

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { data, error } = await context.supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw new Error("Products could not be loaded.");
    return (data ?? []) as unknown as Product[];
  });

export const adminGetProduct = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => ({ id: String(data.id).slice(0, 64) }))
  .handler(async ({ context, data }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { data: product } = await context.supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("id", data.id)
      .maybeSingle();
    return (product ?? null) as unknown as Product | null;
  });

export const adminSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const parsed = productInputSchema
      .extend({ id: productInputSchema.shape.slug.optional() })
      .omit({})
      .parse(data as Record<string, unknown>);
    return parsed as typeof parsed & { id?: string };
  })
  .handler(async ({ context, data }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { id, ...values } = data as typeof data & { id?: string };
    if (id) {
      const { error } = await context.supabase.from("products").update(values).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: created, error } = await context.supabase
      .from("products")
      .insert(values)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: created.id as string };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => ({ id: String(data.id).slice(0, 64) }))
  .handler(async ({ context, data }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGenerateTags = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { name: string; description: string; category: string }) => ({
    name: String(data.name ?? "").slice(0, 200),
    description: String(data.description ?? "").slice(0, 2000),
    category: String(data.category ?? "").slice(0, 100),
  }))
  .handler(async ({ context, data }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    if (data.name.trim().length < 2) throw new Error("Add a product name first.");
    const { generateProductTags } = await import("./ai.server");
    return { tags: await generateProductTags(data) };
  });

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { data } = await context.supabase
      .from("orders")
      .select(
        "id,order_number,items,subtotal_cents,shipping_cents,total_cents,customer,status,created_at",
      )
      .order("created_at", { ascending: false });
    return (data ?? []) as unknown as Order[];
  });
