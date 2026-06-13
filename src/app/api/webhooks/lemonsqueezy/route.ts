import crypto from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lemon Squeezy webhook.
 *
 * - Verifies the X-Signature HMAC-SHA256 over the RAW body.
 * - Handles `order_created` idempotently (upsert by ls_order_id).
 * - If the buyer has no profile, creates the auth user (guest → account);
 *   our DB trigger creates the matching profiles row.
 * - Inserts the order + order_items and grants the entitlement.
 * - Returns 200 quickly; non-2xx makes Lemon Squeezy retry.
 */
export async function POST(req: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-signature") ?? "";

  if (!verifySignature(raw, signature, secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: LemonWebhook;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  // Only fulfil orders; acknowledge everything else so LS stops retrying.
  if (payload.meta?.event_name !== "order_created") {
    return new Response("Ignored", { status: 200 });
  }

  try {
    await handleOrderCreated(payload);
  } catch (err) {
    console.error("[lemonsqueezy] order_created failed:", err);
    return new Response("Processing error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}

function verifySignature(raw: string, signature: string, secret: string) {
  try {
    const digest = crypto
      .createHmac("sha256", secret)
      .update(raw)
      .digest("hex");
    const a = Buffer.from(digest, "hex");
    const b = Buffer.from(signature, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

async function handleOrderCreated(payload: LemonWebhook) {
  const supabase = createServiceClient();

  const custom = payload.meta.custom_data ?? {};
  const attr = payload.data.attributes;
  const lsOrderId = String(payload.data.id);
  const email = (attr.user_email ?? "").toLowerCase().trim();
  const totalUsd = Number(attr.total ?? 0) / 100;
  const receiptUrl = attr.urls?.receipt ?? null;
  const status = attr.status ?? "paid";

  // ---- Resolve the product (prefer our custom_data, fall back to variant) --
  let productId = custom.product_id ?? null;
  const variantId = attr.first_order_item?.variant_id;
  if (!productId && variantId != null) {
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("ls_variant_id", String(variantId))
      .maybeSingle();
    productId = data?.id ?? null;
  }

  // ---- Resolve the user (custom_data → existing profile → create guest) ----
  let userId = custom.user_id ?? null;
  if (!userId && email) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    userId = existing?.id ?? null;
  }
  if (!userId && email) {
    const { data: created } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    userId = created?.user?.id ?? null;
    if (!userId) {
      // Race / already exists — re-read the profile the trigger created.
      const { data: again } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      userId = again?.id ?? null;
    }
  }

  // ---- Upsert the order (idempotent on ls_order_id) ------------------------
  const { data: order } = await supabase
    .from("orders")
    .upsert(
      {
        ls_order_id: lsOrderId,
        user_id: userId,
        email,
        total_usd: totalUsd,
        status,
        receipt_url: receiptUrl,
      },
      { onConflict: "ls_order_id" },
    )
    .select("id")
    .single();

  const orderId = order?.id ?? null;

  // ---- Order line item (re-create to stay idempotent) ----------------------
  if (orderId && productId) {
    await supabase.from("order_items").delete().eq("order_id", orderId);
    await supabase.from("order_items").insert({
      order_id: orderId,
      product_id: productId,
      price_usd: totalUsd,
    });
  }

  // ---- Grant entitlements (unique on user_id+product_id → idempotent) ------
  // A bundle grants its included products (not the bundle row itself); a normal
  // product grants itself.
  if (userId && productId) {
    const { data: bundleItems } = await supabase
      .from("product_bundle_items")
      .select("item_product_id")
      .eq("bundle_id", productId);

    const grantIds =
      bundleItems && bundleItems.length > 0
        ? bundleItems.map((b) => b.item_product_id)
        : [productId];

    await supabase.from("entitlements").upsert(
      grantIds.map((pid) => ({
        user_id: userId,
        product_id: pid,
        order_id: orderId,
      })),
      { onConflict: "user_id,product_id", ignoreDuplicates: true },
    );
  }
}

// ---- Minimal payload shape we rely on --------------------------------------
type LemonWebhook = {
  meta: {
    event_name: string;
    custom_data?: { user_id?: string; product_id?: string };
  };
  data: {
    id: string;
    attributes: {
      user_email?: string;
      total?: number;
      status?: string;
      urls?: { receipt?: string };
      first_order_item?: { variant_id?: number | string };
    };
  };
};
