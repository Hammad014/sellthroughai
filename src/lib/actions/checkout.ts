"use server";

import { getUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { createProductCheckout, lemonConfigured } from "@/lib/lemonsqueezy";

export type CheckoutResult = { url?: string; error?: string };

/**
 * Starts a Lemon Squeezy checkout for a product. Returns the (overlay) URL.
 * The buyer's email + user_id (if signed in) and the product_id ride along as
 * checkout custom data so the webhook can fulfil the order.
 */
export async function startCheckout(
  productId: string,
): Promise<CheckoutResult> {
  if (!lemonConfigured()) {
    return {
      error: "Checkout isn’t available yet — payments aren’t configured.",
    };
  }

  const supabase = createServiceClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, status, ls_variant_id")
    .eq("id", productId)
    .maybeSingle();

  if (!product || product.status !== "published") {
    return { error: "This product isn’t available." };
  }
  if (!product.ls_variant_id) {
    return { error: "This product isn’t set up for checkout yet." };
  }

  const user = await getUser();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return createProductCheckout({
    variantId: product.ls_variant_id,
    email: user?.email ?? null,
    userId: user?.id ?? null,
    productId: product.id,
    // Guests get an account (no password) from the webhook, so send them to
    // the login screen's "set a password" step instead of a locked dashboard.
    redirectUrl: user
      ? `${siteUrl}/dashboard?purchased=1`
      : `${siteUrl}/login?purchased=1&next=${encodeURIComponent("/dashboard?purchased=1")}`,
  });
}
