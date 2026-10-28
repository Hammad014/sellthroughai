/**
 * Store imagery from REAL planner pages: renders pages with MuPDF and frames
 * them in a tablet mockup with sharp. Output → scripts/planners/out/<id>/store/
 *
 *   node scripts/planners/mockups.mjs [planner…]   (run build.mjs first)
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { PLANNERS, YEAR, outDir, selected, variants } from "./planners.mjs";
import { renderPages } from "./render.mjs";

const BEZEL = 34;
const RADIUS = 58;

/** Tablet frame around a page image (PNG buffer) → PNG buffer with alpha. */
async function device(pagePng, screenW) {
  const screenH = Math.round((screenW * 3) / 4);
  const w = screenW + BEZEL * 2;
  const h = screenH + BEZEL * 2;
  const screen = await sharp(pagePng)
    .resize(screenW, screenH, { fit: "fill" })
    .png()
    .toBuffer();
  const mask = Buffer.from(
    `<svg width="${screenW}" height="${screenH}"><rect width="${screenW}" height="${screenH}" rx="${RADIUS - BEZEL + 6}" fill="#fff"/></svg>`,
  );
  const rounded = await sharp(screen)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
  const frame = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${RADIUS}" fill="#121318" stroke="#2c2e36" stroke-width="1.5"/>
      <rect x="4" y="4" width="${w - 8}" height="${h - 8}" rx="${RADIUS - 4}" fill="none" stroke="#000" stroke-opacity="0.6" stroke-width="2"/>
      <circle cx="${w / 2}" cy="${BEZEL / 2}" r="4" fill="#24262d"/>
    </svg>`,
  );
  return sharp(frame)
    .composite([{ input: rounded, left: BEZEL, top: BEZEL }])
    .png()
    .toBuffer();
}

/** Soft drop shadow for an RGBA image. */
async function shadowed(img, blur = 34, opacity = 0.45) {
  const { width, height } = await sharp(img).metadata();
  const pad = blur * 2;
  const shadow = await sharp({
    create: {
      width: width + pad * 2,
      height: height + pad * 2,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${RADIUS}" fill="rgba(0,0,0,${opacity})"/></svg>`,
        ),
        left: pad,
        top: pad + Math.round(blur * 0.8),
      },
    ])
    .blur(blur)
    .png()
    .toBuffer();
  return sharp(shadow)
    .composite([{ input: img, left: pad, top: pad }])
    .png()
    .toBuffer();
}

function background(w, h, [hi, mid, deep, glow]) {
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g" cx="25%" cy="15%" r="110%">
          <stop offset="0" stop-color="${hi}"/>
          <stop offset="0.5" stop-color="${mid}"/>
          <stop offset="1" stop-color="${deep}"/>
        </radialGradient>
        <radialGradient id="glow" cx="85%" cy="95%" r="60%">
          <stop offset="0" stop-color="${glow}" stop-opacity="0.28"/>
          <stop offset="1" stop-color="${glow}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect width="100%" height="100%" fill="url(#glow)"/>
    </svg>`,
  );
}

async function pageImages(id) {
  const cache = new Map();
  const get = async (vi) => {
    if (!cache.has(vi)) {
      const v = variants(id)[vi];
      const { pages } = await PLANNERS[id].build({ ...v, year: YEAR });
      const pdf = await readFile(path.join(outDir(id), v.file));
      cache.set(vi, { pages, pdf });
    }
    return cache.get(vi);
  };
  return async (vi, key, scale = 1.5) => {
    const { pages, pdf } = await get(vi);
    const idx = pages.findIndex((p) => p.key === key);
    if (idx < 0) throw new Error(`No page ${key}`);
    return renderPages(pdf, [idx], scale)[0];
  };
}

async function main() {
  for (const id of selected()) await mockups(id);
}

async function mockups(id) {
  const { shots, cover: coverPages, palette } = PLANNERS[id];
  const STORE = path.join(outDir(id), "store");
  await mkdir(STORE, { recursive: true });
  const page = await pageImages(id);

  // Gallery: 1600×1200 — one tablet, centred.
  for (const [vi, key, name] of shots) {
    const dev = await shadowed(await device(await page(vi, key), 1300));
    const meta = await sharp(dev).metadata();
    const W = 1600;
    const H = 1200;
    const out = await sharp(background(W, H, palette))
      .composite([
        {
          input: dev,
          left: Math.round((W - meta.width) / 2),
          top: Math.round((H - meta.height) / 2),
        },
      ])
      .webp({ quality: 88 })
      .toBuffer();
    await writeFile(path.join(STORE, `${name}.webp`), out);
    console.log(`${id}/${name}.webp`);
  }

  // Cover: 1600×1100 — a dark page tilted behind a light one.
  const back = await sharp(
    await shadowed(await device(await page(...coverPages.back), 1040)),
  )
    .rotate(-7, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const front = await sharp(
    await shadowed(await device(await page(...coverPages.front), 1100)),
  )
    .rotate(4, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const CW = 1600;
  const CH = 1100;
  const bm = await sharp(back).metadata();
  const fm = await sharp(front).metadata();
  // Compose on an oversized canvas so tablets can bleed off the edges, then crop.
  const M = 600;
  const canvas = await sharp(background(CW + M * 2, CH + M * 2, palette))
    .composite([
      {
        input: back,
        left: M - 150,
        top: M + Math.round((CH - bm.height) / 2) - 120,
      },
      {
        input: front,
        left: M + CW - fm.width + 170,
        top: M + Math.round((CH - fm.height) / 2) + 110,
      },
    ])
    .png()
    .toBuffer();
  const cover = await sharp(canvas)
    .extract({ left: M, top: M, width: CW, height: CH })
    .composite([{ input: background(CW, CH, palette), blend: "dest-over" }])
    .webp({ quality: 88 })
    .toBuffer();
  await writeFile(path.join(STORE, "cover.webp"), cover);
  console.log(`${id}/cover.webp`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
