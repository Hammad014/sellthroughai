/**
 * Publish the spreadsheet products to Supabase:
 *   - the .xlsx → PRIVATE product-files bucket + a product_files row
 *   - cover + gallery images → PUBLIC product-covers bucket, and set
 *     products.cover_image_url / products.gallery
 *
 * Idempotent: the file uses a stable path (overwritten in place), images use
 * content-hashed names (so CDN caches never serve a stale preview).
 *
 * Prereqs: the product's seed has run (supabase/seed_budget_spreadsheet.sql,
 * supabase/seed_student_planner_sheet.sql), and build.mjs + mockups.mjs have
 * run. Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from
 * .env.local.
 *
 *   node scripts/sheets/publish.mjs [budget|student]
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { SHEETS, outDir } from "./build.mjs";
import { STORE, storeDir } from "./mockups.mjs";

const FILES_BUCKET = "product-files";
const COVERS_BUCKET = "product-covers";
const XLSX =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const text = await readFile(path.resolve(".env.local"), "utf8");
for (const line of text.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]])
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
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

const ids = process.argv.slice(2).filter((a) => SHEETS[a]);
for (const id of ids.length ? ids : Object.keys(SHEETS)) {
  const { slug, file } = SHEETS[id];
  const product = await retry("product", () =>
    supabase.from("products").select("id").eq("slug", slug).maybeSingle(),
  );
  if (!product) {
    console.warn(`skip   ${slug}: product not found — run its seed first.`);
    continue;
  }

  const storagePath = `${product.id}/${file}`;
  await upload(
    FILES_BUCKET,
    storagePath,
    await readFile(path.join(outDir, file)),
    XLSX,
  );
  const found = await retry("file row", () =>
    supabase
      .from("product_files")
      .select("id")
      .eq("product_id", product.id)
      .eq("storage_path", storagePath)
      .maybeSingle(),
  );
  if (!found)
    await retry("insert file row", () =>
      supabase.from("product_files").insert({
        product_id: product.id,
        storage_path: storagePath,
        file_name: file,
        sort_order: 0,
      }),
    );
  console.log(`file   ${file}`);

  const uploadImage = async (name) => {
    const body = await readFile(path.join(storeDir(id), `${name}.webp`));
    const hash = createHash("sha1").update(body).digest("hex").slice(0, 10);
    const imagePath = `${slug}/${name}-${hash}.webp`;
    await upload(COVERS_BUCKET, imagePath, body, "image/webp");
    console.log(`image  ${imagePath}`);
    return supabase.storage.from(COVERS_BUCKET).getPublicUrl(imagePath).data
      .publicUrl;
  };
  const cover = await uploadImage("cover");
  const gallery = [];
  for (const [, name, , , alt] of STORE[id].shots)
    gallery.push({ url: await uploadImage(name), alt });
  await retry("product images", () =>
    supabase
      .from("products")
      .update({ cover_image_url: cover, gallery })
      .eq("id", product.id),
  );
  console.log(`${slug}: cover + ${gallery.length} gallery images`);
}
