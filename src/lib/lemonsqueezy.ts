import "server-only";
import {
  lemonSqueezySetup,
  createCheckout,
} from "@lemonsqueezy/lemonsqueezy.js";

/** True when the Lemon Squeezy API env vars are present. */
export function lemonConfigured(): boolean {
  return Boolean(
    process.env.LEMONSQUEEZY_API_KEY && process.env.LEMONSQUEEZY_STORE_ID,
  );
}

let configured = false;
function ensureSetup() {
  if (configured) return;
  lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });
  configured = true;
}

/**
 * Create a hosted/overlay checkout for one product variant, embedding the
 * buyer email + custom data (user_id, product_id) that the webhook reads back.
 */
export async function createProductCheckout(opts: {
  variantId: string;
  email?: string | null;
  userId?: string | null;
  productId: string;
  redirectUrl: string;
}): Promise<{ url?: string; error?: string }> {
  if (!lemonConfigured()) {
    return { error: "Payments are not configured yet." };
  }
  ensureSetup();

  const custom: Record<string, string> = { product_id: opts.productId };
  if (opts.userId) custom.user_id = opts.userId;

  const { data, error } = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID!,
    opts.variantId,
    {
      checkoutData: {
        email: opts.email ?? undefined,
        custom,
      },
      productOptions: {
        redirectUrl: opts.redirectUrl,
      },
      checkoutOptions: {
        embed: true,
        media: false,
      },
      testMode: process.env.LEMONSQUEEZY_TEST_MODE === "true",
    },
  );

  if (error) return { error: error.message };
  const url = data?.data.attributes.url;
  return url ? { url } : { error: "Could not create checkout." };
}
