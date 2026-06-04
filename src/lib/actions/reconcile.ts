"use server";

import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { fetchLemonOrders, lemonConfigured } from "@/lib/lemonsqueezy";

export type ReconcileResult = {
  error?: string;
  ls?: { count: number; revenue: number };
  db?: { count: number; revenue: number };
  missingInDb?: string[];
};

/**
 * Compare Lemon Squeezy's orders against what we recorded via webhooks.
 * Surfaces count/revenue deltas and any LS order ids missing from our DB
 * (e.g. a webhook that never landed). Read-only — does not mutate anything.
 */
export async function reconcileWithLemon(): Promise<ReconcileResult> {
  await requireAdmin();
  if (!lemonConfigured()) {
    return { error: "Lemon Squeezy isn’t configured (set the API env vars)." };
  }

  const lsOrders = await fetchLemonOrders();
  const supabase = createServiceClient();
  const { data: dbOrders } = await supabase
    .from("orders")
    .select("ls_order_id, total_usd");

  const dbIds = new Set(
    (dbOrders ?? []).map((o) => o.ls_order_id).filter(Boolean) as string[],
  );
  const dbRevenue = (dbOrders ?? []).reduce(
    (sum, o) => sum + Number(o.total_usd || 0),
    0,
  );
  const lsRevenue = lsOrders.reduce((sum, o) => sum + o.total, 0);
  const missingInDb = lsOrders.filter((o) => !dbIds.has(o.id)).map((o) => o.id);

  return {
    ls: { count: lsOrders.length, revenue: lsRevenue },
    db: { count: dbIds.size, revenue: dbRevenue },
    missingInDb,
  };
}
