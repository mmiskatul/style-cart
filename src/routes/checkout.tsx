import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { cartSubtotal, useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { customerSchema, type CustomerInput } from "@/lib/schemas";
import { createOrder } from "@/lib/shop.functions";
import { shippingFor } from "@/lib/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Terrahaus" },
      { name: "description", content: "Complete your Terrahaus order." },
      { property: "og:title", content: "Checkout — Terrahaus" },
      { property: "og:description", content: "Complete your Terrahaus order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const FIELDS: { name: keyof CustomerInput; label: string; span?: boolean }[] = [
  { name: "fullName", label: "Full name", span: true },
  { name: "email", label: "Email" },
  { name: "phone", label: "Phone" },
  { name: "address", label: "Street address", span: true },
  { name: "city", label: "City" },
  { name: "region", label: "State / region" },
  { name: "postalCode", label: "Postal code" },
  { name: "country", label: "Country" },
];

function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const { lines, clear } = useCart();
  const navigate = useNavigate();
  const submit = useServerFn(createOrder);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<CustomerInput>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    postalCode: "",
    country: "United States",
  });

  useEffect(() => setMounted(true), []);

  const mutation = useMutation({
    mutationFn: (customer: CustomerInput) =>
      submit({
        data: {
          customer,
          items: lines.map((l) => ({ product_id: l.product_id, quantity: l.quantity })),
        },
      }),
    onSuccess: (order) => {
      clear();
      navigate({ to: "/order/$id", params: { id: order.id } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!mounted) return <div className="min-h-[50vh]" />;

  const subtotal = cartSubtotal(lines);
  const shipping = shippingFor(subtotal);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="display text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add something before checking out.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="display text-4xl">Checkout</h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_340px]">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const parsed = customerSchema.safeParse(values);
            if (!parsed.success) {
              const next: Record<string, string> = {};
              parsed.error.issues.forEach((issue) => {
                next[String(issue.path[0])] = issue.message;
              });
              setErrors(next);
              return;
            }
            setErrors({});
            mutation.mutate(parsed.data);
          }}
          className="grid gap-5 sm:grid-cols-2"
        >
          {FIELDS.map((field) => (
            <div key={field.name} className={field.span ? "sm:col-span-2" : undefined}>
              <label htmlFor={field.name} className="eyebrow text-muted-foreground">
                {field.label}
              </label>
              <input
                id={field.name}
                value={values[field.name]}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                maxLength={255}
                className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              {errors[field.name] && (
                <p className="mt-1 text-xs text-destructive">{errors[field.name]}</p>
              )}
            </div>
          ))}
          <div className="sm:col-span-2">
            <button
              disabled={mutation.isPending}
              className="w-full rounded-sm bg-primary px-6 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {mutation.isPending ? "Placing order…" : `Place order · ${formatPrice(subtotal + shipping)}`}
            </button>
            <p className="mt-3 text-xs text-muted-foreground">
              This demo store records your order without taking payment.
            </p>
          </div>
        </form>

        <aside className="h-fit rounded-sm border border-border bg-secondary/40 p-6">
          <h2 className="display text-2xl">Order summary</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {lines.map((line) => (
              <li key={line.product_id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate text-muted-foreground">
                  {line.name} × {line.quantity}
                </span>
                <span className="tabular-nums">
                  {formatPrice(line.price_cents * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between text-base">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(subtotal + shipping)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
