import type { Metadata } from "next";
import { Suspense } from "react";

import { listCategories, listProducts } from "@/lib/shop.functions";

import { ProductsClient } from "./ProductsClient";

export const metadata: Metadata = {
  title: "Shop all — Terrahaus",
  description:
    "Browse every Terrahaus product: wool runners, knitwear, totes and home goods. Filter by category, price and material.",
  openGraph: {
    title: "Shop all — Terrahaus",
    description: "Filter the full Terrahaus catalogue by category, price and material.",
  },
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <ProductsClient products={products} categories={categories} />
    </Suspense>
  );
}
