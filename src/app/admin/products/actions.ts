"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { COVERS_BUCKET, FILES_BUCKET } from "@/lib/storage";
import type { DeliveryType, ProductStatus } from "@/lib/supabase/types";

export type ProductFormState = { error?: string };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function str(formData: FormData, key: string): string {
  return ((formData.get(key) as string | null) ?? "").trim();
}

/** Create or update a product (driven by an optional hidden `id` field). */
export async function upsertProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();
  const supabase = createServiceClient();

  const id = str(formData, "id") || null;
  const title = str(formData, "title");
  if (!title) return { error: "Title is required." };

  const slug = slugify(str(formData, "slug") || title);
  if (!slug) return { error: "Could not derive a slug — add one manually." };

  const price = Number.parseFloat(str(formData, "price_usd"));
  if (Number.isNaN(price) || price < 0) {
    return { error: "Enter a valid, non-negative price." };
  }

  const base = {
    slug,
    title,
    short_desc: str(formData, "short_desc"),
    long_desc: str(formData, "long_desc") || null,
    category: str(formData, "category") || "prompts",
    price_usd: price,
    delivery_type: (str(formData, "delivery_type") ||
      "license") as DeliveryType,
    status: (str(formData, "status") || "draft") as ProductStatus,
    featured: formData.get("featured") === "on",
    ls_variant_id: str(formData, "ls_variant_id") || null,
  };

  // Optional cover upload → public bucket → store the public URL.
  let coverUrl: string | undefined;
  const cover = formData.get("cover");
  if (cover instanceof File && cover.size > 0) {
    const ext = cover.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${slug}/cover-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from(COVERS_BUCKET)
      .upload(path, cover, { upsert: true, contentType: cover.type });
    if (error) return { error: `Cover upload failed: ${error.message}` };
    coverUrl = supabase.storage.from(COVERS_BUCKET).getPublicUrl(path)
      .data.publicUrl;
  }

  const payload = coverUrl ? { ...base, cover_image_url: coverUrl } : base;

  if (id) {
    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("products").insert(payload);
    if (error) {
      if (error.code === "23505") {
        return { error: "That slug is already taken — choose another." };
      }
      return { error: error.message };
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

/** Delete a product (and its files/lessons cascade via FKs). */
export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

/** Upload a gated file to the PRIVATE bucket and record it. */
export async function uploadProductFile(
  productId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const path = `${productId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from(FILES_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) return;

  const { data: last } = await supabase
    .from("product_files")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = last?.[0] ? last[0].sort_order + 1 : 0;

  await supabase.from("product_files").insert({
    product_id: productId,
    storage_path: path,
    file_name: file.name,
    sort_order: nextOrder,
  });

  revalidatePath(`/admin/products/${productId}`);
}

/** Remove a gated file (storage object + row). */
export async function deleteProductFile(
  fileId: string,
  productId: string,
  storagePath: string,
): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase.storage.from(FILES_BUCKET).remove([storagePath]);
  await supabase.from("product_files").delete().eq("id", fileId);
  revalidatePath(`/admin/products/${productId}`);
}
