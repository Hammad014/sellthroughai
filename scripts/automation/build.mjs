/**
 * Build each n8n package (see lib/packages.mjs) into scripts/automation/out/<id>/:
 *   workflows/NN-Name.json   one importable n8n workflow each
 *   <zip>                    all workflows + extras + README
 *
 *   node scripts/automation/build.mjs [kit|course]
 * (then, with an n8n install: node scripts/automation/validate.mjs)
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zip } from "./lib/zip.mjs";
import { PACKAGES, selected } from "./lib/packages.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const outDir = (id) => path.join(HERE, "out", id);
export const storeDir = (id) => path.join(HERE, "store", id);

/** Every workflow module of a package, in the order buyers see them. */
export async function loadWorkflows(id) {
  const dir = path.join(HERE, PACKAGES[id].source);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mjs")).sort();
  const mods = [];
  for (const f of files) mods.push(await import(path.join(dir, f)));
  return mods;
}

/** Files buyers get, in library order: the zip first, then each workflow. */
export async function packageFiles(id) {
  const mods = await loadWorkflows(id);
  return [PACKAGES[id].zip, ...mods.map((m) => `${m.meta.file}.json`)];
}

async function buildPackage(id) {
  const pkg = PACKAGES[id];
  const out = outDir(id);
  await rm(out, { recursive: true, force: true });
  await mkdir(path.join(out, "workflows"), { recursive: true });

  const entries = [];
  const titles = [];
  for (const mod of await loadWorkflows(id)) {
    const json = `${JSON.stringify(mod.build().toJSON(), null, 2)}\n`;
    const name = `${mod.meta.file}.json`;
    await writeFile(path.join(out, "workflows", name), json);
    entries.push({ name: `workflows/${name}`, data: Buffer.from(json) });
    titles.push(mod.meta.title);
    console.log(`${id}  workflow  ${name}`);
  }

  const extras = path.join(HERE, pkg.extras.dir);
  for (const f of (await readdir(extras)).sort())
    entries.push({
      name: pkg.extras.folder ? `${pkg.extras.folder}/${f}` : f,
      data: await readFile(path.join(extras, f)),
    });

  entries.unshift({
    name: "README.txt",
    data: Buffer.from(pkg.readme(titles)),
  });
  const archive = zip(
    entries.map((e) => ({ ...e, name: `${pkg.folder}/${e.name}` })),
  );
  await writeFile(path.join(out, pkg.zip), archive);
  console.log(
    `${id}  zip       ${pkg.zip}  ${(archive.length / 1024).toFixed(0)} KB`,
  );
}

async function main() {
  for (const id of selected()) await buildPackage(id);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
