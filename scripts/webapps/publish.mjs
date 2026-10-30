/**
 * Publish the web-app planner to Supabase:
 *   - the HTML file → PRIVATE product-files bucket + a product_files row
 *   - cover + gallery images → PUBLIC product-covers bucket, and set
 *     products.cover_image_url / products.gallery
 *
 * Idempotent: the file uses a stable path (overwritten in place), images use
 * content-hashed names (so CDN caches never serve a stale preview).
 *
 * Prereqs: supabase/seed_life_planner_web.sql has run, and build.mjs +
 * mockups.mjs have run. Reads NEXT_PUBLIC_SUPABASE_URL +
 * SUPABASE_SERVICE_ROLE_KEY from .env.local.
 *
 *   node scripts/webapps/publish.mjs
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { APPS, outDir } from "./build.mjs";
import { SHOTS, storeDir } from "./mockups.mjs";

const SLUG = "life-planner-web-app";
const FILES_BUCKET = "product-files";
const COVERS_BUCKET = "product-covers";

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

const product = await retry("product", () =>
  supabase.from("products").select("id").eq("slug", SLUG).maybeSingle(),
);
if (!product) {
  console.error(
    `${SLUG} not found: run supabase/seed_life_planner_web.sql first.`,
  );
  process.exit(1);
}

// ---- HTML file → private bucket ----
const fileName = APPS.planner.file;
const storagePath = `${product.id}/${fileName}`;
await upload(
  FILES_BUCKET,
  storagePath,
  await readFile(path.join(outDir, fileName)),
  "text/html",
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
      file_name: fileName,
      sort_order: 0,
    }),
  );
console.log(`file   ${fileName}`);

// ---- Images → public bucket ----
async function uploadImage(name) {
  const body = await readFile(path.join(storeDir, `${name}.webp`));
  const hash = createHash("sha1").update(body).digest("hex").slice(0, 10);
  const imagePath = `${SLUG}/${name}-${hash}.webp`;
  await upload(COVERS_BUCKET, imagePath, body, "image/webp");
  console.log(`image  ${imagePath}`);
  return supabase.storage.from(COVERS_BUCKET).getPublicUrl(imagePath).data
    .publicUrl;
}

const cover = await uploadImage("cover");
const gallery = [];
for (const [name, alt] of SHOTS)
  gallery.push({ url: await uploadImage(name), alt });
await retry("product images", () =>
  supabase
    .from("products")
    .update({ cover_image_url: cover, gallery })
    .eq("id", product.id),
);
console.log(`${SLUG}: cover + ${gallery.length} gallery images`);
