import type { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase/service";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Re-generate periodically so newly published products appear.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/about",
    "/faq",
    "/terms",
    "/privacy",
    "/refund-policy",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/products" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("products")
      .select("slug, created_at")
      .eq("status", "published");
    productRoutes = (data ?? []).map((p) => ({
      url: `${BASE}/products/${p.slug}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // Supabase not configured (e.g. at build time) — static routes only.
  }

  return [...staticRoutes, ...productRoutes];
}
