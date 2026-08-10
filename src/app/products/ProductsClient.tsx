"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { ProductGrid } from "@/components/shop/ProductCard";
import { EmptyState } from "@/components/shop/States";
import { formatPrice } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

export function applyFilters(
  products: Product[],
  opts: {
    q?: string | undefined;
    categorySlug?: string | undefined;
    maxPrice?: number | undefined;
    tags?: string[] | undefined;
    sort?: string | undefined;
  },
) {
  const q = opts.q?.trim().toLowerCase();
  let list = products.filter((product) => {
    if (opts.categorySlug && product.category?.slug !== opts.categorySlug) return false;
    if (typeof opts.maxPrice === "number" && product.price_cents > opts.maxPrice) return false;
    if (opts.tags?.length && !opts.tags.every((t) => product.tags.includes(t))) return false;
    if (q) {
      const haystack = `${product.name} ${product.description} ${product.tags.join(" ")}`;
      if (!haystack.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  list = [...list];
  if (opts.sort === "price-asc") list.sort((a, b) => a.price_cents - b.price_cents);
  else if (opts.sort === "price-desc") list.sort((a, b) => b.price_cents - a.price_cents);
  else if (opts.sort === "popular") list.sort((a, b) => b.sales_count - a.sales_count);
  return list;
}

export function ProductsClient({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;

  function updateSearch(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) next.delete(key);
      else next.set(key, value);
    }
    router.push(`/products${next.toString() ? `?${next.toString()}` : ""}`);
  }

  const maxCatalogPrice = useMemo(
    () => Math.max(10000, ...products.map((p) => p.price_cents)),
    [products],
  );
  const [maxPrice, setMaxPrice] = useState(maxCatalogPrice);
  const [tags, setTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return [...set].sort().slice(0, 18);
  }, [products]);

  const filtered = applyFilters(products, {
    q,
    categorySlug: category,
    maxPrice,
    tags,
    sort,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="display text-4xl">Shop all</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "product" : "products"}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-8">
          <div>
            <h2 className="eyebrow text-muted-foreground">Category</h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li>
                <button
                  onClick={() => updateSearch({ category: undefined })}
                  className={!category ? "font-medium" : "text-muted-foreground"}
                >
                  All
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => updateSearch({ category: cat.slug })}
                    className={category === cat.slug ? "font-medium" : "text-muted-foreground"}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow text-muted-foreground">Max price</h2>
            <input
              type="range"
              min={1000}
              max={maxCatalogPrice}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-3 w-full accent-primary"
              aria-label="Maximum price"
            />
            <p className="mt-1 text-sm text-muted-foreground">Up to {formatPrice(maxPrice)}</p>
          </div>

          {allTags.length > 0 && (
            <div>
              <h2 className="eyebrow text-muted-foreground">Material &amp; style</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {allTags.map((tag) => {
                  const active = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() =>
                        setTags((prev) =>
                          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
                        )
                      }
                      className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        <div>
          <div className="mb-6 flex justify-end">
            <select
              value={sort ?? "newest"}
              onChange={(e) => updateSearch({ sort: e.target.value })}
              aria-label="Sort products"
              className="rounded-sm border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most popular</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No products match those filters"
              description="Try widening the price range or clearing a few tags."
            />
          ) : (
            <ProductGrid products={filtered} />
          )}
        </div>
      </div>
    </div>
  );
}
