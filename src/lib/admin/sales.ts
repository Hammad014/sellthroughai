import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

export type SalesSummary = { revenue: number; orders: number; units: number };
export type TopProduct = {
  productId: string;
  title: string;
  slug: string;
  units: number;
  revenue: number;
};
export type RecentOrder = {
  id: string;
  email: string;
  total_usd: number;
  status: string;
  created_at: string;
  ls_order_id: string | null;
};

type OrderItemRow = {
  product_id: string;
  price_usd: number;
  products: { title: string; slug: string } | null;
};

export async function getSalesSummary(): Promise<SalesSummary> {
  const supabase = createServiceClient();
  const [{ data: orders }, { count: units }] = await Promise.all([
    supabase.from("orders").select("total_usd"),
    supabase.from("order_items").select("*", { count: "exact", head: true }),
  ]);
  const revenue = (orders ?? []).reduce(
    (sum, o) => sum + Number(o.total_usd || 0),
    0,
  );
  return { revenue, orders: orders?.length ?? 0, units: units ?? 0 };
}

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("order_items")
    .select("product_id, price_usd, products(title, slug)");

  const byProduct = new Map<string, TopProduct>();
  for (const row of (data ?? []) as unknown as OrderItemRow[]) {
    const current = byProduct.get(row.product_id) ?? {
      productId: row.product_id,
      title: row.products?.title ?? "Unknown product",
      slug: row.products?.slug ?? "",
      units: 0,
      revenue: 0,
    };
    current.units += 1;
    current.revenue += Number(row.price_usd || 0);
    byProduct.set(row.product_id, current);
  }

  return Array.from(byProduct.values())
    .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
    .slice(0, limit);
}

export async function getRecentOrders(limit = 8): Promise<RecentOrder[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select("id, email, total_usd, status, created_at, ls_order_id")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as RecentOrder[];
}
