import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { EmptyState, LoadingSpinner } from "@/components/shop/States";
import { useAuthUser } from "@/hooks/use-auth-user";
import { adminDeleteProduct, adminListProducts } from "@/lib/admin.functions";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Terrahaus" },
      { name: "description", content: "Manage the Terrahaus product catalogue." },
      { property: "og:title", content: "Admin — Terrahaus" },
      { property: "og:description", content: "Manage the Terrahaus product catalogue." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuthUser();
  const list = useServerFn(adminListProducts);
  const remove = useServerFn(adminDeleteProduct);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => list(),
    enabled: Boolean(user),
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading || (user && isLoading)) return <LoadingSpinner label="Loading admin" />;

  if (!user || error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Admins only"
          description="Sign in with an administrator account to manage products."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="display text-4xl">Product catalogue</h1>
      <p className="mt-2 text-sm text-muted-foreground">{data?.length ?? 0} products</p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="py-3 font-normal">Product</th>
              <th className="py-3 font-normal">Price</th>
              <th className="py-3 font-normal">Stock</th>
              <th className="py-3 font-normal">Status</th>
              <th className="py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(data ?? []).map((product) => (
              <tr key={product.id}>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images[0] ?? "/images/tee.jpg"}
                      alt=""
                      className="h-10 w-10 rounded-sm object-cover"
                    />
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="py-3 tabular-nums">{formatPrice(product.price_cents)}</td>
                <td className="py-3 tabular-nums">{product.inventory}</td>
                <td className="py-3 capitalize text-muted-foreground">{product.status}</td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => deleteMutation.mutate(product.id)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
