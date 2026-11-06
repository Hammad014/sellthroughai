/**
 * Printable pages: a tiny layout kit that turns page specs into print-ready
 * HTML, rendered to PDF by Chromium in US Letter and A4. Light on ink:
 * white paper, thin grey lines, small navy headings.
 *
 * Block types (all blank, to write on):
 *   table     { cols: [{ h, w? }], rows, prefill?: [[...]] }
 *   checklist { sections: [{ h, items?: [], blank? }], columns? }
 *   grid      { rows: [labels] | n, cols: [labels], first?: label, firstW? }
 *   boxes     { n, per, label? }                 shade-a-box tracker
 *   lines     { n, label? }
 *   columns   { cols: [{ h, lines }] }
 *   week      { lines }                           7 day boxes
 *   month     {}                                  undated calendar
 *   scale     { label, n, labels? }               circles to colour
 *   fields    { items: [labels] }                 "Label ________" row
 *   row       { blocks: [...], widths?: [] }      side by side
 *   note      { text }
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const font = (pkg, file) =>
  pathToFileURL(
    require.resolve(`@fontsource/${pkg}/files/${pkg}-${file}.woff2`),
  ).href;

export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

const CSS = `
@font-face { font-family: Display; font-weight: 600; src: url(${font("space-grotesk", "latin-600-normal")}); }
@font-face { font-family: Body; font-weight: 400; src: url(${font("hanken-grotesk", "latin-400-normal")}); }
@font-face { font-family: Body; font-weight: 600; src: url(${font("hanken-grotesk", "latin-600-normal")}); }
:root { --ink: #1d2430; --muted: #6b7584; --line: #c9d1db; --soft: #eef2f6; --accent: #2b78c9; --navy: #0d1b2e; }
* { box-sizing: border-box; }
html, body { margin: 0; font-family: Body, Arial, sans-serif; color: var(--ink); font-size: 9.5pt; }
.page { page-break-after: always; break-after: page; display: flex; flex-direction: column; gap: 0.16in; height: var(--h); }
.page:last-child { page-break-after: auto; break-after: auto; }
.top { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid var(--navy); padding-bottom: 0.06in; }
.top h1 { font-family: Display; font-weight: 600; font-size: 20pt; margin: 0; letter-spacing: -0.01em; }
.top .brand { font-size: 7pt; letter-spacing: 0.18em; color: var(--accent); text-transform: uppercase; }
.sub { color: var(--muted); font-size: 8.5pt; margin-top: -0.08in; }
.fields { display: flex; gap: 0.25in; }
.fields div { flex: 1; display: flex; gap: 6px; align-items: flex-end; font-size: 8.5pt; color: var(--muted); }
.fields div span { flex: 1; border-bottom: 1px solid var(--line); height: 14px; }
h2 { font-family: Display; font-weight: 600; font-size: 10.5pt; margin: 0 0 4px; color: var(--navy); }
table { width: 100%; border-collapse: collapse; table-layout: fixed; }
th { font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); text-align: left; padding: 3px 4px; border-bottom: 1.5px solid var(--navy); }
td { border-bottom: 1px solid var(--line); height: var(--row, 0.3in); padding: 0 4px; font-size: 8.5pt; }
td + td, th + th { border-left: 1px solid var(--soft); }
.grid td { text-align: center; border: 1px solid var(--line); }
.grid td.label { text-align: left; font-size: 8pt; }
.grid th { text-align: center; padding: 3px 1px; font-size: 7pt; }
.check { display: flex; align-items: center; gap: 7px; border-bottom: 1px solid var(--line); height: var(--row, 0.27in); font-size: 8.5pt; }
.check i { width: 11px; height: 11px; border: 1.2px solid var(--muted); border-radius: 2px; flex: none; }
.cols { display: grid; gap: 0.2in; }
.boxes { display: grid; gap: 3px; }
.boxes i { aspect-ratio: 1; border: 1px solid var(--line); border-radius: 2px; display: grid; place-items: center; font-size: 6pt; color: var(--muted); font-style: normal; }
.line { border-bottom: 1px solid var(--line); height: var(--row, 0.28in); }
.week { display: grid; grid-template-columns: 1fr 1fr; gap: 0.12in; flex: 1; }
.day { border: 1px solid var(--line); border-radius: 6px; padding: 6px 8px; display: flex; flex-direction: column; }
.day b { font-family: Display; font-size: 9.5pt; display: flex; justify-content: space-between; }
.day b span { color: var(--muted); font-weight: 400; font-family: Body; font-size: 8pt; }
.day .line { flex: 1; min-height: 0.22in; }
.month { display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: auto repeat(5, 1fr); flex: 1; border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
.month div { border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 3px 5px; font-size: 7pt; color: var(--muted); }
.month .dow { font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; text-align: center; padding: 4px; border-bottom: 1.5px solid var(--navy); }
.scale { display: flex; align-items: center; gap: 8px; font-size: 8.5pt; }
.scale i { width: 16px; height: 16px; border: 1.2px solid var(--muted); border-radius: 50%; display: grid; place-items: center; font-size: 6.5pt; font-style: normal; color: var(--muted); }
.row { display: grid; gap: 0.22in; }
.block { display: flex; flex-direction: column; }
.grow { flex: 1; display: flex; flex-direction: column; }
.grow > .lines { flex: 1; display: flex; flex-direction: column; }
.grow > .lines .line { flex: 1; }
.note { font-size: 7.5pt; color: var(--muted); }
.foot { margin-top: auto; display: flex; justify-content: space-between; font-size: 6.5pt; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; }
`;

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function block(b) {
  const head = b.h ? `<h2>${esc(b.h)}</h2>` : "";
  const style = b.row ? ` style="--row:${b.row}in"` : "";
  switch (b.type) {
    case "table": {
      const cols = b.cols
        .map((c) => `<col${c.w ? ` style="width:${c.w}"` : ""}>`)
        .join("");
      const ths = b.cols.map((c) => `<th>${esc(c.h)}</th>`).join("");
      const rows = Array.from(
        { length: b.rows },
        (_, i) =>
          `<tr>${b.cols.map((_, j) => `<td>${esc(b.prefill?.[i]?.[j] ?? "")}</td>`).join("")}</tr>`,
      ).join("");
      return `<div class="block${b.grow ? " grow" : ""}"${style}>${head}<table><colgroup>${cols}</colgroup><tr>${ths}</tr>${rows}</table></div>`;
    }
    case "checklist": {
      const sections = b.sections
        .map((s) => {
          const items = [...(s.items ?? []), ...Array(s.blank ?? 0).fill("")];
          return `<div>${s.h ? `<h2>${esc(s.h)}</h2>` : ""}${items.map((t) => `<div class="check"><i></i>${esc(t)}</div>`).join("")}</div>`;
        })
        .join("");
      return `<div class="block"${style}>${head}<div class="cols" style="grid-template-columns:repeat(${b.columns ?? 1},1fr)">${sections}</div></div>`;
    }
    case "grid": {
      const rows = typeof b.rows === "number" ? Array(b.rows).fill("") : b.rows;
      const ths = `<th style="text-align:left;width:${b.firstW ?? "26%"}">${esc(b.first ?? "")}</th>${b.cols.map((c) => `<th>${esc(c)}</th>`).join("")}`;
      const trs = rows
        .map(
          (r) =>
            `<tr><td class="label">${esc(r)}</td>${b.cols.map(() => "<td></td>").join("")}</tr>`,
        )
        .join("");
      return `<div class="block grid${b.grow ? " grow" : ""}"${style}>${head}<table><tr>${ths}</tr>${trs}</table></div>`;
    }
    case "boxes":
      return `<div class="block"${style}>${head}<div class="boxes" style="grid-template-columns:repeat(${b.per},1fr)">${Array.from({ length: b.n }, (_, i) => `<i>${b.numbered ? i + 1 : ""}</i>`).join("")}</div>${b.label ? `<div class="note" style="margin-top:4px">${esc(b.label)}</div>` : ""}</div>`;
    case "lines":
      return `<div class="block${b.grow ? " grow" : ""}"${style}>${head}<div class="lines">${'<div class="line"></div>'.repeat(b.n)}</div></div>`;
    case "columns":
      return `<div class="block${b.grow ? " grow" : ""}"${style}><div class="cols" style="grid-template-columns:repeat(${b.cols.length},1fr)">${b.cols.map((c) => `<div><h2>${esc(c.h)}</h2>${(c.items ?? []).map((t) => `<div class="check"><i></i>${esc(t)}</div>`).join("")}${'<div class="check"><i></i></div>'.repeat(c.lines)}</div>`).join("")}</div></div>`;
    case "week":
      return `<div class="week">${DAYS.map((d) => `<div class="day"><b>${d}<span>____</span></b>${'<div class="line"></div>'.repeat(b.lines ?? 5)}</div>`).join("")}<div class="day"><b>${esc(b.extra ?? "Notes")}</b>${'<div class="line"></div>'.repeat(b.lines ?? 5)}</div></div>`;
    case "month":
      return `<div class="month">${DAYS.map((d) => `<div class="dow">${d.slice(0, 3)}</div>`).join("")}${"<div></div>".repeat(35)}</div>`;
    case "scale":
      return `<div class="scale"><b>${esc(b.label)}</b>${Array.from({ length: b.n }, (_, i) => `<i>${esc(b.labels?.[i] ?? i + 1)}</i>`).join("")}</div>`;
    case "fields":
      return `<div class="fields">${b.items.map((f) => `<div>${esc(f)}<span></span></div>`).join("")}</div>`;
    case "row":
      return `<div class="row${b.grow ? " grow" : ""}" style="grid-template-columns:${(b.widths ?? b.blocks.map(() => "1fr")).join(" ")}">${b.blocks.map(block).join("")}</div>`;
    case "note":
      return `<div class="note">${esc(b.text)}</div>`;
    default:
      throw new Error(`unknown block ${b.type}`);
  }
}

/** Full HTML document for one product's printable pages at a paper size. */
export function printableHtml(product, size) {
  const h = size === "A4" ? "10.69in" : "10in"; // page height minus margins
  const pages = product.pages
    .map(
      (p) => `<section class="page">
        <div class="top"><h1>${esc(p.title)}</h1><div class="brand">Makeready · ${esc(product.name)}</div></div>
        ${p.sub ? `<div class="sub">${esc(p.sub)}</div>` : ""}
        ${p.blocks.map(block).join("")}
        <div class="foot"><span>${esc(product.name)}</span><span>Printable · ${size === "A4" ? "A4" : "US Letter"}</span></div>
      </section>`,
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
    @page { size: ${size === "A4" ? "A4" : "letter"}; margin: 0.5in; }
    :root { --h: ${h}; }</style></head><body>${pages}</body></html>`;
}
