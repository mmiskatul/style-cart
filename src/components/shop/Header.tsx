"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cartCount, useCart } from "@/lib/cart-store";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Footwear", href: "/category/footwear" },
  { label: "Apparel", href: "/category/apparel" },
  { label: "Home Goods", href: "/category/home-goods" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const lines = useCart((s) => s.lines);
  const router = useRouter();

  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(lines) : 0;

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = term.trim();
    if (!q) return;
    setSearchOpen(false);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            className="-ml-1 p-1 lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <Link href="/" className="display shrink-0 text-xl tracking-tight">
            Terrahaus
          </Link>
        </div>

        <nav className="hidden items-center justify-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1">
          <button
            className="p-2"
            aria-label="Search products"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="h-5 w-5" aria-hidden />
          </button>
          <Link href="/cart" className="relative p-2" aria-label={`Cart, ${count} items`}>
            <ShoppingBag className="h-5 w-5" aria-hidden />
            {count > 0 && (
              <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-background">
          <form onSubmit={submitSearch} className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search for wool runners, totes, candles…"
              maxLength={80}
              className="w-full border-b border-border bg-transparent pb-2 text-lg outline-none placeholder:text-muted-foreground"
            />
          </form>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <span className="display text-xl">Terrahaus</span>
            <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-1">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-4 pt-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="display border-b border-border py-4 text-2xl"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/cart" onClick={() => setOpen(false)} className="display py-4 text-2xl">
              Cart ({count})
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
