/**
 * Builds the web-app products into single, self-contained HTML files:
 * styles, script and fonts are inlined, so the file works offline with a
 * double-click and nothing to install.
 *
 *   node scripts/webapps/build.mjs   → scripts/webapps/out/*.html
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
export const outDir = join(here, "out");

export const APPS = {
  planner: {
    file: "Makeready-Life-Planner.html",
    title: "Life Planner",
    description:
      "Your daily, weekly and monthly planner with habits, goals and budget. Saves in this browser.",
  },
};

const font = (pkg, file) =>
  readFileSync(
    require.resolve(`@fontsource/${pkg}/files/${pkg}-${file}.woff2`),
  ).toString("base64");

const FONTS = [
  ["Display", 600, "space-grotesk", "latin-600-normal"],
  ["Hanken", 400, "hanken-grotesk", "latin-400-normal"],
  ["Hanken", 500, "hanken-grotesk", "latin-500-normal"],
  ["Hanken", 600, "hanken-grotesk", "latin-600-normal"],
]
  .map(
    ([family, weight, pkg, file]) =>
      `@font-face{font-family:"${family}";font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${font(pkg, file)}) format("woff2")}`,
  )
  .join("\n");

// A blue rounded square with an "M", used as the browser-tab icon.
const ICON = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#3a8fe0"/><text x="32" y="44" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">M</text></svg>`,
)}`;

export function buildApp(id) {
  const app = APPS[id];
  const css = readFileSync(join(here, id, "styles.css"), "utf8");
  // "</script" inside the script would end the tag early.
  const js = readFileSync(join(here, id, "app.js"), "utf8").replace(
    /<\/script/gi,
    "<\\/script",
  );
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cut">
<meta name="description" content="${app.description}">
<meta name="color-scheme" content="light dark">
<title>${app.title}</title>
<link rel="icon" href="${ICON}">
<style>
${FONTS}
${css}
</style>
</head>
<body>
<noscript><p style="font:16px system-ui;padding:24px">This planner needs JavaScript. Open the file in Chrome, Edge, Firefox or Safari.</p></noscript>
<script>
${js}
</script>
</body>
</html>
`;
  mkdirSync(outDir, { recursive: true });
  const path = join(outDir, app.file);
  writeFileSync(path, html);
  return path;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const id of Object.keys(APPS)) {
    const path = buildApp(id);
    console.log(
      `${path} (${(readFileSync(path).length / 1024).toFixed(0)} KB)`,
    );
  }
}
