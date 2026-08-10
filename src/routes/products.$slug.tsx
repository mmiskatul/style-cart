import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ProductGrid } from "@/components/shop/ProductCard";
import { ErrorState } from "@/components/shop/States";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-store";
import { productQuery } from "@/lib/queries.client";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/types";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!result.product) throw notFound();
    return { name: result.product.name, description: result.product.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product unavailable — Terrahaus" }, { name: "robots", content: "noindex" }] };
    }
    const description = loaderData.description.slice(0, 155) || "A Terrahaus essential.";
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
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const add = useCart((s) => s.add);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const product = data.product;
  if (!product) return null;
  const soldOut = product.inventory === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-sm bg-secondary">
            <img
              src={product.images[activeImage] ?? product.images[0] ?? "/images/tee.jpg"}
              alt={product.name}
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`h-20 w-20 overflow-hidden rounded-sm border ${
                    index === activeImage ? "border-primary" : "border-border"
                  }`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:pl-6">
          <p className="eyebrow text-muted-foreground">{product.category?.name ?? "Terrahaus"}</p>
          <h1 className="display mt-3 text-4xl">{product.name}</h1>
          <p className="mt-4 text-xl tabular-nums">{formatPrice(product.price_cents)}</p>

          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-sm border border-border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.inventory || 1, q + 1))}
                className="p-3"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <button
              disabled={soldOut}
              onClick={() => {
                add({
                  product_id: product.id,
                  name: product.name,
                  slug: product.slug,
                  image: product.images[0] ?? null,
                  price_cents: product.price_cents,
                  quantity,
                  inventory: product.inventory,
                });
                toast.success(`${product.name} added to your cart`);
              }}

              className="flex-1 rounded-sm bg-primary px-6 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {soldOut ? "Sold out" : "Add to cart"}
            </button>
          </div>

          <ul className="mt-8 space-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
            <li>
              Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)}
            </li>
            <li>30-day wear trial, free returns</li>
            <li>{product.inventory > 0 ? `${product.inventory} in stock` : "Back in stock soon"}</li>
          </ul>
        </div>
      </div>

      {data.related.length > 0 && (
        <section className="mt-24">
          <h2 className="display text-3xl">You may also like</h2>
          <div className="mt-8">
            <ProductGrid products={data.related} />
          </div>
        </section>
      )}
    </div>
  );
}
