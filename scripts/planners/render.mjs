/**
 * Render planner pages to PNG with MuPDF (pure WASM — no native deps).
 *
 *   node scripts/planners/render.mjs [planner] <variantIndex> <pageKey...>
 *   e.g. node scripts/planners/render.mjs focus 0 home month-3 week-14
 *   (planner defaults to clarity)
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as mupdf from "mupdf";
import { PLANNERS, YEAR, outDir, variants } from "./planners.mjs";

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
  const args = process.argv.slice(2);
  const id = PLANNERS[args[0]] ? args.shift() : "clarity";
  const [vi = "0", ...keys] = args;
  const v = variants(id)[Number(vi)];
  const out = outDir(id);
  const pdf = await readFile(path.join(out, v.file)).catch(() => null);
  const built = await PLANNERS[id].build({ ...v, year: YEAR });
  const indices = keys.map((k) => {
    const i = built.pages.findIndex((p) => p.key === k);
    if (i < 0) throw new Error(`No page ${k}`);
    return i;
  });
  const dir = path.join(out, "renders");
  await mkdir(dir, { recursive: true });
  renderPages(pdf ?? built.buffer, indices, 0.75).forEach((png, n) => {
    const file = path.join(dir, `${vi}-${keys[n]}.png`);
    return writeFile(file, png).then(() => console.log(file));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
