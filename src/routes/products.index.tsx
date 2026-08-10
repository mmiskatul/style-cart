import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";

import { ProductGrid } from "@/components/shop/ProductCard";
import { EmptyState, ErrorState } from "@/components/shop/States";
import { formatPrice } from "@/lib/format";
import { categoriesQuery, productsQuery } from "@/lib/queries.client";
import type { Product } from "@/lib/types";

const searchSchema = z.object({
  q: z.string().max(80).optional(),
  category: z.string().max(60).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "popular"]).optional(),
});

export const Route = createFileRoute("/products/")({
  validateSearch: searchSchema,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery);
    context.queryClient.ensureQueryData(categoriesQuery);
  },
  head: () => ({
    meta: [
      { title: "Shop all — Terrahaus" },
      {
        name: "description",
        content:
          "Browse every Terrahaus product: wool runners, knitwear, totes and home goods. Filter by category, price and material.",
      },
      { property: "og:title", content: "Shop all — Terrahaus" },
      {
        property: "og:description",
        content: "Filter the full Terrahaus catalogue by category, price and material.",
      },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <ErrorState message={error.message} />
    </div>
  ),
  component: ProductsPage,
});

export function applyFilters(
  products: Product[],
  opts: {
    q?: string;
    categorySlug?: string;
    maxPrice?: number;
    tags?: string[];
    sort?: string;
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

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);

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
    q: search.q,
    categorySlug: search.category,
    maxPrice,
    tags,
    sort: search.sort,
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
                  onClick={() => navigate({ to: "/products", search: (prev: z.infer<typeof searchSchema>) => ({ ...prev, category: undefined }) })}
                  className={!search.category ? "font-medium" : "text-muted-foreground"}
                >
                  All
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() =>
                      navigate({ to: "/products", search: (prev: z.infer<typeof searchSchema>) => ({ ...prev, category: category.slug }) })
                    }
                    className={
                      search.category === category.slug ? "font-medium" : "text-muted-foreground"
                    }
                  >
                    {category.name}
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
              value={search.sort ?? "newest"}
              onChange={(e) =>
                navigate({ to: "/products",
                  search: (prev: z.infer<typeof searchSchema>) => ({
                    ...prev,
                    sort: e.target.value as "newest" | "price-asc" | "price-desc" | "popular",
                  }),
                })
              }
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
