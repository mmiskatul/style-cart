import { Link, createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/shop/States";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD_CENTS, shippingFor } from "@/lib/types";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Terrahaus" },
      { name: "description", content: "Review the items in your Terrahaus cart before checkout." },
      { property: "og:title", content: "Your cart — Terrahaus" },
      { property: "og:description", content: "Review your Terrahaus cart before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { lines, setQuantity, remove } = useCart();
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="min-h-[50vh]" />;

  const subtotal = cartSubtotal(lines);
  const shipping = shippingFor(subtotal);
  const remaining = FREE_SHIPPING_THRESHOLD_CENTS - subtotal;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Your cart is empty"
          description="Nothing here yet — start with our wool runners or a tree-fibre tee."
          action={
            <Link
              to="/products"
              className="rounded-sm bg-primary px-5 py-2.5 text-sm text-primary-foreground"
            >
              Shop all
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="display text-4xl">Your cart</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_340px]">
        <ul className="divide-y divide-border border-y border-border">
          {lines.map((line) => (
            <li key={line.product_id} className="grid grid-cols-[80px_1fr_auto] gap-4 py-6">
              <Link to="/products/$slug" params={{ slug: line.slug }} className="shrink-0">
                <img
                  src={line.image ?? "/images/tee.jpg"}
                  alt={line.name}
                  className="h-20 w-20 rounded-sm object-cover"
                />
              </Link>
              <div className="min-w-0">
                <Link
                  to="/products/$slug"
                  params={{ slug: line.slug }}
                  className="truncate text-sm font-medium hover:underline"
                >
                  {line.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatPrice(line.price_cents)}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <label className="sr-only" htmlFor={`qty-${line.product_id}`}>
                    Quantity for {line.name}
                  </label>
                  <select
                    id={`qty-${line.product_id}`}
                    value={line.quantity}
                    onChange={(e) => setQuantity(line.product_id, Number(e.target.value))}
                    className="rounded-sm border border-border bg-background px-2 py-1 text-sm"
                  >
                    {Array.from({ length: Math.max(1, Math.min(10, line.inventory)) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => remove(line.product_id)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
                  </button>
                </div>
              </div>
              <span className="text-sm tabular-nums">
                {formatPrice(line.price_cents * line.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-sm border border-border bg-secondary/40 p-6">
          <h2 className="display text-2xl">Summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(subtotal + shipping)}</dd>
            </div>
          </dl>
          {remaining > 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              Add {formatPrice(remaining)} more for free shipping.
            </p>
          )}
          <Link
            to="/checkout"
            className="mt-6 block rounded-sm bg-primary px-5 py-3 text-center text-sm text-primary-foreground transition-opacity hover:opacity-90"
          >
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
