/**
 * Store imagery from the REAL spreadsheets: renders each demo workbook's
 * tabs (LibreOffice) and frames them in a laptop.
 * Output → scripts/sheets/out/store/<id>/*.webp (2400×1800).
 *
 *   node scripts/sheets/mockups.mjs [budget|student]   (run build.mjs first)
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compose, label, laptop } from "../webapps/mockups.mjs";
import { SHEETS, demoDir, outDir } from "./build.mjs";
import { renderSheets } from "./render.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

export const storeDir = (id) => path.join(outDir, "store", id);

/** Per product: cover headline + [sheet, image name, eyebrow, title, alt]. */
export const STORE = {
  budget: {
    cover: {
      sheet: "Dashboard",
      eyebrow: "MAKEREADY · BUDGET SPREADSHEET",
      title: "A budget that does the maths for you",
      sub: "Log what you spend. Every total, progress bar and debt-free date updates itself.",
      chips: [
        "Google Sheets",
        "Excel",
        "Debt payoff",
        "Paycheck budget",
        "Sinking funds",
        "Net worth",
      ],
    },
    shots: [
      [
        "Dashboard",
        "01-dashboard",
        "MONTHLY DASHBOARD",
        "Planned vs actual, for every category",
        "Monthly dashboard: planned vs actual for every category with progress bars",
      ],
      [
        "Transactions",
        "02-transactions",
        "TRANSACTIONS",
        "Pick a category. Type the amount. Done.",
        "Transactions log with category dropdowns",
      ],
      [
        "Year",
        "03-year",
        "YEAR AT A GLANCE",
        "Every month side by side",
        "Year at a glance: every category across 12 months",
      ],
      [
        "Bills",
        "04-bills",
        "BILLS & PAYCHECKS",
        "Know which paycheck pays which bill",
        "Paycheck budget and monthly bill tracker",
      ],
      [
        "Debt Payoff",
        "05-debt",
        "DEBT PAYOFF",
        "Snowball or avalanche: see your debt-free date",
        "Debt payoff calculator with snowball and avalanche",
      ],
      [
        "Savings",
        "06-savings",
        "SAVINGS & SINKING FUNDS",
        "How much to save each month, worked out",
        "Savings goals and sinking funds",
      ],
      [
        "Net Worth",
        "07-net-worth",
        "NET WORTH",
        "Watch it grow, month by month",
        "Monthly net worth tracker",
      ],
    ],
  },
  student: {
    cover: {
      sheet: "Today",
      eyebrow: "MAKEREADY · ADHD STUDENT PLANNER",
      title: "Know exactly what to do next",
      sub: "Add your assignments once. The planner sorts them and shows the next tiny step.",
      chips: [
        "Google Sheets",
        "Excel",
        "Assignment tracker",
        "Exam countdown",
        "Focus log",
        "Class progress",
      ],
    },
    shots: [
      [
        "Today",
        "01-today",
        "TODAY",
        "One screen. Most urgent first.",
        "Today: what's next, most urgent first, with a tiny first step",
      ],
      [
        "This Week",
        "02-week",
        "THIS WEEK",
        "Everything due, day by day",
        "Week view of everything due",
      ],
      [
        "Assignments",
        "03-assignments",
        "ASSIGNMENTS",
        "Add it once. It sorts and colours itself.",
        "Assignment tracker with automatic priority",
      ],
      [
        "Classes",
        "04-classes",
        "CLASSES",
        "Progress, next deadline and grades per class",
        "Class progress, next due date and average grade",
      ],
      [
        "Exams",
        "05-exams",
        "EXAMS",
        "A countdown to every exam",
        "Exam countdown",
      ],
      [
        "Focus Log",
        "06-focus",
        "FOCUS LOG",
        "Every study session counts",
        "Focus log: study minutes per day, week and term",
      ],
    ],
  },
};

const png64 = (b) => `data:image/png;base64,${b.toString("base64")}`;

export async function sheetMockups(id) {
  const s = STORE[id];
  const file = path.join(demoDir, SHEETS[id].file);
  const sheets = [s.cover.sheet, ...s.shots.map(([sheet]) => sheet)];
  const pngs = (
    await renderSheets(
      file,
      sheets.map((sheet) => ({ sheet })),
      { scale: 3 },
    )
  ).map(png64);
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 2400, height: 1800 },
  });
  const out = {};
  const { cover } = s;
  out.cover = await compose(
    page,
    `<div style="position:absolute;left:150px;top:190px;width:860px">${label(cover.eyebrow, cover.title, cover.sub)}
      <div style="margin-top:56px;display:flex;flex-wrap:wrap;gap:16px;font-family:Body;font-size:30px;color:#1f1d1a">
        ${cover.chips.map((t) => `<span style="background:#fffdf8;border:2px solid #e2d6c2;border-radius:99px;padding:12px 26px">${t}</span>`).join("")}
      </div>
      <div style="margin-top:56px;display:inline-block;font-family:Mono;font-size:30px;letter-spacing:.14em;color:#fff;background:#2b78c9;border-radius:99px;padding:20px 40px">INSTANT DOWNLOAD · NO SUBSCRIPTION</div>
    </div>
    <div style="position:absolute;left:990px;top:440px">${laptop(pngs[0], 1240)}</div>`,
  );
  s.shots.forEach(
    ([, name, eyebrow, heading], i) =>
      (out[name] = { eyebrow, heading, src: pngs[i + 1] }),
  );
  for (const [name, v] of Object.entries(out)) {
    if (name === "cover") continue;
    out[name] = await compose(
      page,
      `<div style="position:absolute;left:0;right:0;top:110px;text-align:center">${label(v.eyebrow, v.heading, "")}</div>
       <div style="position:absolute;left:50%;top:420px;transform:translateX(-50%)">${laptop(v.src, 1900)}</div>`,
    );
  }
  await browser.close();
  const dir = storeDir(id);
  await mkdir(dir, { recursive: true });
  for (const [name, buf] of Object.entries(out))
    await writeFile(path.join(dir, `${name}.webp`), buf);
  return Object.keys(out);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ids = process.argv.slice(2).filter((a) => STORE[a]);
  for (const id of ids.length ? ids : Object.keys(STORE))
    console.log(id, (await sheetMockups(id)).join(" "));
}
