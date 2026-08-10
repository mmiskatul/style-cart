import type { Metadata } from "next";

import { ProductGrid } from "@/components/shop/ProductCard";
import { EmptyState } from "@/components/shop/States";
import { listProducts } from "@/lib/shop.functions";

export const metadata: Metadata = {
  title: "Search — Terrahaus",
  description: "Search the Terrahaus catalogue by name, material or tag.",
  openGraph: {
    title: "Search — Terrahaus",
    description: "Find Terrahaus products by name, material or tag.",
  },
  robots: { index: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await listProducts();
  const term = (q ?? "").trim().toLowerCase();
  const results = term
    ? products.filter((p) =>
        `${p.name} ${p.description} ${p.tags.join(" ")} ${p.category?.name ?? ""}`
          .toLowerCase()
          .includes(term),
      )
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="display text-4xl">Search</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {term ? `${results.length} results for “${q}”` : "Type a search from the header to begin."}
      </p>
      <div className="mt-10">
        {term && results.length === 0 ? (
          <EmptyState
            title="No matches"
            description="Try a broader term like “wool”, “tote” or “sneaker”."
          />
        ) : (
          <ProductGrid products={results} />
        )}
      </div>
    </div>
  );
}
