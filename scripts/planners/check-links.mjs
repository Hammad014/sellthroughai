/**
 * Verify every hyperlink in every built planner resolves to a real page, and
 * that every page (except the cover) is reachable from somewhere.
 *
 *   node scripts/planners/check-links.mjs
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import * as mupdf from "mupdf";
import { OUT, VARIANTS } from "./build.mjs";

let failed = false;
for (const v of VARIANTS) {
  const doc = mupdf.Document.openDocument(
    await readFile(path.join(OUT, v.file)),
    "application/pdf",
  );
  const n = doc.countPages();
  const inbound = new Array(n).fill(0);
  let links = 0;
  let bad = 0;
  for (let i = 0; i < n; i++) {
    for (const l of doc.loadPage(i).getLinks()) {
      links++;
      const target = doc.resolveLink(l);
      if (!(target >= 0 && target < n)) bad++;
      else if (target !== i) inbound[target]++;
    }
  }
  const orphans = inbound
    .map((c, i) => (c === 0 && i !== 0 ? i : null))
    .filter((i) => i != null);
  if (bad || orphans.length) failed = true;
  console.log(
    `${v.file}: ${n} pages, ${links} links, ${bad} broken, ${orphans.length} unreachable${orphans.length ? ` (${orphans.slice(0, 10).join(",")})` : ""}`,
  );
}
process.exit(failed ? 1 : 0);
