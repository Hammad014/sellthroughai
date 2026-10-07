/**
 * Build every Clarity Planner variant into scripts/planners/out/clarity/.
 *
 *   node scripts/planners/build.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildClarity } from "./clarity.mjs";

export const YEAR = 2027;
export const OUT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "out",
  "clarity",
);

/** The six files buyers receive (order = order shown in their library). */
export const VARIANTS = [
  { edition: "dated", weekStart: "mon", theme: "light" },
  { edition: "dated", weekStart: "mon", theme: "dark" },
  { edition: "dated", weekStart: "sun", theme: "light" },
  { edition: "dated", weekStart: "sun", theme: "dark" },
  { edition: "undated", weekStart: "mon", theme: "light" },
  { edition: "undated", weekStart: "mon", theme: "dark" },
].map((v) => ({
  ...v,
  file:
    v.edition === "dated"
      ? `Clarity-Planner-${YEAR}-${v.weekStart === "mon" ? "Monday" : "Sunday"}-${v.theme === "light" ? "Paper" : "Midnight"}.pdf`
      : `Clarity-Planner-Undated-${v.theme === "light" ? "Paper" : "Midnight"}.pdf`,
}));

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const v of VARIANTS) {
    const t0 = Date.now();
    const { buffer, pageCount } = await buildClarity({ ...v, year: YEAR });
    await writeFile(path.join(OUT, v.file), buffer);
    console.log(
      `${v.file}  ${pageCount} pages  ${(buffer.length / 1e6).toFixed(1)} MB  ${Date.now() - t0}ms`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
