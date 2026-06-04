"use client";

import { useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog";
import { openLemonCheckout } from "@/lib/lemon-checkout-client";

/**
 * Direct "Buy now" — opens the Lemon Squeezy checkout overlay for one product.
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
    await openLemonCheckout(productId);
    setLoading(false);
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
