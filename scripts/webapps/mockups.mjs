/**
 * Store imagery from the REAL app: opens the built planner in Chromium with
 * a demo week loaded, screenshots each screen, and frames them in a laptop.
 * Output → scripts/webapps/out/store/*.webp (2400×1800).
 *
 *   node scripts/webapps/mockups.mjs   (run build.mjs first)
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { APPS, outDir } from "./build.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

export const storeDir = path.join(outDir, "store");
const W = 2400;
const H = 1800;
const TODAY = "2027-01-13"; // a Wednesday, so the week has days either side

/** Gallery shots: [file name, alt text]. cover comes first. */
export const SHOTS = [
  [
    "01-today",
    "Today: time blocks, your top 3, to-dos, mood, water and habits",
  ],
  ["02-week", "Week: one focus, every day's tasks, and a review"],
  ["03-month", "Month: calendar with progress, events and monthly goals"],
  ["04-habits", "Habit tracker: tap a day to tick it, with streaks"],
  ["05-money", "Money: budget by category, spending log and savings goals"],
  ["06-dark", "Light and dark mode"],
];

// ---------- Demo data (same shape as app.js state) ----------
const k = (offset) => {
  const d = new Date(`${TODAY}T12:00:00`);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
let n = 0;
const id = () => `demo${++n}`;
const top = (...items) =>
  [0, 1, 2].map((i) => ({
    t: items[i]?.[0] ?? "",
    done: items[i]?.[1] ?? false,
  }));
const tasks = (...items) =>
  items.map(([t, done = false]) => ({ id: id(), t, done }));

function demoState() {
  const habits = [
    { id: "h1", name: "Drink water", color: "#2b78c9" },
    { id: "h2", name: "Move for 20 minutes", color: "#3e8a67" },
    { id: "h3", name: "Read 10 pages", color: "#9a5bc9" },
    { id: "h4", name: "No phone after 10pm", color: "#d08726" },
  ];
  // Ticks for the first 13 days of January: mostly on, a few misses.
  const misses = { h1: [4], h2: [3, 7, 10], h3: [2, 6], h4: [1, 5, 8, 9] };
  const habitLog = {};
  for (const h of habits) {
    habitLog[h.id] = {};
    for (let d = 1; d <= 13; d++)
      if (!misses[h.id].includes(d))
        habitLog[h.id][`2027-01-${String(d).padStart(2, "0")}`] = true;
  }
  const cats = [
    ["c1", "Groceries", 400],
    ["c2", "Eating out", 120],
    ["c3", "Transport", 150],
    ["c4", "Shopping", 100],
    ["c5", "Fun", 80],
    ["c6", "Bills", 900],
  ];
  const tx = [
    ["2027-01-01", "Salary", "", 3200, "in"],
    ["2027-01-02", "Rent", "c6", 850, "out"],
    ["2027-01-03", "Weekly shop", "c1", 92.4, "out"],
    ["2027-01-05", "Bus pass", "c3", 64, "out"],
    ["2027-01-07", "Dinner with Maya", "c2", 46.5, "out"],
    ["2027-01-09", "Weekly shop", "c1", 88.15, "out"],
    ["2027-01-10", "Cinema", "c5", 24, "out"],
    ["2027-01-11", "Phone bill", "c6", 30, "out"],
    ["2027-01-12", "Running shoes", "c4", 79.99, "out"],
    ["2027-01-12", "Freelance logo", "", 350, "in"],
  ].map(([date, desc, cat, amount, type]) => ({
    id: id(),
    date,
    desc,
    cat,
    amount,
    type,
  }));

  return {
    version: 1,
    settings: {
      name: "Sara",
      weekStart: "mon",
      theme: "light",
      currency: "$",
      lastBackup: `${TODAY}T09:00:00.000Z`,
      welcomed: true,
    },
    days: {
      [k(-2)]: {
        top: top(["Book dentist", true], ["Plan the week", true]),
        tasks: tasks(["Laundry", true], ["Call Mum", true]),
        blocks: {},
        notes: "",
        mood: 3,
        energy: 3,
        water: 6,
        wins: [],
      },
      [k(-1)]: {
        top: top(
          ["Send the proposal", true],
          ["Gym", true],
          ["Reply to Ali", false],
        ),
        tasks: tasks(["Pay phone bill", true]),
        blocks: {},
        notes: "",
        mood: 4,
        energy: 4,
        water: 8,
        wins: [],
      },
      [k(0)]: {
        top: top(
          ["Finish the client deck", true],
          ["30 min run", false],
          ["Call the bank about the card", false],
        ),
        tasks: tasks(
          ["Order birthday gift for Maya", true],
          ["Book train for Friday", false],
          ["Groceries: eggs, spinach, coffee", false],
          ["Email the landlord", false],
        ),
        blocks: {
          7: "Run + shower",
          9: "Deep work: client deck",
          10: "Deep work: client deck",
          12: "Lunch with Jo",
          14: "Team call",
          16: "Admin & email",
          19: "Cook, then read",
        },
        notes: "Ideas for the weekend: farmers market, call Gran.",
        mood: 3,
        energy: 4,
        water: 5,
        wins: [
          { id: id(), t: "Finished the deck a day early" },
          { id: id(), t: "Said no to a meeting I didn't need" },
        ],
      },
      [k(1)]: {
        top: top(["Present the deck"], ["Yoga class"]),
        tasks: tasks(["Pick up parcel"]),
        blocks: {},
        notes: "",
        mood: null,
        energy: null,
        water: 0,
        wins: [],
      },
      [k(2)]: {
        top: top(["Train to Leeds"]),
        tasks: tasks(["Pack bag"], ["Water plants"]),
        blocks: {},
        notes: "",
        mood: null,
        energy: null,
        water: 0,
        wins: [],
      },
      [k(3)]: {
        top: top(["Farmers market"]),
        tasks: [],
        blocks: {},
        notes: "",
        mood: null,
        energy: null,
        water: 0,
        wins: [],
      },
      [k(-9)]: {
        top: top(["New year plan", true]),
        tasks: tasks(["Clear inbox", true]),
        blocks: {},
        notes: "",
        mood: 4,
        energy: 3,
        water: 7,
        wins: [],
      },
      [k(-6)]: {
        top: top(["Tax documents", true], ["Gym", true]),
        tasks: tasks(["Return jacket", false]),
        blocks: {},
        notes: "",
        mood: 3,
        energy: 3,
        water: 6,
        wins: [],
      },
      [k(-5)]: {
        top: top(["Client kickoff", true]),
        tasks: tasks(["Book haircut", true]),
        blocks: {},
        notes: "",
        mood: 4,
        energy: 5,
        water: 8,
        wins: [],
      },
    },
    weeks: {
      [k(-2)]: {
        focus: "Ship the client deck and keep my runs going",
        review: "",
      },
    },
    months: {
      "2027-01": {
        goals:
          "Run 40 km in total\nSave $500\nRead two books\nNo takeaway on weekdays",
      },
    },
    events: {
      "2027-01-15": [{ id: id(), t: "Trip to Leeds" }],
      "2027-01-21": [{ id: id(), t: "Maya's birthday" }],
      "2027-01-28": [{ id: id(), t: "Dentist 10:30" }],
      "2027-01-04": [{ id: id(), t: "Back to work" }],
    },
    habits,
    habitLog,
    goals: [
      {
        id: id(),
        title: "Run a half marathon",
        why: "To prove I can stick with something hard",
        deadline: "2027-05-16",
        milestones: tasks(
          ["Run 5 km without stopping", true],
          ["Sign up for the race", true],
          ["Run 10 km", false],
          ["Run 16 km", false],
        ),
      },
      {
        id: id(),
        title: "Build a 3-month emergency fund",
        why: "So a surprise bill is never a crisis",
        deadline: "2027-09-30",
        milestones: tasks(
          ["Open a separate savings account", true],
          ["Automate $250 a month", false],
          ["Reach $3,000", false],
        ),
      },
    ],
    dump: [],
    money: {
      categories: cats.map(([cid, name, budget]) => ({
        id: cid,
        name,
        budget,
      })),
      tx: { "2027-01": tx },
      savings: [
        { id: id(), name: "Emergency fund", saved: 1250, target: 3000 },
        { id: id(), name: "Lisbon trip", saved: 420, target: 900 },
      ],
    },
  };
}

// ---------- Screenshots ----------
async function capture(browser, file, { width, height, scale, theme, view }) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
    isMobile: width < 600,
    hasTouch: width < 600,
  });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date(`${TODAY}T10:24:00`));
  const state = {
    ...demoState(),
    settings: { ...demoState().settings, theme },
  };
  await page.addInitScript(
    ([key, value]) => localStorage.setItem(key, value),
    ["makeready-life-planner-v1", JSON.stringify(state)],
  );
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);
  const nav = width < 600 ? ".tabbar" : ".side";
  if (view !== "today") {
    const tab = await page.$(`${nav} [data-view=${view}]`);
    if (tab) await tab.click();
    else {
      await page.click(`${nav} [data-view=more]`);
      await page.click(`.more-link[data-view=${view}]`);
    }
  }
  await page.waitForTimeout(150);
  const png = await page.screenshot({ type: "png" });
  await ctx.close();
  return png;
}

// ---------- Frames ----------
const png64 = (b) => `data:image/png;base64,${b.toString("base64")}`;
const BG =
  "background: radial-gradient(120% 100% at 80% 0%, #f7efe2 0%, #efe6d6 45%, #e4d8c4 100%);";

/** Laptop with the screenshot on its screen (16:10 viewport). */
const laptop = (src, w) => {
  const sh = Math.round((w * 900) / 1440);
  return `<div style="width:${w + 56}px">
    <div style="background:#16171b;border-radius:28px 28px 0 0;padding:28px 28px 34px;box-shadow:0 60px 120px rgba(60,40,10,.35)">
      <img src="${src}" style="display:block;width:${w}px;height:${sh}px;border-radius:6px">
    </div>
    <div style="height:30px;margin:0 -90px;background:linear-gradient(#d9d9de,#a9aab2);border-radius:0 0 34px 34px;box-shadow:0 30px 60px rgba(60,40,10,.3)"></div>
  </div>`;
};

const label = (eyebrow, title, sub) => `
  <div style="font-family:Mono;font-size:30px;letter-spacing:.22em;color:#2b78c9">${eyebrow}</div>
  <div style="font-family:Display;font-weight:600;font-size:84px;line-height:1.05;letter-spacing:-.02em;color:#1f1d1a;margin:20px 0 24px">${title}</div>
  ${sub ? `<div style="font-family:Body;font-size:40px;line-height:1.4;color:#5e574d">${sub}</div>` : ""}`;

async function compose(page, html) {
  await page.setContent(
    `<!doctype html><meta charset="utf-8"><style>${await fontCss()} html,body{margin:0}</style>
    <div style="width:${W}px;height:${H}px;${BG}position:relative;overflow:hidden">${html}</div>`,
  );
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  return sharp(png).webp({ quality: 88 }).toBuffer();
}

let fonts;
async function fontCss() {
  if (fonts) return fonts;
  const { readFile } = await import("node:fs/promises");
  const f = async (family, weight, pkg, file) =>
    `@font-face{font-family:${family};font-weight:${weight};src:url(data:font/woff2;base64,${(
      await readFile(
        require.resolve(`@fontsource/${pkg}/files/${pkg}-${file}.woff2`),
      )
    ).toString("base64")})}`;
  fonts = (
    await Promise.all([
      f("Display", 600, "space-grotesk", "latin-600-normal"),
      f("Body", 400, "hanken-grotesk", "latin-400-normal"),
      f("Body", 600, "hanken-grotesk", "latin-600-normal"),
      f("Mono", 500, "jetbrains-mono", "latin-500-normal"),
    ])
  ).join("");
  return fonts;
}

async function main() {
  const file = path.join(outDir, APPS.planner.file);
  const browser = await chromium.launch();
  const desk = (view, theme = "light") =>
    capture(browser, file, { width: 1440, height: 900, scale: 2, theme, view });

  const shots = {
    today: await desk("today"),
    week: await desk("week"),
    month: await desk("month"),
    habits: await desk("habits"),
    money: await desk("money"),
    darkToday: await desk("today", "dark"),
  };
  const s = Object.fromEntries(
    Object.entries(shots).map(([key, b]) => [key, png64(b)]),
  );
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const out = {};

  out.cover = await compose(
    page,
    `<div style="position:absolute;left:150px;top:190px;width:900px">${label(
      "MAKEREADY · LIFE PLANNER",
      "The planner you just open and use",
      "Double-click to open it in your browser.<br>Type, tick, done. Saves automatically.",
    )}
      <div style="margin-top:56px;display:flex;flex-wrap:wrap;gap:16px;font-family:Body;font-size:32px;color:#1f1d1a">
        ${["Daily", "Weekly", "Monthly", "Habits", "Goals", "Budget"].map((t) => `<span style="background:#fffdf8;border:2px solid #e2d6c2;border-radius:99px;padding:12px 28px">${t}</span>`).join("")}
      </div>
      <div style="margin-top:56px;display:inline-block;font-family:Mono;font-size:30px;letter-spacing:.14em;color:#fff;background:#2b78c9;border-radius:99px;padding:20px 40px">NO APP · NO ACCOUNT · WORKS OFFLINE</div>
    </div>
    <div style="position:absolute;left:990px;top:440px">${laptop(s.today, 1240)}</div>`,
  );

  const single = (eyebrow, title, src) => `
    <div style="position:absolute;left:0;right:0;top:110px;text-align:center">${label(eyebrow, title, "")}</div>
    <div style="position:absolute;left:50%;top:420px;transform:translateX(-50%)">${laptop(src, 1900)}</div>`;
  out["01-today"] = await compose(
    page,
    single("TODAY", "Plan your day in two minutes", s.today),
  );
  out["02-week"] = await compose(
    page,
    single("WEEK", "See the whole week at once", s.week),
  );
  out["03-month"] = await compose(
    page,
    single("MONTH", "Your month, with progress on every day", s.month),
  );
  out["04-habits"] = await compose(
    page,
    single("HABITS", "Tap to tick. Watch the streak grow.", s.habits),
  );
  out["05-money"] = await compose(
    page,
    single("MONEY", "Budget and spending that add up for you", s.money),
  );
  out["06-dark"] = await compose(
    page,
    `<div style="position:absolute;left:150px;top:300px;width:620px">${label("LIGHT & DARK", "Easy on the eyes, day or night", "Switch in Settings, or follow your computer.")}</div>
     <div style="position:absolute;left:880px;top:420px">${laptop(s.darkToday, 1340)}</div>`,
  );

  await mkdir(storeDir, { recursive: true });
  for (const [name, buf] of Object.entries(out)) {
    await writeFile(path.join(storeDir, `${name}.webp`), buf);
    console.log(`store/${name}.webp`);
  }
  await browser.close();
}

if (process.argv[1] === new URL(import.meta.url).pathname) await main();
