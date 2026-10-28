/**
 * Build the AI Automation Starter Kit into scripts/automation/out/:
 *   workflows/NN-Name.json   one importable n8n workflow each
 *   Makeready-AI-Automation-Kit.zip   all workflows + Google Sheets templates
 *
 *   node scripts/automation/build.mjs
 * (then, with an n8n install: node scripts/automation/validate.mjs)
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zip } from "./lib/zip.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const OUT = path.join(HERE, "out");
export const ZIP_NAME = "Makeready-AI-Automation-Kit.zip";

/** Every workflow module, in the order buyers see them. */
export async function loadWorkflows() {
  const dir = path.join(HERE, "workflows");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mjs")).sort();
  const mods = [];
  for (const f of files) mods.push(await import(path.join(dir, f)));
  return mods;
}

/** Files buyers get, in library order: the zip first, then each workflow. */
export async function kitFiles() {
  const mods = await loadWorkflows();
  return [ZIP_NAME, ...mods.map((m) => `${m.meta.file}.json`)];
}

const README = (titles) => `MAKEREADY · AI AUTOMATION STARTER KIT
=====================================

What's in this folder
---------------------
workflows/   ${titles.length} n8n workflows, ready to import:
${titles.map((t) => `               - ${t}`).join("\n")}
sheets/      Google Sheets templates (CSV) used by some workflows

Quick start
-----------
1. Open n8n (n8n Cloud, or self-hosted n8n kept up to date).
2. Workflows → Create → "..." menu → Import from file → pick a .json file.
3. Read the note on the canvas and follow its setup steps.
4. Connect your accounts, click "Execute workflow" to test, then click "Publish"
   (older n8n versions: flip the "Active" switch).

For Google Sheets: in Google Drive, File → Import the matching CSV from
sheets/ (or create a sheet with the same header row), then paste the
sheet's URL into the workflow's Settings node.

The full step-by-step guides are in your Makeready library.
Questions: support@usemakeready.com
`;

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(path.join(OUT, "workflows"), { recursive: true });

  const entries = [];
  const titles = [];
  for (const mod of await loadWorkflows()) {
    const json = `${JSON.stringify(mod.build().toJSON(), null, 2)}\n`;
    const name = `${mod.meta.file}.json`;
    await writeFile(path.join(OUT, "workflows", name), json);
    entries.push({ name: `workflows/${name}`, data: Buffer.from(json) });
    titles.push(mod.meta.title);
    console.log(`workflow  ${name}`);
  }

  const sheetsDir = path.join(HERE, "sheets");
  for (const f of (await readdir(sheetsDir)).sort())
    entries.push({
      name: `sheets/${f}`,
      data: await readFile(path.join(sheetsDir, f)),
    });

  entries.unshift({ name: "README.txt", data: Buffer.from(README(titles)) });
  const archive = zip(
    entries.map((e) => ({ ...e, name: `AI-Automation-Kit/${e.name}` })),
  );
  await writeFile(path.join(OUT, ZIP_NAME), archive);
  console.log(
    `zip       ${ZIP_NAME}  ${(archive.length / 1024).toFixed(0)} KB`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
