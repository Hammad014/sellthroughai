import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/supabase/types";

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Published catalog, optionally filtered by category and/or a text query.
 * RLS already restricts anon reads to `status = 'published'`, but we filter
 * explicitly too. Degrades to an empty list if Supabase isn't configured yet.
 */
export async function getPublishedProducts(opts?: {
  q?: string;
  category?: string;
}): Promise<Product[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("*")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (opts?.category) query = query.eq("category", opts.category);

    const q = opts?.q?.trim();
    if (q) {
      query = query.or(`title.ilike.%${q}%,short_desc.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** Featured + published products for the landing page. */
export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "published")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** A single published product by slug, or null. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Published products included in a bundle, in the admin-defined order.
 * Used on the bundle's sales page to show "what's included".
 */
export async function getBundleProducts(bundleId: string): Promise<Product[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createClient();
    const { data: rows } = await supabase
      .from("product_bundle_items")
      .select("item_product_id, sort_order")
      .eq("bundle_id", bundleId)
      .order("sort_order", { ascending: true });

    const ids = (rows ?? []).map((r) => r.item_product_id);
    if (ids.length === 0) return [];

    const { data: products } = await supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .eq("status", "published");

    // Preserve the bundle's declared order.
    const rank = new Map(ids.map((id, i) => [id, i]));
    return (products ?? []).sort(
      (a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0),
    );
  } catch {
    return [];
  }
}

/** Up to `limit` other published products in the same category. */
export async function getRelatedProducts(
  product: Product,
  limit = 3,
): Promise<Product[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("status", "published")
      .eq("category", product.category)
      .neq("id", product.id)
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}
