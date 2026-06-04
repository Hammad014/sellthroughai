import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Cover } from "@/components/cover";
import { AddToCartIcon } from "@/components/cart/add-to-cart-button";
import { categoryName, formatPrice } from "@/lib/catalog";
import type { Product } from "@/lib/supabase/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-card hover:border-border-accent flex flex-col overflow-hidden rounded-xl border transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="relative p-3">
        <AddToCartIcon product={product} />
        <Cover
          category={product.category}
          coverImageUrl={product.cover_image_url}
          title={product.title}
          className="aspect-[16/10]"
          badge={product.featured ? "Featured" : undefined}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
        <span className="text-text-faint text-2xs font-mono tracking-wider uppercase">
          {categoryName(product.category)}
        </span>
        <h3 className="font-display text-lg leading-snug font-semibold tracking-tight">
          {product.title}
        </h3>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {product.short_desc}
        </p>
        <div className="mt-auto flex items-center justify-between border-t pt-3">
          <span className="font-mono text-lg font-semibold">
            {formatPrice(product.price_usd)}
          </span>
          <span className="text-primary inline-flex items-center gap-1 text-sm font-medium">
            View
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
