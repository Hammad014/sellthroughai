/**
 * Render planner pages to PNG with MuPDF (pure WASM — no native deps).
 *
 *   node scripts/planners/render.mjs <variantIndex> <pageKey...>
 *   e.g. node scripts/planners/render.mjs 0 home month-3 week-14
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as mupdf from "mupdf";
import { buildClarity } from "./clarity.mjs";
import { OUT, VARIANTS, YEAR } from "./build.mjs";

/** Render pages (by index) of a PDF buffer → PNG buffers at `scale`. */
export function renderPages(pdf, indices, scale = 1) {
  const doc = mupdf.Document.openDocument(pdf, "application/pdf");
  return indices.map((i) => {
    const page = doc.loadPage(i);
    const pix = page.toPixmap(
      mupdf.Matrix.scale(scale, scale),
      mupdf.ColorSpace.DeviceRGB,
      false,
      true,
    );
    return Buffer.from(pix.asPNG());
  });
}

/** Links on a page as { rect, targetPage } — used to sanity-check wiring. */
export function pageLinks(pdf, index) {
  const doc = mupdf.Document.openDocument(pdf, "application/pdf");
  return doc
    .loadPage(index)
    .getLinks()
    .map((l) => ({
      rect: l.getBounds(),
      target: doc.resolveLink(l),
    }));
}

async function main() {
  const [vi = "0", ...keys] = process.argv.slice(2);
  const v = VARIANTS[Number(vi)];
  const file = path.join(OUT, v.file);
  const pdf = await readFile(file).catch(() => null);
  const { pages, buffer } = pdf
    ? { buffer: pdf, ...(await buildClarity({ ...v, year: YEAR })) }
    : await buildClarity({ ...v, year: YEAR });
  const indices = keys.map((k) => {
    const i = pages.findIndex((p) => p.key === k);
    if (i < 0) throw new Error(`No page ${k}`);
    return i;
  });
  const dir = path.join(OUT, "renders");
  await mkdir(dir, { recursive: true });
  renderPages(pdf ?? buffer, indices, 0.75).forEach((png, n) => {
    const out = path.join(dir, `${vi}-${keys[n]}.png`);
    return writeFile(out, png).then(() => console.log(out));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
