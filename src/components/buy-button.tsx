"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog";
import { startCheckout } from "@/lib/actions/checkout";

/**
 * Opens the Lemon Squeezy checkout overlay for a product. Falls back to a
 * full-page redirect if lemon.js hasn't loaded. Works for product and bundle
 * pages alike — pass the product's id.
 */
export function BuyButton({
  productId,
  price,
}: {
  productId: string;
  price: number;
}) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    const res = await startCheckout(productId);
    setLoading(false);

    if (res.error || !res.url) {
      toast.error(res.error ?? "Could not start checkout.");
      return;
    }

    if (typeof window !== "undefined" && window.LemonSqueezy?.Url?.Open) {
      window.LemonSqueezy.Url.Open(res.url);
    } else {
      window.location.href = res.url;
    }
  }

  return (
    <Button size="lg" className="w-full" onClick={handleBuy} disabled={loading}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <ShoppingCart className="size-4" />
      )}
      Buy now — {formatPrice(price)}
    </Button>
  );
}
