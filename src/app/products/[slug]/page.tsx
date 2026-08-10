import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProductBySlug } from "@/lib/shop.functions";

import { ProductDetailClient } from "./ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getProductBySlug(slug);
  if (!product) {
    return { title: "Product unavailable — Terrahaus", robots: { index: false } };
  }
  const description = product.description.slice(0, 155) || "A Terrahaus essential.";
  return {
    title: `${product.name} — Terrahaus`,
    description,
    openGraph: {
      title: `${product.name} — Terrahaus`,
      description,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data.product) notFound();

  return <ProductDetailClient product={data.product} related={data.related} />;
}
