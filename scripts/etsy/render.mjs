/**
 * HTML → PDF/JPG rendering for the Etsy editions, with Chromium (Playwright)
 * so the ebooks get real typography in the brand fonts. Dev tool: needs
 * Playwright + Chromium (`npx playwright install chromium`).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import * as mupdf from "mupdf";

const require = createRequire(import.meta.url);
// Playwright is a dev tool, not a project dependency: use whichever copy
// `require` can find (a global install works).
const { chromium } = require("playwright");

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const TMP = path.join(HERE, "out", ".tmp");

export const md = (s) =>
  micromark(String(s ?? ""), {
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()],
  });

export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

const font = (pkg, file) =>
  pathToFileURL(
    require.resolve(`@fontsource/${pkg}/files/${pkg}-${file}.woff2`),
  ).href;

export const BRAND = {
  navy: "#0d1b2e",
  navy2: "#16304f",
  blue: "#3a8fe0",
  sky: "#7cc4ff",
  ink: "#1d2430",
  muted: "#5d6878",
  faint: "#9aa5b4",
  paper: "#ffffff",
  tint: "#eef5fc",
  line: "#dbe3ec",
  gold: "#c08a25",
};

const FONTS = `
@font-face { font-family: Display; font-weight: 500; src: url(${font("space-grotesk", "latin-500-normal")}); }
@font-face { font-family: Display; font-weight: 600; src: url(${font("space-grotesk", "latin-600-normal")}); }
@font-face { font-family: Display; font-weight: 700; src: url(${font("space-grotesk", "latin-700-normal")}); }
@font-face { font-family: Body; font-weight: 400; src: url(${font("hanken-grotesk", "latin-400-normal")}); }
@font-face { font-family: Body; font-weight: 400; font-style: italic; src: url(${font("hanken-grotesk", "latin-400-italic")}); }
@font-face { font-family: Body; font-weight: 500; src: url(${font("hanken-grotesk", "latin-500-normal")}); }
@font-face { font-family: Body; font-weight: 600; src: url(${font("hanken-grotesk", "latin-600-normal")}); }
@font-face { font-family: Body; font-weight: 700; src: url(${font("hanken-grotesk", "latin-700-normal")}); }
@font-face { font-family: Mono; font-weight: 400; src: url(${font("jetbrains-mono", "latin-400-normal")}); }
@font-face { font-family: Mono; font-weight: 500; src: url(${font("jetbrains-mono", "latin-500-normal")}); }
`;

/** Styles for the inside pages of every ebook. */
const BOOK_CSS = `
${FONTS}
@page { size: Letter; margin: 0.85in 0.9in 0.95in; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: Body; font-size: 11.2pt; line-height: 1.6; color: ${BRAND.ink}; margin: 0; }
h1, h2, h3 { font-family: Display; color: ${BRAND.ink}; line-height: 1.2; letter-spacing: -0.01em; break-after: avoid; }
h1 { font-size: 27pt; font-weight: 600; margin: 0 0 18pt; }
h2 { font-size: 15.5pt; font-weight: 600; margin: 22pt 0 8pt; }
h3 { font-size: 12.5pt; font-weight: 600; margin: 16pt 0 6pt; }
p { margin: 0 0 9pt; }
ul, ol { margin: 0 0 10pt; padding-left: 18pt; }
li { margin: 0 0 4pt; }
strong { font-weight: 600; }
a { color: ${BRAND.blue}; text-decoration: none; }
code { font-family: Mono; font-size: 9.6pt; background: ${BRAND.tint}; padding: 1pt 4pt; border-radius: 4pt; }
blockquote { margin: 10pt 0; padding: 10pt 14pt; background: ${BRAND.tint}; border-left: 3pt solid ${BRAND.blue}; border-radius: 0 8pt 8pt 0; }
blockquote p:last-child { margin: 0; }
table { border-collapse: collapse; width: 100%; margin: 6pt 0 14pt; font-size: 10.4pt; break-inside: avoid; }
th, td { border: 0.6pt solid ${BRAND.line}; padding: 6pt 8pt; text-align: left; }
th { background: ${BRAND.tint}; font-weight: 600; }
.eyebrow { font-family: Mono; font-size: 8.6pt; letter-spacing: 0.18em; text-transform: uppercase; color: ${BRAND.blue}; margin: 0 0 8pt; }
.chapter { break-before: page; }
.toc ol { list-style: none; padding: 0; counter-reset: toc; }
.toc li { counter-increment: toc; display: flex; gap: 14pt; padding: 9pt 0; border-bottom: 0.6pt solid ${BRAND.line}; margin: 0; font-size: 11.5pt; }
.toc li::before { content: counter(toc, decimal-leading-zero); font-family: Mono; color: ${BRAND.blue}; font-size: 10pt; padding-top: 1pt; }
.note { background: ${BRAND.tint}; border-radius: 10pt; padding: 12pt 16pt; margin: 14pt 0; }
.note p:last-child { margin: 0; }
.prompt { font-family: Mono; font-size: 9.4pt; line-height: 1.55; white-space: pre-wrap; background: #f6f8fb; border: 0.7pt solid ${BRAND.line}; border-radius: 10pt; padding: 13pt 15pt; margin: 6pt 0 14pt; }
.prompt mark { background: #fff1c7; color: #6b4a00; border-radius: 3pt; padding: 0 2pt; }
.chip { display: inline-block; font-family: Mono; font-size: 8.4pt; letter-spacing: 0.06em; color: ${BRAND.muted}; border: 0.7pt solid ${BRAND.line}; border-radius: 99pt; padding: 2pt 9pt; margin: 0 0 12pt; }
.example { background: #fbfcfd; border: 0.7pt dashed ${BRAND.line}; border-radius: 10pt; padding: 11pt 14pt; margin: 6pt 0 12pt; font-size: 10.4pt; }
.example p:last-child, .example ul:last-child { margin-bottom: 0; }
.lead { font-size: 12.5pt; color: ${BRAND.muted}; }
`;

/** Full-bleed cover page. */
const COVER_CSS = `
${FONTS}
@page { size: Letter; margin: 0; }
html, body { margin: 0; height: 100%; background: #070f1b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: Body; color: #fff; }
.cover { position: relative; width: 8.5in; height: 11in; overflow: hidden;
  background: radial-gradient(120% 80% at 85% 0%, ${BRAND.navy2} 0%, ${BRAND.navy} 60%, #070f1b 100%); padding: 1.1in 0.95in; }
.glow { position: absolute; right: -1.6in; bottom: -1.4in; width: 6in; height: 6in; border-radius: 50%;
  background: radial-gradient(circle, rgba(124,196,255,0.28), rgba(124,196,255,0) 70%); }
.brand { font-family: Mono; font-size: 10.5pt; letter-spacing: 0.3em; color: ${BRAND.sky}; }
.kind { margin-top: 2.2in; font-family: Mono; font-size: 10pt; letter-spacing: 0.22em; text-transform: uppercase; color: #9fb3c8; }
h1 { font-family: Display; font-weight: 700; font-size: 44pt; line-height: 1.04; letter-spacing: -0.02em; margin: 14pt 0 20pt; max-width: 6.4in; }
.sub { font-size: 14pt; line-height: 1.5; color: #c9d6e4; max-width: 5.8in; }
.foot { position: absolute; left: 0.95in; right: 0.95in; bottom: 0.9in; display: flex; justify-content: space-between;
  font-family: Mono; font-size: 9pt; letter-spacing: 0.16em; text-transform: uppercase; color: #7f93a8; border-top: 0.7pt solid rgba(255,255,255,0.14); padding-top: 12pt; }
`;

let browser;
async function getBrowser() {
  browser ??= await chromium.launch();
  return browser;
}
export async function closeBrowser() {
  await browser?.close();
  browser = undefined;
}

async function htmlFile(name, html) {
  await mkdir(TMP, { recursive: true });
  const file = path.join(TMP, `${name}.html`);
  await writeFile(file, html);
  return pathToFileURL(file).href;
}

async function printPdf(name, html, { footer } = {}) {
  const page = await (await getBrowser()).newPage();
  await page.goto(await htmlFile(name, html), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const pdf = await page.pdf({
    preferCSSPageSize: true,
    printBackground: true,
    displayHeaderFooter: Boolean(footer),
    headerTemplate: "<span></span>",
    footerTemplate: footer
      ? `<div style="width:100%;font-family:Helvetica,Arial,sans-serif;font-size:7.5pt;color:#9aa5b4;padding:0 0.9in;display:flex;justify-content:space-between;">
           <span>${esc(footer)}</span><span class="pageNumber"></span></div>`
      : "<span></span>",
  });
  await page.close();
  return pdf;
}

/** Merge PDFs (buffers) into one, in order. */
function mergePdfs(buffers) {
  const out = new mupdf.PDFDocument();
  for (const buf of buffers) {
    const src = mupdf.Document.openDocument(buf, "application/pdf");
    for (let i = 0; i < src.countPages(); i++) out.graftPage(-1, src, i);
  }
  return Buffer.from(out.saveToBuffer("compress").asUint8Array());
}

/**
 * An ebook PDF: designed cover + inside pages (`bodyHtml`) with a footer.
 * Returns the PDF buffer.
 */
export async function ebookPdf({ name, kind, title, subtitle, bodyHtml }) {
  const cover = await printPdf(
    `${name}-cover`,
    `<!doctype html><meta charset="utf-8"><style>${COVER_CSS}</style>
     <div class="cover"><div class="glow"></div>
       <div class="brand">MAKEREADY</div>
       <div class="kind">${esc(kind)}</div>
       <h1>${esc(title)}</h1>
       <div class="sub">${esc(subtitle)}</div>
       <div class="foot"><span>${esc(kind)}</span><span>Digital edition</span></div>
     </div>`,
  );
  const body = await printPdf(
    `${name}-body`,
    `<!doctype html><meta charset="utf-8"><style>${BOOK_CSS}</style>${bodyHtml}`,
    { footer: `Makeready · ${title}` },
  );
  return mergePdfs([cover, body]);
}

/** Render page `index` of a PDF buffer to PNG at `scale`. */
export function renderPdfPage(pdf, index, scale = 2) {
  const doc = mupdf.Document.openDocument(pdf, "application/pdf");
  const pix = doc
    .loadPage(index)
    .toPixmap(
      mupdf.Matrix.scale(scale, scale),
      mupdf.ColorSpace.DeviceRGB,
      false,
      true,
    );
  return Buffer.from(pix.asPNG());
}

/**
 * Index of the first page whose text contains `needle`, ignoring case and
 * spaces (letter-spaced labels come out as "P R O M P T 0 1").
 */
export function findPage(pdf, needle, from = 0) {
  const doc = mupdf.Document.openDocument(pdf, "application/pdf");
  const squash = (s) => s.toLowerCase().replace(/\s+/g, "");
  const want = squash(needle);
  for (let i = from; i < doc.countPages(); i++)
    if (squash(doc.loadPage(i).toStructuredText().asText()).includes(want))
      return i;
  throw new Error(`No page contains "${needle}"`);
}

export const pageCount = (pdf) =>
  mupdf.Document.openDocument(pdf, "application/pdf").countPages();

/** Screenshot an HTML document at width × height → JPG buffer. */
export async function htmlImage(name, html, width, height) {
  const page = await (
    await getBrowser()
  ).newPage({
    viewport: { width, height },
  });
  await page.goto(
    await htmlFile(
      name,
      `<!doctype html><meta charset="utf-8"><style>${FONTS} html,body{margin:0}</style>${html}`,
    ),
    { waitUntil: "load" },
  );
  await page.evaluate(() => document.fonts.ready);
  const jpg = await page.screenshot({ type: "jpeg", quality: 90 });
  await page.close();
  return jpg;
}

export const dataUrl = async (fileOrBuffer, mime = "image/png") => {
  const buf =
    typeof fileOrBuffer === "string"
      ? await readFile(fileOrBuffer)
      : fileOrBuffer;
  return `data:${mime};base64,${buf.toString("base64")}`;
};
