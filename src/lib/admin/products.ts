import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import type {
  CourseLesson,
  Product,
  ProductFile,
  ProductPrompt,
} from "@/lib/supabase/types";

/**
 * Admin data access — uses the service-role client (bypasses RLS) so admins
 * can see drafts and gated `product_files`. Every caller must be behind
 * requireAdmin() (the /admin layout enforces this).
 */

export async function listAllProducts(): Promise<Product[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAdminProductById(id: string): Promise<Product | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function listProductFiles(
  productId: string,
): Promise<ProductFile[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("product_files")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function listProductLessons(
  productId: string,
): Promise<CourseLesson[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("course_lessons")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function listProductPrompts(
  productId: string,
): Promise<ProductPrompt[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("product_prompts")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function countProducts(): Promise<{
  total: number;
  published: number;
}> {
  const supabase = createServiceClient();
  const [{ count: total }, { count: published }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
  ]);
  return { total: total ?? 0, published: published ?? 0 };
}
