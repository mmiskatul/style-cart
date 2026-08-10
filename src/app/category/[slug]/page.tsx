import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/shop/ProductCard";
import { EmptyState } from "@/components/shop/States";
import { listCategories, listProducts } from "@/lib/shop.functions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await listCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    return { title: "Category not found — Terrahaus", robots: { index: false } };
  }
  const description =
    (category.description ?? "").slice(0, 155) || `Shop ${category.name} at Terrahaus.`;
  return {
    title: `${category.name} — Terrahaus`,
    description,
    openGraph: {
      title: `${category.name} — Terrahaus`,
      description,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = await listCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const products = await listProducts();
  const list = products.filter((p) => p.category?.slug === slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="eyebrow text-muted-foreground">Category</p>
      <h1 className="display mt-3 text-4xl">{category.name}</h1>
      {category.description && (
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
