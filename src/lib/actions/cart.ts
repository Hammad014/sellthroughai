"use server";

import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/supabase/types";

/**
 * Cart server actions. Logged-in carts live in `cart_items` (RLS-scoped to the
 * user). Guests keep product ids in localStorage; on login they merge in via
 * `mergeGuestCart`. All reads return only PUBLISHED products.
 */

function uniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean))).slice(0, 100);
}

/** Hydrate product details for a list of ids (published only). */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const clean = uniqueIds(ids);
  if (clean.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .in("id", clean)
    .eq("status", "published");
  return data ?? [];
}

/** The signed-in user's cart products (empty for guests). */
export async function getCart(): Promise<Product[]> {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("cart_items")
    .select("created_at, products(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as { products: Product | null }[])
    .map((r) => r.products)
    .filter((p): p is Product => Boolean(p) && p!.status === "published");
}

export async function addToCart(productId: string): Promise<void> {
  const user = await getUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase
    .from("cart_items")
    .upsert(
      { user_id: user.id, product_id: productId },
      { onConflict: "user_id,product_id", ignoreDuplicates: true },
    );
}

export async function removeFromCart(productId: string): Promise<void> {
  const user = await getUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);
}

export async function clearCart(): Promise<void> {
  const user = await getUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("cart_items").delete().eq("user_id", user.id);
}

/**
 * Merge a guest's localStorage cart (product ids) into the DB cart on login,
 * then return the full, hydrated cart. Existing items are kept (union).
 */
export async function mergeGuestCart(ids: string[]): Promise<Product[]> {
  const user = await getUser();
  if (!user) return [];
  const clean = uniqueIds(ids);
  if (clean.length > 0) {
    const supabase = await createClient();
    await supabase.from("cart_items").upsert(
      clean.map((product_id) => ({ user_id: user.id, product_id })),
      { onConflict: "user_id,product_id", ignoreDuplicates: true },
    );
  }
  return getCart();
}
