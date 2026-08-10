import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { EmptyState, LoadingSpinner } from "@/components/shop/States";
import { formatPrice } from "@/lib/format";
import { getOrder } from "@/lib/shop.functions";

export const Route = createFileRoute("/order/$id")({
  head: () => ({
    meta: [
      { title: "Order confirmed — Terrahaus" },
      { name: "description", content: "Your Terrahaus order confirmation." },
      { property: "og:title", content: "Order confirmed — Terrahaus" },
      { property: "og:description", content: "Your Terrahaus order confirmation." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const fetchOrder = useServerFn(getOrder);
  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder({ data: { id } }),
  });

  if (isLoading) return <LoadingSpinner label="Loading your order" />;
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState title="Order not found" description="This order link is no longer valid." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="eyebrow text-muted-foreground">Order {data.order_number}</p>
      <h1 className="display mt-3 text-4xl">Thank you, {data.customer.fullName.split(" ")[0]}.</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        We've emailed a confirmation to {data.customer.email}. Your order is being prepared.
      </p>

      <ul className="mt-10 divide-y divide-border border-y border-border">
        {data.items.map((item) => (
          <li key={item.product_id} className="flex items-center gap-4 py-4">
            <img
              src={item.image ?? "/images/tee.jpg"}
              alt={item.name}
              className="h-16 w-16 rounded-sm object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
            </div>
            <span className="text-sm tabular-nums">
              {formatPrice(item.price_cents * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(data.subtotal_cents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="tabular-nums">
            {data.shipping_cents === 0 ? "Free" : formatPrice(data.shipping_cents)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(data.total_cents)}</dd>
        </div>
      </dl>

      <Link
        to="/products"
        className="mt-10 inline-block rounded-sm bg-primary px-5 py-2.5 text-sm text-primary-foreground"
      >
        Continue shopping
      </Link>
    </div>
  );
}
