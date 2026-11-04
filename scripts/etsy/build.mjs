/**
 * Etsy editions of the planners and spreadsheets → scripts/etsy/out/<slug>/
 * (the Etsy shop is planners + spreadsheets only; the AI products are sold on
 * the website)
 *   files/        what buyers download (≤ 5 files, ≤ 20 MB each: Etsy's limits)
 *   images/       listing photos, 2400×1800 JPG (Etsy wants ≥ 2000 px)
 *   LISTING.txt   title, price, 13 tags and description to paste into Etsy
 *
 *   node scripts/etsy/build.mjs --catalog snapshot.json [slug…]
 *   node scripts/etsy/build.mjs [slug…]        (reads the live database)
 *
 * Needs the planner, web-app and spreadsheet builds first (npm run
 * planners:build, npm run webapps:build, npm run sheets:build) and
 * Playwright + Chromium.
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { loadCatalog } from "./catalog.mjs";
import { LISTINGS, checkListing } from "./listings.mjs";
import {
  BRAND,
  closeBrowser,
  dataUrl,
  ebookPdf,
  esc,
  htmlImage,
  md,
  TMP,
} from "./render.mjs";
import { zip } from "../automation/lib/zip.mjs";
import {
  PLANNERS,
  outDir as plannerOut,
  variants,
} from "../planners/planners.mjs";
import { APPS, outDir as webappOut } from "../webapps/build.mjs";
import { SHEETS, outDir as sheetsOut } from "../sheets/build.mjs";
import { SHEET_LINKS } from "../sheets/links.mjs";
import {
  STORE as SHEET_STORE,
  storeDir as sheetStore,
} from "../sheets/mockups.mjs";
import {
  SHOTS as WEBAPP_SHOTS,
  storeDir as webappStore,
} from "../webapps/mockups.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "out");
const MAX_FILES = 5;
const MAX_BYTES = 20 * 1024 * 1024;
const IMG_W = 2400;
const IMG_H = 1800;

// ======================================================================
// Website wording → Etsy wording
// ======================================================================

const ETSY_WORDING = [
  [/^.*(Lifetime access|no-questions refund).*$\n?/gm, ""],
  [/Instant download from your library, plus/g, "Instant download, plus"],
  [
    /Open your Makeready library on the iPad or tablet you'll plan on and tap the file\./g,
    "On the iPad or tablet you'll plan on, open Etsy → **You → Purchases**, download the files and unzip them, then tap the PDF.",
  ],
  [/from your library/g, "from your Etsy purchase"],
  [
    /Buy once and (both|all three) unlock in your library straight away\./g,
    "Instant download: everything comes as files you can download straight away.",
  ],
  [
    /(Questions or stuck\? )?Email (us at )?support@usemakeready\.com/g,
    "$1Message us on Etsy",
  ],
];

export const etsyText = (s) =>
  ETSY_WORDING.reduce(
    (t, [re, to]) => t.replace(re, to),
    String(s ?? ""),
  ).trim();

/** Markdown → plain text for Etsy's description box (no formatting). */
function plainText(markdown) {
  const out = [];
  let headers = null;
  for (const raw of etsyText(markdown).split("\n")) {
    const line = raw
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/\[(.+?)\]\((.+?)\)/g, "$1");
    if (/^\|/.test(line)) {
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      if (cells.every((c) => /^-+$/.test(c))) continue;
      if (!headers) {
        headers = cells;
        continue;
      }
      const ticks = headers.slice(1).filter((_, i) => cells[i + 1] === "✓");
      out.push(
        `• ${cells[0]}: ${ticks.length ? ticks.join(", ") : cells.slice(1).join(" · ")}`,
      );
      continue;
    }
    headers = null;
    if (/^#{1,3} /.test(line))
      out.push("", line.replace(/^#+ /, "").toUpperCase());
    else if (/^- /.test(line)) out.push(`• ${line.slice(2)}`);
    else out.push(line);
  }
  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const fileStem = (title) =>
  `Makeready-${title
    .replace(/['’]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

// ======================================================================
// Ebook PDFs
// ======================================================================

const aboutSection = (p, label) => `
  <section>
    <p class="eyebrow">About this ${label}</p>
    <h1>${esc(p.title)}</h1>
    <p class="lead">${esc(etsyText(p.short_desc))}</p>
    ${md(etsyText(p.long_desc))}
  </section>`;

const tocSection = (titles, heading = "What's inside") => `
  <section class="chapter toc">
    <p class="eyebrow">Contents</p>
    <h1>${heading}</h1>
    <ol>${titles.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>
  </section>`;

/** Lessons (courses, guides, setup guides) as an ebook. */
async function lessonsPdf(
  p,
  { kind, label, title = p.title, numbered = true },
) {
  const chapters = p.lessons
    .map(
      (l, i) => `
      <section class="chapter">
        <p class="eyebrow">${numbered ? `${label} ${String(i + 1).padStart(2, "0")}` : label}</p>
        <h1>${esc(l.title)}</h1>
        ${md(etsyText(l.content_md))}
      </section>`,
    )
    .join("");
  return ebookPdf({
    name: `${p.slug}-${label.toLowerCase()}`,
    kind,
    title,
    subtitle: etsyText(p.short_desc),
    bodyHtml:
      aboutSection(p, kind.toLowerCase()) +
      tocSection(p.lessons.map((l) => l.title)) +
      chapters,
  });
}

// ======================================================================
// Listing images
// ======================================================================

const bg = `background: radial-gradient(110% 90% at 85% 0%, ${BRAND.navy2} 0%, ${BRAND.navy} 55%, #070f1b 100%);`;

/** "What you get": file list + how it works. */
function infoImage(name, { files, need, steps }) {
  return htmlImage(
    name,
    `<div style="width:${IMG_W}px;height:${IMG_H}px;${bg}font-family:Body;color:#fff;padding:150px 170px;box-sizing:border-box;display:flex;gap:120px">
      <div style="flex:1.1">
        <div style="font-family:Mono;font-size:32px;letter-spacing:.22em;color:${BRAND.sky}">WHAT YOU GET</div>
        <div style="font-family:Display;font-weight:700;font-size:92px;margin:24px 0 60px">Instant digital download</div>
        ${files.map((f) => `<div style="font-size:42px;color:#d6e4f0;margin:0 0 30px;display:flex;gap:26px"><span style="color:${BRAND.sky}">▸</span><span>${esc(f)}</span></div>`).join("")}
        <div style="margin-top:70px;font-size:36px;color:#9fb3c8">You'll need: ${esc(need)}</div>
      </div>
      <div style="flex:.9;align-self:flex-start;margin-top:40px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.12);border-radius:40px;padding:80px 70px 26px">
        <div style="font-family:Mono;font-size:30px;letter-spacing:.22em;color:${BRAND.sky};margin-bottom:50px">HOW IT WORKS</div>
        ${steps.map((s, i) => `<div style="display:flex;gap:34px;margin:0 0 54px"><span style="font-family:Display;font-weight:700;font-size:64px;color:${BRAND.sky};line-height:1">${i + 1}</span><span style="font-size:42px;line-height:1.35;color:#e6eef6">${esc(s)}</span></div>`).join("")}
      </div>
    </div>`,
    IMG_W,
    IMG_H,
  );
}

/**
 * A store image (webp, any size) as a 2400×1800 JPG: near-4:3 images are
 * cropped to fill; wider ones are padded in their own edge colour.
 */
async function storeImage(file) {
  const { width, height } = await sharp(file).metadata();
  const ratio = width / height / (IMG_W / IMG_H);
  if (ratio > 0.88 && ratio < 1.12)
    return sharp(file)
      .resize(IMG_W, IMG_H, { fit: "cover" })
      .jpeg({ quality: 90 })
      .toBuffer();
  const { data } = await sharp(file)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return sharp(file)
    .resize(IMG_W, IMG_H, {
      fit: "contain",
      background: { r: data[0], g: data[1], b: data[2] },
    })
    .jpeg({ quality: 90 })
    .toBuffer();
}

/** Grid of other products' hero images (for bundles). */
async function collageImage(name, { title, sub, images }) {
  const pics = await Promise.all(images.map((b) => dataUrl(b, "image/jpeg")));
  // Fit every item: up to 3 per row, sized to the space left under the title.
  const cols = Math.min(images.length, 3);
  const rows = Math.ceil(images.length / cols);
  const w = Math.min(
    1000,
    (IMG_W - 300 - (cols - 1) * 50) / cols,
    ((IMG_H - 560 - (rows - 1) * 50) / rows) * (IMG_W / IMG_H),
  );
  return htmlImage(
    name,
    `<div style="width:${IMG_W}px;height:${IMG_H}px;${bg}font-family:Body;color:#fff;box-sizing:border-box;padding:110px 150px;text-align:center;display:flex;flex-direction:column;justify-content:center">
      <div style="font-family:Mono;font-size:32px;letter-spacing:.22em;color:${BRAND.sky}">MAKEREADY · BUNDLE</div>
      <div style="font-family:Display;font-weight:700;font-size:100px;margin:24px 0 18px">${esc(title)}</div>
      <div style="font-size:44px;color:#c9d6e4;margin-bottom:80px">${esc(sub)}</div>
      <div style="display:flex;flex-wrap:wrap;gap:50px;justify-content:center">${pics.map((src) => `<img src="${src}" style="width:${w}px;border-radius:22px;box-shadow:0 30px 80px rgba(0,0,0,.5)">`).join("")}</div>
    </div>`,
    IMG_W,
    IMG_H,
  );
}

// ======================================================================
// Per-kind packaging
// ======================================================================

const NEED = {
  planner:
    "a tablet with GoodNotes, Notability, Noteshelf, Xodo or Samsung Notes",
  sheet:
    "a free Google account (Google Sheets) or Microsoft Excel. Easiest on a computer; the Google Sheets app works on phones",
  webapp:
    "a computer or laptop (Windows, Mac or Chromebook) with Chrome, Edge, Firefox or Safari. Not for phones",
};

const STEPS = {
  planner: [
    "Download and unzip the files on your tablet",
    "Import the PDF into your planner app",
    "Tap tabs, dates and buttons to get around",
  ],
  sheet: [
    "Download the spreadsheet file",
    "Open it in Google Sheets (free) or Excel",
    "Type in the yellow cells. It does the maths",
  ],
  webapp: [
    "Download the planner file to your computer",
    "Double-click it: it opens in your browser",
    "Type and tick. It saves as you go",
  ],
};

/** Build one product's files; returns { files: [{name, data}], images, … }. */
async function packageProduct(slug, l, catalog, cache) {
  const p = catalog.get(slug);
  if (!p) throw new Error(`${slug} is not in the catalog`);
  const files = [];
  const images = [];
  let fileLines = [];

  if (l.kind === "planner") {
    const id = Object.keys(PLANNERS).find((k) => PLANNERS[k].slug === slug);
    const vs = variants(id);
    const dir = plannerOut(id);
    const read = (v) => readFile(path.join(dir, v.file));
    const guide = await lessonsPdf(p, {
      kind: "Setup guide",
      label: "Step",
      title: `${p.title}: Setup Guide`,
    });
    if (vs.length <= 4) {
      for (const v of vs) files.push({ name: v.file, data: await read(v) });
    } else {
      // Group light + dark of each edition into one zip.
      const groups = new Map();
      for (const v of vs) {
        const key =
          v.edition === "dated"
            ? `2027-${v.weekStart === "mon" ? "Monday" : "Sunday"}-Start`
            : "Undated";
        groups.set(key, [...(groups.get(key) ?? []), v]);
      }
      for (const [key, list] of groups) {
        const entries = [];
        for (const v of list)
          entries.push({ name: v.file, data: await read(v) });
        files.push({
          name: `${PLANNERS[id].name}-Planner-${key}.zip`,
          data: zip(entries),
        });
      }
    }
    files.push({ name: `${fileStem(p.title)}-Setup-Guide.pdf`, data: guide });
    fileLines = files.map(
      (f) =>
        f.name.replace(/\.(pdf|zip)$/, "").replace(/-/g, " ") +
        (f.name.endsWith(".zip") ? " (light + dark PDFs)" : ""),
    );
    const store = path.join(dir, "store");
    const cover = await storeImage(path.join(store, "cover.webp"));
    cache.set(slug, { hero: cover, id });
    images.push(cover);
    for (const [, , name] of PLANNERS[id].shots)
      images.push(await storeImage(path.join(store, `${name}.webp`)));
  }

  if (l.kind === "sheet") {
    const sh = SHEETS[l.sheet];
    files.push({
      name: sh.file,
      data: await readFile(path.join(sheetsOut, sh.file)),
    });
    // With a "Make a copy" link, Google Sheets buyers get a one-click step 1.
    const link = SHEET_LINKS[l.sheet];
    const guide = link
      ? {
          ...p,
          lessons: [
            {
              title: "Fastest way: one click into Google Sheets",
              content_md: `[**Click here to make your own copy in Google Sheets**](${link})\n\nSign in to Google if asked, then click **Make a copy**. That's it: the copy is yours, and nobody else can see it.\n\nPrefer Excel, or want to keep the file? Use the .xlsx in your download and follow the next step.`,
            },
            ...p.lessons,
          ],
        }
      : p;
    files.push({
      name: sh.file.replace(/\.xlsx$/, "-Start-Here.pdf"),
      data: await lessonsPdf(guide, {
        kind: "Guide",
        label: "Step",
        title: `${sh.title}: Start Here`,
      }),
    });
    fileLines = [
      `${sh.title} (.xlsx for Google Sheets and Excel)`,
      link
        ? "Start Here guide PDF with a one-click Google Sheets copy"
        : "Start Here guide PDF",
    ];
    const store = sheetStore(l.sheet);
    const cover = await storeImage(path.join(store, "cover.webp"));
    cache.set(slug, { hero: cover });
    images.push(cover);
    for (const [, name] of SHEET_STORE[l.sheet].shots)
      images.push(await storeImage(path.join(store, `${name}.webp`)));
  }

  if (l.kind === "webapp") {
    const app = APPS[l.app];
    files.push({
      name: app.file,
      data: await readFile(path.join(webappOut, app.file)),
    });
    files.push({
      name: app.file.replace(/\.html$/, "-Start-Here.pdf"),
      data: await lessonsPdf(p, {
        kind: "Guide",
        label: "Step",
        title: `${app.title}: Start Here`,
      }),
    });
    fileLines = [
      `${app.title} (one file that opens in your browser)`,
      "Start Here guide PDF",
    ];
    const cover = await storeImage(path.join(webappStore, "cover.webp"));
    cache.set(slug, { hero: cover });
    images.push(cover);
    for (const [name] of WEBAPP_SHOTS)
      images.push(await storeImage(path.join(webappStore, `${name}.webp`)));
  }

  if (l.kind === "bundle") {
    const items = p.bundle;
    for (const s of items)
      if (!cache.has(s)) await packageProduct(s, LISTINGS[s], catalog, cache);
    {
      // Planners: every edition of each, one zip per planner (zipped PDFs
      // shrink about 3×, so all of them fit Etsy's 20 MB per file).
      for (const s of items) {
        const id = cache.get(s).id;
        const entries = [];
        for (const v of variants(id))
          entries.push({
            name: v.file,
            data: await readFile(path.join(plannerOut(id), v.file)),
          });
        files.push({
          name: `${PLANNERS[id].name}-Planner-All-Editions.zip`,
          data: zip(entries),
        });
      }
      // Every planner's setup guide, each step labelled with its planner.
      const lessons = items.flatMap((s) =>
        catalog.get(s).lessons.map((les) => ({
          ...les,
          title: `${PLANNERS[cache.get(s).id].name}: ${les.title}`,
        })),
      );
      files.push({
        name: `${fileStem(p.title)}-Setup-Guide.pdf`,
        data: await lessonsPdf(
          { ...p, lessons },
          {
            kind: "Setup guide",
            label: "Step",
            title: `${p.title}: Setup Guide`,
          },
        ),
      });
      fileLines = [
        ...items.map(
          (s) => `${catalog.get(s).title}: every edition, light + dark (zip)`,
        ),
        "Setup guide PDF",
      ];
    }
    images.push(
      await collageImage(`${slug}-collage`, {
        title: p.title,
        sub: `${items.length} products in one download`,
        images: items.map((s) => cache.get(s).hero),
      }),
    );
  }

  const need = NEED[l.kind === "bundle" ? LISTINGS[p.bundle[0]].kind : l.kind];
  const steps =
    STEPS[l.kind === "bundle" ? LISTINGS[p.bundle[0]].kind : l.kind];
  images.push(
    await infoImage(`${slug}-info`, { files: fileLines, need, steps }),
  );
  return { p, files, images, fileLines, need };
}

function listingText(slug, l, { p, files, need }) {
  const sizes = files
    .map((f) => `• ${f.name} (${(f.data.length / 1024 / 1024).toFixed(1)} MB)`)
    .join("\n");
  return `ETSY LISTING · ${slug}
${"=".repeat(60)}

TITLE (${l.title.length}/140)
${l.title}

PRICE (suggested)
$${l.price.toFixed(2)}   (website price: $${Number(p.price_usd).toFixed(2)})

TAGS (13 — paste one at a time)
${l.tags.join(", ")}

LISTING SETTINGS
• Type: Digital files
• Who made it: I did · What is it: A finished product · When was it made: 2020 – 2026
• Upload the ${files.length} file(s) in files/ under "Digital files"
• Upload the photos in images/ in order (01 is the thumbnail)

FILES BUYERS GET
${sizes}

DESCRIPTION (paste below this line)
${"-".repeat(60)}
${etsyText(p.short_desc)}

${plainText(p.long_desc)}

WHAT YOU GET
${files.map((f) => `• ${f.name}`).join("\n")}

YOU'LL NEED
${need[0].toUpperCase()}${need.slice(1)}.

HOW IT WORKS
This is a digital download: nothing will be shipped. After you buy, download the files from Etsy (You → Purchases and reviews → Download files).

PLEASE NOTE
Because this is a digital product, it can't be returned. If anything isn't working, send us a message and we'll help.

Made by Makeready. Some content was created with the help of AI tools and reviewed by us.
`;
}

async function main() {
  const argv = process.argv.slice(2);
  const catalog = await loadCatalog(argv);
  const wanted = argv.filter((a) => LISTINGS[a]);
  const slugs = wanted.length ? wanted : Object.keys(LISTINGS);
  const cache = new Map();
  for (const slug of slugs) {
    const l = LISTINGS[slug];
    checkListing(slug, l);
    const result = await packageProduct(slug, l, catalog, cache);
    const { files, images } = result;
    if (files.length > MAX_FILES)
      throw new Error(
        `${slug}: ${files.length} files (Etsy allows ${MAX_FILES})`,
      );
    for (const f of files)
      if (f.data.length > MAX_BYTES)
        throw new Error(`${slug}: ${f.name} is over 20 MB`);

    const dir = path.join(OUT, slug);
    await rm(dir, { recursive: true, force: true });
    await mkdir(path.join(dir, "files"), { recursive: true });
    await mkdir(path.join(dir, "images"), { recursive: true });
    for (const f of files)
      await writeFile(path.join(dir, "files", f.name), f.data);
    for (const [i, img] of images.slice(0, 10).entries())
      await writeFile(
        path.join(dir, "images", `${String(i + 1).padStart(2, "0")}.jpg`),
        img,
      );
    await writeFile(
      path.join(dir, "LISTING.txt"),
      listingText(slug, l, result),
    );
    const mb = files.reduce((a, f) => a + f.data.length, 0) / 1024 / 1024;
    console.log(
      `${slug}: ${files.length} file(s), ${mb.toFixed(1)} MB, ${Math.min(images.length, 10)} images`,
    );
  }
  await closeBrowser();
  await rm(TMP, { recursive: true, force: true });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
