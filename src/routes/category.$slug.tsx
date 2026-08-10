import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { ProductGrid } from "@/components/shop/ProductCard";
import { EmptyState, ErrorState } from "@/components/shop/States";
import { categoriesQuery, productsQuery } from "@/lib/queries.client";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ context, params }) => {
    const categories = await context.queryClient.ensureQueryData(categoriesQuery);
    const category = categories.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    context.queryClient.ensureQueryData(productsQuery);
    return { name: category.name, description: category.description ?? "" };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Category not found — Terrahaus" }, { name: "robots", content: "noindex" }],
      };
    }
    const description =
      loaderData.description.slice(0, 155) || `Shop ${loaderData.name} at Terrahaus.`;
    return {
      meta: [
        { title: `${loaderData.name} — Terrahaus` },
        { name: "description", content: description },
        { property: "og:title", content: `${loaderData.name} — Terrahaus` },
        { property: "og:description", content: description },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <ErrorState message={error.message} />
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const category = categories.find((c) => c.slug === slug);
  const list = products.filter((p) => p.category?.slug === slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="eyebrow text-muted-foreground">Category</p>
      <h1 className="display mt-3 text-4xl">{category?.name ?? slug}</h1>
      {category?.description && (
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">{category.description}</p>
      )}
      <div className="mt-10">
        {list.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description="We're restocking this category. Check back soon."
          />
        ) : (
          <ProductGrid products={list} />
        )}
      </div>
    </div>
  );
}
