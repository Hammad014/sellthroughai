"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Cover } from "@/components/cover";
import { Button, buttonVariants } from "@/components/ui/button";
import { categoryName, formatPrice } from "@/lib/catalog";
import { openLemonCheckout } from "@/lib/lemon-checkout-client";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { items, remove, clear } = useCart();
  const [busyId, setBusyId] = useState<string | null>(null);
  const subtotal = items.reduce((sum, p) => sum + p.price_usd, 0);

  async function buy(id: string) {
    setBusyId(id);
    await openLemonCheckout(id);
    setBusyId(null);
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-12 sm:px-6">
      <header className="mb-8">
        <p className="eyebrow">Your cart</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
          Cart
        </h1>
      </header>

      {items.length === 0 ? (
        <div className="bg-card flex flex-col items-center rounded-xl border px-6 py-20 text-center">
          <div className="bg-secondary text-muted-foreground grid size-14 place-items-center rounded-xl">
            <ShoppingBag className="size-6" />
          </div>
          <h2 className="font-display mt-5 text-xl font-semibold">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Add AI products and they&apos;ll wait here for you — even after you
            sign in.
          </p>
          <Link href="/products" className={cn(buttonVariants(), "mt-6")}>
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* Items */}
          <ul className="flex flex-col gap-4">
            {items.map((p) => (
              <li
                key={p.id}
                className="bg-card flex gap-4 rounded-xl border p-3"
              >
                <Link
                  href={`/products/${p.slug}`}
                  className="w-28 shrink-0 sm:w-36"
                >
                  <Cover
                    category={p.category}
                    coverImageUrl={p.cover_image_url}
                    title={p.title}
                    className="aspect-[16/10] rounded-lg"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-text-faint text-2xs font-mono tracking-wider uppercase">
                    {categoryName(p.category)}
                  </span>
                  <Link
                    href={`/products/${p.slug}`}
                    className="font-display hover:text-primary truncate font-semibold tracking-tight"
                  >
                    {p.title}
                  </Link>
                  <p className="text-muted-foreground line-clamp-1 text-sm">
                    {p.short_desc}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                    <span className="font-mono font-semibold">
                      {formatPrice(p.price_usd)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => buy(p.id)}
                        disabled={busyId === p.id}
                      >
                        {busyId === p.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <ShoppingCart className="size-3.5" />
                        )}
                        Buy now
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Remove ${p.title}`}
                        onClick={() => remove(p.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-card rounded-xl border p-5">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Summary
              </h2>
              <div className="text-muted-foreground mt-4 flex items-center justify-between text-sm">
                <span>
                  {items.length} item{items.length === 1 ? "" : "s"}
                </span>
                <span className="text-foreground font-mono font-semibold">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-text-faint mt-4 text-xs leading-relaxed">
                Each product is a separate one-time purchase, processed securely
                by our merchant of record. Use{" "}
                <span className="text-foreground">Buy now</span> on an item to
                check out.
              </p>
              <Button variant="ghost" className="mt-4 w-full" onClick={clear}>
                <Trash2 className="size-4" /> Clear cart
              </Button>
              <Link
                href="/products"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-2 w-full",
                )}
              >
                Continue shopping
              </Link>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
