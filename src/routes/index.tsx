import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import heroImage from "@/assets/hero-runner.jpg";
import { ProductGrid } from "@/components/shop/ProductCard";
import { ErrorState } from "@/components/shop/States";
import { categoriesQuery, productsQuery } from "@/lib/queries.client";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery);
    context.queryClient.ensureQueryData(categoriesQuery);
  },
  head: () => ({
    meta: [
      { title: "Terrahaus — Natural Materials, Everyday Essentials" },
      {
        name: "description",
        content:
          "Shoes, apparel and home goods made from merino wool, organic cotton and tree fibre. Free shipping over $75.",
      },
      { property: "og:title", content: "Terrahaus — Natural Materials, Everyday Essentials" },
      {
        property: "og:description",
        content: "Considered essentials made from merino wool, organic cotton and tree fibre.",
      },
    ],
  }),
  errorComponent: ({ error }) => <ErrorState message={error.message} />,
  component: Home,
});

function Home() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const newest = products.slice(0, 8);

  return (
    <>
      <section className="relative">
        <div className="grid items-stretch gap-0 lg:grid-cols-2">
          <div className="flex flex-col justify-center px-4 py-16 sm:px-6 lg:py-28 lg:pl-16">
            <p className="eyebrow text-muted-foreground">Autumn collection</p>
            <h1 className="display mt-4 max-w-xl text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Made from what grows, not what pollutes.
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground">
              Merino wool runners, tree-fibre knits and slow-made home goods. Designed to be worn
              daily and kept for years.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="rounded-sm bg-primary px-6 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90"
              >
                Shop all
              </Link>
            </div>
          </div>
          <div className="relative min-h-[320px] lg:min-h-[620px]">
            <img
              src={heroImage}
              alt="Wool runners resting on warm sand"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="display text-3xl">Shop by category</h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/category/$slug"
              params={{ slug: category.slug }}
              className="group relative overflow-hidden rounded-sm"
            >
              <img
                src={category.image ?? "/images/tee.jpg"}
                alt={category.name}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4">
                <span className="text-sm font-medium text-cream">{category.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="display text-3xl">Featured</h2>
            <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          <div className="mt-8">
            <ProductGrid products={featured} />
          </div>
        </section>
      )}

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3">
          {[
            {
              title: "Natural materials",
              body: "Merino wool, eucalyptus tree fibre and organic cotton — renewable by design.",
            },
            {
              title: "Free shipping over $75",
              body: "Flat $6.95 otherwise, shipped in plastic-free packaging.",
            },
            {
              title: "30-day trial",
              body: "Wear them, walk in them. Return within 30 days if they aren't right.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="display text-xl">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="display text-3xl">New arrivals</h2>
        <div className="mt-8">
          <ProductGrid products={newest} />
        </div>
      </section>
    </>
  );
}
