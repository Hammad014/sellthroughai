"use client";

import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog";

/**
 * Placeholder "Buy" action. No-op for now.
 *
 * PAYMENTS SEAM (Lemon Squeezy, added later): replace the toast with a call
 * that opens the Lemon Squeezy hosted checkout / overlay for this product's
 * `ls_variant_id`. On webhook-confirmed payment the server grants an
 * entitlement and the user lands in /dashboard.
 */
export function BuyButton({
  price,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  lsVariantId,
}: {
  price: number;
  lsVariantId: string | null;
}) {
  function handleBuy() {
    toast.info("Checkout isn’t live yet", {
      description: "Payments (Lemon Squeezy) arrive in a later update.",
    });
  }

  return (
    <Button size="lg" className="w-full" onClick={handleBuy}>
      <ShoppingCart className="size-4" />
      Buy now — {formatPrice(price)}
    </Button>
  );
}
