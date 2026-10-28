/**
 * Store imagery from the REAL n8n editor: opens each imported workflow,
 * crops the canvas around its nodes (16:10), and composes a cover.
 * Output → scripts/automation/store/ (committed, so publishing doesn't need n8n).
 *
 * Dev-only. Needs a running n8n with the kit imported under ids
 * kitreal01xxxxxxx … kitreal10xxxxxxx and a login:
 *   N8N_URL=http://localhost:5678 N8N_EMAIL=… N8N_PASSWORD=… \
 *     node scripts/automation/store-images.mjs
 */
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { SHOTS } from "./lib/gallery.mjs";

// Playwright is a dev tool, not a project dependency: use whichever copy
// `require` can find (a global install works).
const { chromium } = createRequire(import.meta.url)("playwright");

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const STORE = path.join(HERE, "store");

const W = 1600;
const H = 1000;

// Editor chrome that would clutter a product shot.
const HIDE = [
  "canvas-controls",
  "execute-workflow-button",
  "logs-panel",
  "canvas-minimap",
  "canvas-handle-plus-wrapper",
  "canvas-node-toolbar",
  "instance-ai-canvas-action-button",
]
  .map((id) => `[data-test-id^="${id}"]`)
  .join(",");

async function shoot(page, n) {
  await page.goto(`${process.env.N8N_URL}/workflow/kitreal${n}xxxxxxx`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(2500);
  // Zoom out one step from "fit" so the crop has breathing room.
  await page.click('[data-test-id="zoom-out-button"]');
  await page.waitForTimeout(800);
  await page.addStyleTag({ content: `${HIDE} { display: none !important; }` });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);

  const { box, canvas } = await page.evaluate(() => {
    const r = [...document.querySelectorAll(".vue-flow__node")].map((e) =>
      e.getBoundingClientRect(),
    );
    const c = document
      .querySelector('[data-test-id="canvas-wrapper"]')
      .getBoundingClientRect();
    return {
      box: {
        x1: Math.min(...r.map((b) => b.left)),
        y1: Math.min(...r.map((b) => b.top)),
        x2: Math.max(...r.map((b) => b.right)),
        y2: Math.max(...r.map((b) => b.bottom)) + 40, // labels under nodes
      },
      canvas: { x: c.left, y: c.top, w: c.width, h: c.height },
    };
  });
  // Pad, grow to 16:10 around the centre, keep inside the canvas.
  let w = box.x2 - box.x1 + 80;
  let h = box.y2 - box.y1 + 60;
  if (w / h > 1.6) h = w / 1.6;
  else w = h * 1.6;
  w = Math.min(w, canvas.w);
  h = Math.min(h, canvas.h);
  const x = Math.min(
    Math.max(canvas.x, (box.x1 + box.x2) / 2 - w / 2),
    canvas.x + canvas.w - w,
  );
  const y = Math.min(
    Math.max(canvas.y, (box.y1 + box.y2) / 2 - h / 2),
    canvas.y + canvas.h - h,
  );
  return page.screenshot({ clip: { x, y, width: w, height: h } });
}

async function cover(canvasPng) {
  const shot = await sharp(canvasPng).resize(880, 550).png().toBuffer();
  const rounded = await sharp(shot)
    .composite([
      {
        input: Buffer.from(
          `<svg width="880" height="550"><rect width="880" height="550" rx="20" fill="#fff"/></svg>`,
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
  const bg =
    Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="78%" cy="18%" r="80%">
        <stop offset="0" stop-color="#173a5e"/><stop offset="1" stop-color="#0a1220"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <text x="96" y="150" font-family="Space Grotesk, Hanken Grotesk, sans-serif" font-size="24" letter-spacing="5" fill="#7cc4ff">MAKEREADY · AUTOMATION KIT</text>
    <text x="92" y="250" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="84" fill="#ffffff">AI Automation</text>
    <text x="92" y="345" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="84" fill="#ffffff">Starter Kit</text>
    <text x="96" y="420" font-family="Hanken Grotesk, sans-serif" font-size="32" fill="#9fb3c8">10 ready-to-import n8n workflows</text>
    <text x="96" y="560" font-family="Hanken Grotesk, sans-serif" font-size="26" fill="#d6e4f0">✓  Inbox, leads, content, invoices</text>
    <text x="96" y="610" font-family="Hanken Grotesk, sans-serif" font-size="26" fill="#d6e4f0">✓  Setup guide for every workflow</text>
    <text x="96" y="660" font-family="Hanken Grotesk, sans-serif" font-size="26" fill="#d6e4f0">✓  Google Sheets templates included</text>
  </svg>`);
  const shadow = await sharp({
    create: {
      width: 920,
      height: 590,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0.5 },
    },
  })
    .blur(24)
    .png()
    .toBuffer();
  return sharp(bg)
    .composite([
      { input: shadow, left: 650, top: 380 },
      { input: rounded, left: 670, top: 390 },
    ])
    .webp({ quality: 88 })
    .toBuffer();
}

async function main() {
  await mkdir(STORE, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 2,
  });
  await page.goto(`${process.env.N8N_URL}/signin`, {
    waitUntil: "networkidle",
  });
  await page.fill(
    "input[type=email], input[name=emailOrLdapLoginId]",
    process.env.N8N_EMAIL,
  );
  await page.fill("input[type=password]", process.env.N8N_PASSWORD);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(3000);

  for (const [n, file] of SHOTS) {
    const png = await shoot(page, n);
    await sharp(png)
      .resize(W, H, { fit: "contain", background: "#f5f5f5" })
      .webp({ quality: 88 })
      .toFile(path.join(STORE, `${file}.webp`));
    console.log(`image  ${file}.webp`);
  }
  await sharp(await cover(await shoot(page, "01"))).toFile(
    path.join(STORE, "cover.webp"),
  );
  console.log("image  cover.webp");
  await browser.close();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
