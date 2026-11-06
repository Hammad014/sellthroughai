/**
 * Build every variant of each planner into scripts/planners/out/<id>/.
 *
 *   node scripts/planners/build.mjs            (all planners)
 *   node scripts/planners/build.mjs focus      (just one)
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PLANNERS, YEAR, outDir, selected, variants } from "./planners.mjs";

async function main() {
  for (const id of selected()) {
    const out = outDir(id);
    await mkdir(out, { recursive: true });
    for (const v of variants(id)) {
      const t0 = Date.now();
      const { buffer, pageCount } = await PLANNERS[id].build({
        ...v,
        year: YEAR,
      });
      await writeFile(path.join(out, v.file), buffer);
      console.log(
        `${v.file}  ${pageCount} pages  ${(buffer.length / 1e6).toFixed(1)} MB  ${Date.now() - t0}ms`,
      );
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
