import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <h2 className="display text-2xl">Stay in the loop</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Occasional notes on new materials, restocks and the makers behind them.
            </p>
            <form
              className="mt-5 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
                  toast.error("Please enter a valid email address.");
                  return;
                }
                setEmail("");
                toast.success("Thanks — you're on the list.");
              }}
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={255}
                aria-label="Email address"
                className="min-w-0 flex-1 rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button className="shrink-0 rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90">
                Sign up
              </button>
            </form>
          </div>

          <div>
            <h3 className="eyebrow text-muted-foreground">Shop</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/products" className="hover:underline">
                  All products
                </Link>
              </li>
              <li>
                <Link to="/category/$slug" params={{ slug: "footwear" }} className="hover:underline">
                  Footwear
                </Link>
              </li>
              <li>
                <Link to="/category/$slug" params={{ slug: "apparel" }} className="hover:underline">
                  Apparel
                </Link>
              </li>
              <li>
                <Link
                  to="/category/$slug"
                  params={{ slug: "accessories" }}
                  className="hover:underline"
                >
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-muted-foreground">Account</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/auth" className="hover:underline">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:underline">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:underline">
                  Orders
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-14 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Terrahaus. Made with natural materials.
        </p>
      </div>
    </footer>
  );
}
