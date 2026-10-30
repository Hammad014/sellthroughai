/**
 * The product catalog the Etsy export works from: products with their
 * prompts, lessons and bundle contents — the same content buyers see on the
 * website.
 *
 * Source: a JSON snapshot (`--catalog file.json`), or else the live database
 * via NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
 *
 * Snapshot shape: { products: [{ slug, title, short_desc, long_desc,
 *   category, price_usd, delivery_type, prompts: [...], lessons: [...],
 *   bundle: [slug…] }] }
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

const bySort = (a, b) => a.sort_order - b.sort_order;

async function fromSnapshot(file) {
  const { products } = JSON.parse(await readFile(file, "utf8"));
  return new Map(products.map((p) => [p.slug, p]));
}

async function fromSupabase() {
  const text = await readFile(path.resolve(".env.local"), "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]])
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
  const get = async (table, select) => {
    const { data, error } = await db.from(table).select(select);
    if (error) throw new Error(`${table}: ${error.message}`);
    return data;
  };
  const products = await get(
    "products",
    "id, slug, title, short_desc, long_desc, category, price_usd, delivery_type",
  );
  const prompts = await get(
    "product_prompts",
    "product_id, sort_order, title, description, model, prompt_body, example_input, example_output",
  );
  const lessons = await get(
    "course_lessons",
    "product_id, sort_order, title, content_md",
  );
  const items = await get(
    "product_bundle_items",
    "bundle_id, item_product_id, sort_order",
  );
  const slugOf = new Map(products.map((p) => [p.id, p.slug]));
  return new Map(
    products.map((p) => [
      p.slug,
      {
        ...p,
        prompts: prompts.filter((x) => x.product_id === p.id).sort(bySort),
        lessons: lessons.filter((x) => x.product_id === p.id).sort(bySort),
        bundle: items
          .filter((x) => x.bundle_id === p.id)
          .sort(bySort)
          .map((x) => slugOf.get(x.item_product_id)),
      },
    ]),
  );
}

export async function loadCatalog(argv = process.argv.slice(2)) {
  const i = argv.indexOf("--catalog");
  return i >= 0 ? fromSnapshot(argv[i + 1]) : fromSupabase();
}
