"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { COVERS_BUCKET, FILES_BUCKET } from "@/lib/storage";
import { parseCsvToObjects } from "@/lib/csv";
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

/** Add a course lesson (title + markdown + optional video to private bucket). */
export async function addLesson(
  productId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();

  const title = str(formData, "title");
  if (!title) return;
  const contentMd = str(formData, "content_md") || null;

  let videoPath: string | null = null;
  const video = formData.get("video");
  if (video instanceof File && video.size > 0) {
    const path = `${productId}/lessons/${Date.now()}-${video.name}`;
    const { error } = await supabase.storage
      .from(FILES_BUCKET)
      .upload(path, video, { contentType: video.type });
    if (!error) videoPath = path;
  }

  const { data: last } = await supabase
    .from("course_lessons")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = last?.[0] ? last[0].sort_order + 1 : 0;

  await supabase.from("course_lessons").insert({
    product_id: productId,
    title,
    content_md: contentMd,
    video_path: videoPath,
    sort_order: nextOrder,
  });

  revalidatePath(`/admin/products/${productId}`);
}

/** Edit an existing lesson's title / markdown in place. */
export async function updateLesson(
  lessonId: string,
  productId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const title = str(formData, "title");
  if (!title) return;
  await supabase
    .from("course_lessons")
    .update({
      title,
      content_md: str(formData, "content_md") || null,
    })
    .eq("id", lessonId);
  revalidatePath(`/admin/products/${productId}`);
}

/** Remove a course lesson (and its video object, if any). */
export async function deleteLesson(
  lessonId: string,
  productId: string,
  videoPath: string | null,
): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  if (videoPath) {
    await supabase.storage.from(FILES_BUCKET).remove([videoPath]);
  }
  await supabase.from("course_lessons").delete().eq("id", lessonId);
  revalidatePath(`/admin/products/${productId}`);
}

/** Add a prompt to a 'prompts' product's in-app library. */
export async function addPrompt(
  productId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();

  const title = str(formData, "title");
  const promptBody = str(formData, "prompt_body");
  if (!title || !promptBody) return;

  const { data: last } = await supabase
    .from("product_prompts")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = last?.[0] ? last[0].sort_order + 1 : 0;

  await supabase.from("product_prompts").insert({
    product_id: productId,
    title,
    description: str(formData, "description") || null,
    prompt_body: promptBody,
    example_input: str(formData, "example_input") || null,
    example_output: str(formData, "example_output") || null,
    model: str(formData, "model") || null,
    sort_order: nextOrder,
  });

  revalidatePath(`/admin/products/${productId}`);
}

/** Edit an existing prompt in place. */
export async function updatePrompt(
  promptId: string,
  productId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();

  const title = str(formData, "title");
  const promptBody = str(formData, "prompt_body");
  if (!title || !promptBody) return;

  await supabase
    .from("product_prompts")
    .update({
      title,
      description: str(formData, "description") || null,
      prompt_body: promptBody,
      example_input: str(formData, "example_input") || null,
      example_output: str(formData, "example_output") || null,
      model: str(formData, "model") || null,
    })
    .eq("id", promptId);

  revalidatePath(`/admin/products/${productId}`);
}

/** Remove a prompt from a product's library. */
export async function deletePrompt(
  promptId: string,
  productId: string,
): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase.from("product_prompts").delete().eq("id", promptId);
  revalidatePath(`/admin/products/${productId}`);
}

/** Flip a product between published and draft (inline list toggle). */
export async function toggleProductStatus(
  id: string,
  current: ProductStatus,
): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const next: ProductStatus = current === "published" ? "draft" : "published";
  await supabase.from("products").update({ status: next }).eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

/** Add a product to a bundle. */
export async function addBundleItem(
  bundleId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const itemId = str(formData, "item_product_id");
  if (!itemId || itemId === bundleId) return; // can't bundle itself
  const supabase = createServiceClient();

  const { data: last } = await supabase
    .from("product_bundle_items")
    .select("sort_order")
    .eq("bundle_id", bundleId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = last?.[0] ? last[0].sort_order + 1 : 0;

  await supabase.from("product_bundle_items").upsert(
    { bundle_id: bundleId, item_product_id: itemId, sort_order: nextOrder },
    { onConflict: "bundle_id,item_product_id", ignoreDuplicates: true },
  );
  revalidatePath(`/admin/products/${bundleId}`);
}

/** Remove a product from a bundle. */
export async function removeBundleItem(
  itemId: string,
  bundleId: string,
): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase.from("product_bundle_items").delete().eq("id", itemId);
  revalidatePath(`/admin/products/${bundleId}`);
}

export type ImportState = {
  created?: number;
  updated?: number;
  errors?: string[];
  done?: boolean;
};

const BOOL_RE = /^(1|true|yes|y)$/i;

/**
 * Bulk create/update products from CSV (paste or file). Upserts by slug.
 * Columns: slug,title,short_desc,long_desc,category,price_usd,delivery_type,
 *          ls_variant_id,status,featured,cover_image_url
 */
export async function importProductsCsv(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  await requireAdmin();
  const supabase = createServiceClient();

  let text = str(formData, "csv");
  const file = formData.get("file");
  if (!text && file instanceof File && file.size > 0) {
    text = await file.text();
  }
  if (!text) return { errors: ["Paste CSV or choose a file."] };

  const rows = parseCsvToObjects(text);
  if (rows.length === 0) {
    return { errors: ["No data rows found — include a header row + ≥1 row."] };
  }

  const errors: string[] = [];
  let created = 0;
  let updated = 0;

  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx];
    const line = idx + 2; // header is line 1
    const title = (r.title ?? "").trim();
    if (!title) {
      errors.push(`Row ${line}: missing title`);
      continue;
    }
    const slug = slugify(r.slug || title);
    if (!slug) {
      errors.push(`Row ${line}: cannot derive slug`);
      continue;
    }
    const price = Number.parseFloat(r.price_usd ?? r.price ?? "0");
    if (Number.isNaN(price) || price < 0) {
      errors.push(`Row ${line} (${slug}): invalid price`);
      continue;
    }

    const payload = {
      slug,
      title,
      short_desc: r.short_desc ?? "",
      long_desc: r.long_desc || null,
      category: (r.category || "prompts").toLowerCase(),
      price_usd: price,
      delivery_type: ((): DeliveryType => {
        const dt = r.delivery_type?.toLowerCase();
        return dt === "gated" || dt === "prompts" ? dt : "license";
      })(),
      status: (r.status?.toLowerCase() === "published"
        ? "published"
        : "draft") as ProductStatus,
      featured: BOOL_RE.test(r.featured ?? ""),
      ls_variant_id: r.ls_variant_id || null,
      cover_image_url: r.cover_image_url || null,
    };

    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", existing.id);
      if (error) errors.push(`Row ${line} (${slug}): ${error.message}`);
      else updated++;
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) errors.push(`Row ${line} (${slug}): ${error.message}`);
      else created++;
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { created, updated, errors, done: true };
}
