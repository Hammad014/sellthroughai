/**
 * Publish the spreadsheet products to Supabase:
 *   - the .xlsx and its printable PDFs (Letter, A4) → PRIVATE product-files
 *     bucket + product_files rows
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
import {
  outDir as printablesOut,
  printableFiles,
} from "../printables/build.mjs";

const FILES_BUCKET = "product-files";
const COVERS_BUCKET = "product-covers";
const PDF = "application/pdf";
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

  // The spreadsheet first, then its printable pages (both paper sizes).
  const printable = printableFiles(id);
  const deliverables = [
    [file, path.join(outDir, file), XLSX],
    [printable.letter, path.join(printablesOut(id), printable.letter), PDF],
    [printable.a4, path.join(printablesOut(id), printable.a4), PDF],
  ];
  for (const [i, [name, source, type]] of deliverables.entries()) {
    const storagePath = `${product.id}/${name}`;
    await upload(FILES_BUCKET, storagePath, await readFile(source), type);
    const found = await retry("file row", () =>
      supabase
        .from("product_files")
        .select("id")
        .eq("product_id", product.id)
        .eq("storage_path", storagePath)
        .maybeSingle(),
    );
    const row = { file_name: name, sort_order: i };
    await retry(`${name} row`, () =>
      found
        ? supabase.from("product_files").update(row).eq("id", found.id)
        : supabase.from("product_files").insert({
            ...row,
            product_id: product.id,
            storage_path: storagePath,
          }),
    );
    console.log(`file   ${name}`);
  }

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
  const gallery = [
    {
      url: await uploadImage("printables"),
      alt: "Printable pages included: US Letter and A4",
    },
  ];
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
