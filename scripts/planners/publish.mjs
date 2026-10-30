/**
 * Publish each planner's generated assets to Supabase:
 *   - the 6 PDFs → PRIVATE product-files bucket + product_files rows
 *   - cover + gallery images → PUBLIC product-covers bucket, and set
 *     products.cover_image_url / products.gallery
 *
 * Idempotent: PDFs use stable paths (overwritten in place), images use
 * content-hashed names (so CDN caches never serve a stale preview).
 *
 * Prereqs: the product row exists (supabase/seed_<planner>_planner.sql —
 * planners without one are skipped), migration 0008 is applied, and
 * build.mjs + mockups.mjs have run.
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
 *
 *   node scripts/planners/publish.mjs [planner…]
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { PLANNERS, outDir, selected, variants } from "./planners.mjs";

const FILES_BUCKET = "product-files";
const COVERS_BUCKET = "product-covers";

async function loadEnv() {
  const text = await readFile(path.resolve(".env.local"), "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]])
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

await loadEnv();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

/** Run a Supabase call that returns { data, error }, retrying on failure. */
async function retry(label, fn) {
  for (let attempt = 1; ; attempt++) {
    const { data, error } = await fn();
    if (!error) return data;
    if (attempt >= 4) throw new Error(`${label}: ${error.message}`);
    await new Promise((r) => setTimeout(r, attempt * 2000));
  }
}

const upload = (bucket, storagePath, body, contentType) =>
  retry(storagePath, () =>
    supabase.storage
      .from(bucket)
      .upload(storagePath, body, { upsert: true, contentType }),
  );

for (const id of selected()) {
  const SLUG = PLANNERS[id].slug;
  const OUT = outDir(id);
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("slug", SLUG)
    .maybeSingle();
  if (!product) {
    console.warn(`skip   ${SLUG}: product not found — run its seed first.`);
    continue;
  }

  // ---- PDFs → private bucket ----
  for (const [i, v] of variants(id).entries()) {
    const storagePath = `${product.id}/${v.file}`;
    const body = await readFile(path.join(OUT, v.file));
    await upload(FILES_BUCKET, storagePath, body, "application/pdf");

    // Insert is keyed on storage_path, so re-runs (or a retried insert whose
    // response was lost) never create duplicate rows.
    const row = { file_name: v.file, sort_order: i };
    const find = () =>
      supabase
        .from("product_files")
        .select("id")
        .eq("product_id", product.id)
        .eq("storage_path", storagePath)
        .maybeSingle();
    await retry(`${v.file} row`, async () => {
      const found = await find();
      if (found.error) return found;
      return found.data
        ? supabase.from("product_files").update(row).eq("id", found.data.id)
        : supabase.from("product_files").insert({
            ...row,
            product_id: product.id,
            storage_path: storagePath,
          });
    });
    console.log(`file   ${v.file}`);
  }

  // ---- Images → public bucket ----
  const uploadImage = async (name) => {
    const body = await readFile(path.join(OUT, "store", `${name}.webp`));
    const hash = createHash("sha1").update(body).digest("hex").slice(0, 10);
    const storagePath = `${SLUG}/${name}-${hash}.webp`;
    await upload(COVERS_BUCKET, storagePath, body, "image/webp");
    console.log(`image  ${storagePath}`);
    return supabase.storage.from(COVERS_BUCKET).getPublicUrl(storagePath).data
      .publicUrl;
  };

  const cover = await uploadImage("cover");
  const gallery = [];
  for (const [, , name, alt] of PLANNERS[id].shots)
    gallery.push({ url: await uploadImage(name), alt });

  const { error: uErr } = await supabase
    .from("products")
    .update({ cover_image_url: cover, gallery })
    .eq("id", product.id);
  if (uErr) throw new Error(uErr.message);
  console.log(`${SLUG}: cover + ${gallery.length} gallery images`);
}
