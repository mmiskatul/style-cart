import Link from "next/link";

import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.inventory === 0;
  const low = product.inventory > 0 && product.inventory <= 5;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative overflow-hidden rounded-sm bg-secondary">
        <img
          src={product.images[0] ?? "/images/tee.jpg"}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {soldOut && (
          <span className="eyebrow absolute left-3 top-3 rounded-sm bg-background/90 px-2 py-1 text-foreground">
            Sold out
          </span>
        )}
        {low && (
          <span className="eyebrow absolute left-3 top-3 rounded-sm bg-background/90 px-2 py-1 text-clay">
            Only {product.inventory} left
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-medium tracking-normal">{product.name}</h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {product.category?.name ?? "Shop"}
          </p>
        </div>
        <span className="shrink-0 text-sm tabular-nums">{formatPrice(product.price_cents)}</span>
      </div>
      {product.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
