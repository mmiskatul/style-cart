import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { EmptyState, LoadingSpinner } from "@/components/shop/States";
import { useAuthUser } from "@/hooks/use-auth-user";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccount } from "@/lib/admin.functions";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your account — Terrahaus" },
      { name: "description", content: "View your Terrahaus order history." },
      { property: "og:title", content: "Your account — Terrahaus" },
      { property: "og:description", content: "View your Terrahaus order history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading } = useAuthUser();
  const navigate = useNavigate();
  const fetchAccount = useServerFn(getMyAccount);
  const { data, isLoading } = useQuery({
    queryKey: ["account", user?.id],
    queryFn: () => fetchAccount(),
    enabled: Boolean(user),
  });

  if (loading) return <LoadingSpinner label="Loading your account" />;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Sign in to see your orders"
          action={
            <Link
              to="/auth"
              className="rounded-sm bg-primary px-5 py-2.5 text-sm text-primary-foreground"
            >
              Sign in
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl">Your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {data?.isAdmin && (
            <Link
              to="/admin"
              className="rounded-sm border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              Admin
            </Link>
          )}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="rounded-sm border border-border px-4 py-2 text-sm hover:bg-secondary"
          >
            Sign out
          </button>
        </div>
      </div>

      <h2 className="display mt-12 text-2xl">Orders</h2>
      {isLoading ? (
        <LoadingSpinner label="Loading orders" />
      ) : !data?.orders.length ? (
        <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {data.orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between gap-4 py-4 text-sm">
              <div>
                <Link
                  to="/order/$id"
                  params={{ id: order.id }}
                  className="font-medium hover:underline"
                >
                  {order.order_number}
                </Link>
                <p className="text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()} · {order.status}
                </p>
              </div>
              <span className="tabular-nums">{formatPrice(order.total_cents)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
