"use client";

import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart/cart-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/supabase/types";

/**
 * Adds a product to the cart. Once added it flips to a "View cart" link so the
 * action stays obvious. `variant`/`size` pass through to the button.
 */
export function AddToCartButton({
  product,
  className,
  size = "lg",
  variant = "outline",
  block = true,
}: {
  product: Product;
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "secondary" | "outline" | "ghost";
  block?: boolean;
}) {
  const { add, has } = useCart();
  const inCart = has(product.id);

  if (inCart) {
    return (
      <Link
        href="/cart"
        className={cn(
          buttonVariants({ variant: "secondary", size }),
          block && "w-full",
          className,
        )}
      >
        <Check className="size-4" /> In cart — view
      </Link>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(block && "w-full", className)}
      onClick={() => {
        add(product);
        toast.success("Added to cart", { description: product.title });
      }}
    >
      <Plus className="size-4" /> Add to cart
    </Button>
  );
}

/** Compact add-to-cart used inside the (clickable) product card cover. */
export function AddToCartIcon({ product }: { product: Product }) {
  const { add, has } = useCart();
  const inCart = has(product.id);

  return (
    <button
      type="button"
      aria-label={inCart ? "In cart" : `Add ${product.title} to cart`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (inCart) return;
        add(product);
        toast.success("Added to cart", { description: product.title });
      }}
      className={cn(
        "absolute top-5 left-5 z-10 grid size-8 place-items-center rounded-full border backdrop-blur transition-colors",
        inCart
          ? "bg-primary text-primary-foreground border-transparent"
          : "bg-background/70 text-foreground hover:bg-background border-border",
      )}
    >
      {inCart ? <Check className="size-4" /> : <Plus className="size-4" />}
    </button>
  );
}
