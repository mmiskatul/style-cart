import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ProductGrid } from "@/components/shop/ProductCard";
import { EmptyState, ErrorState } from "@/components/shop/States";
import { productsQuery } from "@/lib/queries.client";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().max(80).optional() }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery);
  },
  head: () => ({
    meta: [
      { title: "Search — Terrahaus" },
      { name: "description", content: "Search the Terrahaus catalogue by name, material or tag." },
      { property: "og:title", content: "Search — Terrahaus" },
      { property: "og:description", content: "Find Terrahaus products by name, material or tag." },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <ErrorState message={error.message} />
    </div>
  ),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data: products } = useSuspenseQuery(productsQuery);
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
