/**
 * Builds the printable PDFs → scripts/printables/out/<id>/
 *   <Name>-Printable-Letter.pdf  and  <Name>-Printable-A4.pdf
 * plus a PNG preview of every page (for store images and checks).
 *
 *   node scripts/printables/build.mjs [id…]
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as mupdf from "mupdf";
import { SHEETS } from "../sheets/build.mjs";
import { printableHtml } from "./lib.mjs";
import { PRINTABLES } from "./products.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const outDir = (id) => path.join(HERE, "out", id);

/** File names for a product's printables. */
export const printableFiles = (id) => {
  const stem = SHEETS[id].file.replace(/\.xlsx$/, "");
  return {
    letter: `${stem}-Printable-Letter.pdf`,
    a4: `${stem}-Printable-A4.pdf`,
  };
};

export async function buildPrintables(ids = Object.keys(PRINTABLES)) {
  const browser = await chromium.launch();
  const results = {};
  for (const id of ids) {
    const dir = outDir(id);
    await rm(dir, { recursive: true, force: true });
    await mkdir(path.join(dir, "pages"), { recursive: true });
    const names = printableFiles(id);
    for (const [size, name] of [
      ["Letter", names.letter],
      ["A4", names.a4],
    ]) {
      const htmlPath = path.join(dir, `${size}.html`);
      await writeFile(htmlPath, printableHtml(PRINTABLES[id], size));
      const page = await browser.newPage();
      await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const pdf = await page.pdf({
        preferCSSPageSize: true,
        printBackground: true,
      });
      await page.close();
      await writeFile(path.join(dir, name), pdf);
      await rm(htmlPath);
      const doc = mupdf.Document.openDocument(pdf, "application/pdf");
      const count = doc.countPages();
      // Each page must start with its own title (catches a footer pushed over).
      const squash = (t) => t.replace(/\s+/g, "").toLowerCase();
      const misplaced = PRINTABLES[id].pages.filter(
        (p, i) =>
          i >= count ||
          !squash(doc.loadPage(i).toStructuredText().asText()).startsWith(
            squash(p.title),
          ),
      );
      if (size === "Letter")
        for (let i = 0; i < count; i++) {
          const pix = doc
            .loadPage(i)
            .toPixmap(
              mupdf.Matrix.scale(2, 2),
              mupdf.ColorSpace.DeviceRGB,
              false,
              true,
            );
          await writeFile(
            path.join(dir, "pages", `${String(i + 1).padStart(2, "0")}.png`),
            Buffer.from(pix.asPNG()),
          );
        }
      results[id] = {
        ...(results[id] ?? {}),
        [size]: misplaced.length ? -misplaced.length : count,
        expected: PRINTABLES[id].pages.length,
      };
    }
  }
  await browser.close();
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ids = process.argv.slice(2).filter((a) => PRINTABLES[a]);
  const res = await buildPrintables(ids.length ? ids : undefined);
  let bad = 0;
  for (const [id, r] of Object.entries(res)) {
    const ok = r.Letter === r.expected && r.A4 === r.expected;
    if (!ok) bad++;
    console.log(
      `${ok ? "ok  " : "FAIL"} ${id}: ${r.expected} pages designed · Letter ${r.Letter} · A4 ${r.A4}`,
    );
  }
  if (bad) {
    console.error(
      `${bad} product(s) overflowed: a page spilled onto a second sheet.`,
    );
    process.exit(1);
  }
}
