import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import type { CourseLesson, Product, ProductFile } from "@/lib/supabase/types";

export type LibraryItem = {
  id: string;
  product: Product;
  receiptUrl: string | null;
};

type LibraryRow = {
  id: string;
  products: Product | null;
  orders: { receipt_url: string | null } | null;
};

/** Everything the user owns, with product + (license) receipt info. */
export async function listLibrary(userId: string): Promise<LibraryItem[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("entitlements")
    .select("id, granted_at, products(*), orders(receipt_url)")
    .eq("user_id", userId)
    .order("granted_at", { ascending: false });

  return ((data ?? []) as unknown as LibraryRow[])
    .filter((row): row is LibraryRow & { products: Product } =>
      Boolean(row.products),
    )
    .map((row) => ({
      id: row.id,
      product: row.products,
      receiptUrl: row.orders?.receipt_url ?? null,
    }));
}

/** Does the user own this product? */
export async function hasEntitlement(
  userId: string,
  productId: string,
): Promise<boolean> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();
  return Boolean(data);
}

/** Lessons + downloadable files for a gated product (admin-trusted read). */
export async function getCourseContent(productId: string): Promise<{
  lessons: CourseLesson[];
  files: ProductFile[];
}> {
  const supabase = createServiceClient();
  const [{ data: lessons }, { data: files }] = await Promise.all([
    supabase
      .from("course_lessons")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("product_files")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true }),
  ]);
  return { lessons: lessons ?? [], files: files ?? [] };
}
