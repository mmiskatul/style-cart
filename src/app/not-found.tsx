import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow text-muted-foreground">404</p>
        <h1 className="display mt-3 text-4xl">We couldn't find that page</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page may have moved, or the product is no longer stocked.
        </p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90"
          >
            Browse the shop
          </Link>
        </div>
      </div>
    </div>
  );
}
