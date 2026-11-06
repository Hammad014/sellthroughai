/**
 * Focus Planner — Makeready's ADHD-friendly hyperlinked digital planner.
 *
 * Same engine and grid as Clarity, different page set, built to cut
 * overwhelm: one page per day with "just 3 things" and visual time blocks,
 * a brain dump + sort page every month, task breakdowns for scary tasks,
 * routines and a dopamine menu.
 *
 * Editions: dated (a year, Monday or Sunday start) or undated (months with
 * 5 weeks × 7 days, write-your-own dates).
 *
 * Usage: buildFocus({ edition, year, weekStart, theme }) → Promise<{buffer,…}>
 */
import { Ctx, createDoc, THEMES } from "./lib/pdf.mjs";
import {
  CX,
  CR,
  CW,
  CY,
  BODY_Y,
  BODY_B,
  BODY_H,
  GAP,
  pad2,
  monthTabs,
  pillRow,
  header,
  miniMonth,
  blankMini,
} from "./lib/layout.mjs";
import {
  MONTHS,
  MONTHS_SHORT,
  weekdayNames,
  weeksOfYear,
  monthGrid,
  addDays,
  isoKey,
  utc,
  daysInMonth,
  weekdayIndex,
  fmtShort,
} from "./lib/calendar.mjs";

const UNDATED_WEEKS = 5;
const NOTE_PAGES = 20;
const BREAKDOWN_PAGES = 12;
const HABIT_ROWS = 8;

const NAV = [
  { label: "Home", section: "home", target: () => "home" },
  {
    label: "Brain dump",
    section: "dump",
    target: (p) => `dump-${p.month ?? 0}`,
  },
  {
    label: "Habits",
    section: "habits",
    target: (p) => `habit-${p.month ?? 0}`,
  },
  { label: "Routines", section: "routines", target: () => "routines" },
  { label: "Breakdowns", section: "breakdowns", target: () => "breakdowns" },
  { label: "Notes", section: "notes", target: () => "notes" },
];

// ======================================================================
// Page plan
// ======================================================================

function planPages({ edition, year, weekStart }) {
  const pages = [];
  const add = (p) => pages.push(p);

  add({ key: "cover", type: "cover" });
  add({ key: "guide", type: "guide" });
  add({ key: "home", type: "home", section: "home" });
  add({ key: "routines", type: "routines", section: "routines" });
  add({ key: "dopamine", type: "dopamine", section: "routines" });

  const addMonth = (m) => {
    add({ key: `month-${m}`, type: "month", month: m });
    add({ key: `dump-${m}`, type: "dump", month: m, section: "dump" });
    add({ key: `habit-${m}`, type: "habit", month: m, section: "habits" });
  };

  if (edition === "dated") {
    const weeks = weeksOfYear(year, weekStart);
    let lastMonth = -1;
    weeks.forEach((start, i) => {
      const days = Array.from({ length: 7 }, (_, d) => addDays(start, d));
      const inYear = days.filter((d) => d.getUTCFullYear() === year);
      const home = inYear[0].getUTCMonth();
      while (lastMonth < home) addMonth(++lastMonth);
      add({
        key: `week-${i}`,
        type: "week",
        week: i,
        start,
        days,
        month: home,
      });
      for (const d of inYear)
        add({
          key: `day-${isoKey(d)}`,
          type: "day",
          date: d,
          week: i,
          month: d.getUTCMonth(),
        });
    });
    while (lastMonth < 11) addMonth(++lastMonth);
  } else {
    for (let m = 0; m < 12; m++) {
      addMonth(m);
      for (let w = 0; w < UNDATED_WEEKS; w++) {
        add({ key: `week-${m}-${w}`, type: "week", month: m, w });
        for (let d = 0; d < 7; d++)
          add({ key: `day-${m}-${w}-${d}`, type: "day", month: m, w, d });
      }
    }
  }

  add({ key: "breakdowns", type: "breakdowns", section: "breakdowns" });
  for (let n = 1; n <= BREAKDOWN_PAGES; n++)
    add({ key: `breakdown-${n}`, type: "breakdown", n, section: "breakdowns" });
  add({ key: "notes", type: "notes", section: "notes" });
  for (let n = 1; n <= NOTE_PAGES; n++)
    add({
      key: `note-${n}`,
      type: "note",
      n,
      style: n % 2 ? "dots" : "lined",
      section: "notes",
    });
  return pages;
}

// ======================================================================
// Builder
// ======================================================================

export async function buildFocus({
  edition = "dated",
  year = 2027,
  weekStart = "mon",
  theme = "sage",
}) {
  const dated = edition === "dated";
  const t = THEMES[theme];
  const doc = createDoc({
    title: dated
      ? `Focus Planner ${year} (${weekStart === "sun" ? "Sunday" : "Monday"} start, ${t.name})`
      : `Focus Planner — Undated (${t.name})`,
    subject: "ADHD-friendly hyperlinked digital planner by Makeready",
  });
  const c = new Ctx(doc, t);
  const pages = planPages({ edition, year, weekStart });
  const index = new Map(pages.map((p, i) => [p.key, i]));
  const go = (key) => index.get(key);
  const dayNames = weekdayNames(weekStart);
  const yearLabel = dated ? String(year) : "";
  const S = { c, t, go, dated, year, weekStart, dayNames, yearLabel, pages };

  for (let i = 0; i < pages.length; i++) doc.addPage();

  pages.forEach((p, i) => {
    doc.switchToPage(i);
    c.background();
    if (p.type !== "cover") chrome(S, p);
    RENDER[p.type](S, p);
  });

  outline(S, doc);

  const chunks = [];
  doc.on("data", (b) => chunks.push(b));
  const done = new Promise((r) => doc.on("end", r));
  doc.end();
  await done;
  return { buffer: Buffer.concat(chunks), pageCount: pages.length, pages };
}

function outline(S, doc) {
  const { go, pages } = S;
  const root = doc.outline;
  const item = (parent, title, key) =>
    parent.addItem(title, { pageNumber: go(key) });
  item(root, "Home", "home");
  item(root, "How to use", "guide");
  item(root, "Routines", "routines");
  item(root, "Dopamine menu", "dopamine");
  for (let m = 0; m < 12; m++) {
    const mo = item(root, MONTHS[m], `month-${m}`);
    item(mo, "Brain dump", `dump-${m}`);
    item(mo, "Habit tracker", `habit-${m}`);
    pages
      .filter((p) => p.type === "week" && p.month === m)
      .forEach((p) => item(mo, weekTitle(S, p), p.key));
  }
  item(root, "Task breakdowns", "breakdowns");
  item(root, "Notes", "notes");
}

// ======================================================================
// Chrome: brand, top nav, month tabs
// ======================================================================

function chrome(S, p) {
  const { c, t, go } = S;
  c.text("FOCUS", CX, 34, {
    font: "displayBold",
    size: 15,
    spacing: 2.4,
    color: t.ink,
  });
  if (S.yearLabel)
    c.text(S.yearLabel, CX + 70, 35.5, {
      font: "mono",
      size: 12,
      color: t.muted,
    });
  c.link(CX - 8, 20, 140, 44, go("home"));

  pillRow(
    c,
    CR,
    26,
    NAV.map((n) => ({
      label: n.label,
      active: n.section === p.section,
      target: go(n.target(p)),
    })),
  );
  monthTabs(c, go, p.month);
}

function weekTitle(S, p) {
  if (S.dated) return `Week ${p.week + 1}`;
  return `${MONTHS_SHORT[p.month]} · Week ${p.w + 1}`;
}

// ======================================================================
// Small drawing helpers
// ======================================================================

/** Five-pointed star, used to mark "the one thing". */
function star(c, cx, cy, r, color) {
  const d = c.doc;
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + rr * Math.cos(a);
    const y = cy + rr * Math.sin(a);
    if (i) d.lineTo(x, y);
    else d.moveTo(x, y);
  }
  d.closePath().fill(color);
}

/** Wrapped paragraph; returns the y below it. */
function para(
  c,
  str,
  x,
  y,
  w,
  { size = 15, color = c.t.ink, lineGap = 4 } = {},
) {
  c.text(str, x, y, {
    font: "body",
    size,
    width: w,
    lineGap,
    color,
    wrap: true,
  });
  return c.doc.y;
}

/** Faint italic-feeling example prompts at the top of a writing box. */
function hints(c, items, x, y, w) {
  c.text(items.join("  ·  "), x, y, {
    font: "body",
    size: 12.5,
    color: c.t.faint,
    width: w,
    wrap: true,
  });
  return c.doc.y + 6;
}

/** Big round checkbox. */
function bigCheck(c, x, y, r = 12) {
  c.circle(x, y, r, { stroke: c.t.faint, lw: 1.4 });
}

// ======================================================================
// Page renderers
// ======================================================================

const RENDER = {
  cover(S) {
    const { c, t, go, dated, year, weekStart } = S;
    c.label("Makeready  ·  Digital planner", 96, 92, { color: t.muted });
    const dy = dated ? 40 : 80;
    c.text(dated ? String(year) : "Undated", 88, 230 + dy, {
      font: "displayBold",
      size: dated ? 230 : 150,
      spacing: dated ? -6 : -3,
      color: t.ink,
    });
    c.text("Focus Planner", 96, (dated ? 500 : 450) + dy, {
      font: "display",
      size: 54,
      color: t.accent,
    });
    c.text(
      dated
        ? `ADHD-friendly · fully hyperlinked · ${weekStart === "sun" ? "Sunday" : "Monday"} start`
        : "ADHD-friendly · fully hyperlinked · start any month",
      98,
      (dated ? 576 : 526) + dy,
      { font: "body", size: 21, color: t.muted },
    );
    const by = (dated ? 660 : 610) + dy;
    c.rect(96, by, 236, 60, { r: 30, fill: t.accent });
    c.text("Open planner", 128, by + 18, {
      font: "bodySemi",
      size: 19,
      color: t.onAccent,
    });
    c.chevron(300, by + 30, "right", 7, t.onAccent);
    c.link(96, by, 236, 60, go("home"));

    // "Just 3 things" motif — functional: each opens a section.
    const gx = 846;
    const gy = 250;
    const cards = [
      ["Brain dump", "Get it out of your head", "dump-0"],
      [
        "Just 3 things",
        "A day that fits on one page",
        dated ? `day-${isoKey(utc(year, 0, 1))}` : "day-0-0-0",
      ],
      ["Tiny steps", "Break scary tasks down", "breakdowns"],
    ];
    cards.forEach(([title, sub, key], i) => {
      const y = gy + i * 150;
      c.rect(gx, y, 370, 130, {
        r: 22,
        fill: i === 1 ? t.accentSoft : t.surface,
      });
      if (i === 1) star(c, gx + 44, y + 64, 18, t.warm);
      else bigCheck(c, gx + 44, y + 64, 15);
      c.text(title, gx + 80, y + 36, {
        font: "display",
        size: 26,
        color: t.ink,
      });
      c.text(sub, gx + 80, y + 74, { font: "body", size: 16, color: t.muted });
      c.link(gx, y, 370, 130, go(key));
    });
  },

  guide(S) {
    const { c, t, pages } = S;
    header(S, "Start here", "How this planner works");
    const colW = (CW - GAP * 2) / 3;
    const cards = [
      {
        title: "Start tiny",
        body: [
          "You don't have to use every page. Most days, the daily page is enough: pick just 3 things, star the one that matters most, and stop there.",
          "Missed a day, or a month? Skip it. There's no catching up in this planner.",
        ],
      },
      {
        title: "Empty your head",
        body: [
          "When thoughts pile up, open Brain dump and write everything down without sorting. Later, move each item into Do today, Schedule it, Ask for help or Let it go.",
          "Big task feels impossible? Use a Task breakdown page and make the first step tiny.",
        ],
      },
      {
        title: "Tap to get around",
        body: [
          "Tabs on the right open any month. The top bar opens Home, this month's Brain dump and Habits, your Routines, Breakdowns and Notes. Tap a date to open that day.",
          "If tapping draws a line, switch to read-only mode or set your app so only the pencil draws.",
        ],
      },
    ];
    cards.forEach((card, i) => {
      const x = CX + i * (colW + GAP);
      const box = c.card(x, BODY_Y, colW, 400, card.title);
      let y = box.y + 6;
      for (const p of card.body)
        y = para(c, p, box.x, y, box.w, { size: 16.5, lineGap: 5 }) + 16;
    });

    const y = BODY_Y + 400 + GAP;
    const box = c.card(CX, y, CW, BODY_B - y, "What's inside");
    const count = (type) => pages.filter((p) => p.type === type).length;
    const stats = [
      [count("day"), "Daily pages"],
      [count("week"), "Weekly pages"],
      [count("month"), "Monthly calendars"],
      [count("dump"), "Brain dump pages"],
      [count("habit"), "Habit trackers"],
      [count("breakdown"), "Task breakdowns"],
      [2, "Routines + dopamine menu"],
      [count("note"), "Notes pages"],
    ];
    const sw = box.w / 4;
    stats.forEach(([n, label], i) => {
      const sx = box.x + (i % 4) * sw;
      const sy = box.y + 20 + Math.floor(i / 4) * 140;
      c.text(String(n), sx, sy, { font: "display", size: 46, color: t.accent });
      c.text(label, sx + 2, sy + 60, {
        font: "body",
        size: 16,
        color: t.muted,
      });
    });
  },

  home(S) {
    const { c, t, go, dated, year } = S;
    header(S, dated ? `Focus ${year}` : "Focus · Undated", "Home");
    const gridW = 800;
    const cols = 4;
    const cw = (gridW - GAP * (cols - 1)) / cols;
    const ch = (BODY_H - GAP * 2) / 3;
    for (let m = 0; m < 12; m++) {
      const x = CX + (m % cols) * (cw + GAP);
      const y = BODY_Y + Math.floor(m / cols) * (ch + GAP);
      c.rect(x, y, cw, ch, { r: 14, fill: t.surface });
      c.text(MONTHS[m], x + 16, y + 14, {
        font: "display",
        size: 19,
        color: t.ink,
      });
      if (dated)
        miniMonth(S, x + 12, y + 52, cw - 24, ch - 64, year, m, {
          links: false,
          size: 9.5,
        });
      else blankMini(S, x + 12, y + 52, cw - 24, ch - 64);
      c.link(x, y, cw, ch, go(`month-${m}`));
    }

    const lx = CX + gridW + 30;
    const lw = CR - lx;
    c.label("Jump to", lx, BODY_Y);
    const links = [
      ["Brain dump", "dump-0"],
      ["Routines", "routines"],
      ["Dopamine menu", "dopamine"],
      ["Task breakdowns", "breakdowns"],
      ["Habit trackers", "habit-0"],
      ["Notes", "notes"],
      ["How to use", "guide"],
    ];
    links.forEach(([label, key], i) => {
      const y = BODY_Y + 26 + i * 58;
      c.rect(lx, y, lw, 48, { r: 12, fill: t.surface });
      c.text(label, lx + 18, y + 14, {
        font: "bodyMedium",
        size: 16,
        color: t.ink,
      });
      c.chevron(lx + lw - 22, y + 24, "right", 5.5, t.muted);
      c.link(lx, y, lw, 48, go(key));
    });
    const iy = BODY_Y + 26 + links.length * 58 + 4;
    const box = c.card(lx, iy, lw, BODY_B - iy, "A reminder for hard days", {
      fill: t.accentSoft,
    });
    para(
      c,
      "Progress, not perfection. One done thing beats ten planned ones. You can start again at any page.",
      box.x,
      box.y,
      box.w,
      { size: 15.5, lineGap: 5 },
    );
  },

  routines(S) {
    const { c, t } = S;
    header(S, "Build once, repeat", "Routines");
    const cw = (CW - GAP * 2) / 3;
    const cols = [
      ["Morning routine", "3–5 steps you'll actually do"],
      ["Evening routine", "Wind down, set up tomorrow"],
      ["Weekly reset", "Once a week, 20 minutes"],
    ];
    cols.forEach(([title, hint], i) => {
      const x = CX + i * (cw + GAP);
      const b = c.card(x, BODY_Y, cw, BODY_H, title);
      c.text(hint, b.x, b.y - 4, { font: "body", size: 13, color: t.faint });
      c.label("Time", b.x + b.w - 54, b.y + 22, { color: t.faint });
      for (let r = 0; r < 12; r++) {
        const y = b.y + 30 + r * 52;
        bigCheck(c, b.x + 12, y + 26, 10);
        c.line(b.x + 34, y + 36, b.x + b.w - 70, y + 36, t.line, 0.8);
        c.line(b.x + b.w - 54, y + 36, b.x + b.w, y + 36, t.line, 0.8);
      }
    });
  },

  dopamine(S) {
    const { c, t } = S;
    header(S, "When you're stuck or bored", "Dopamine menu");
    c.text(
      "Fill this in on a good day. On a flat day, pick from it instead of reaching for your phone.",
      CX,
      CY + 74,
      { font: "body", size: 14, color: t.muted },
    );
    const cw = (CW - GAP) / 2;
    const ch = (BODY_H - GAP) / 2;
    const menu = [
      [
        "Starters",
        "Quick boosts, 2–5 minutes",
        ["dance to one song", "step outside", "splash cold water"],
      ],
      [
        "Mains",
        "Bigger things that really recharge you",
        ["walk with a podcast", "a class or workout", "cook something new"],
      ],
      [
        "Sides",
        "Pair with boring tasks",
        ["music while cleaning", "work next to a friend", "a fancy drink"],
      ],
      [
        "Desserts",
        "Nice, but easy to overdo: set a timer",
        ["scrolling", "one episode", "a game"],
      ],
    ];
    menu.forEach(([title, sub, examples], i) => {
      const x = CX + (i % 2) * (cw + GAP);
      const y = BODY_Y + 10 + Math.floor(i / 2) * (ch + GAP);
      const b = c.card(x, y, cw, ch - 10, title, {
        fill: i === 3 ? t.warmSoft : t.surface,
      });
      c.text(sub, b.x, b.y - 4, { font: "body", size: 13.5, color: t.muted });
      const hy = hints(
        c,
        examples.map((e) => `e.g. ${e}`),
        b.x,
        b.y + 18,
        b.w,
      );
      c.ruled(b.x, hy, b.w, b.y + b.h - hy, 34);
    });
  },

  month(S, p) {
    const { c, t, go, dated, year, weekStart, dayNames } = S;
    const m = p.month;
    header(S, dated ? `Month · ${year}` : "Month", MONTHS[m], [
      { chevron: "left", target: m > 0 ? go(`month-${m - 1}`) : null },
      { label: "Brain dump", target: go(`dump-${m}`) },
      { label: "Habits", target: go(`habit-${m}`) },
      { chevron: "right", target: m < 11 ? go(`month-${m + 1}`) : null },
    ]);

    const gridW = 820;
    const gutter = 46;
    const cellW = (gridW - gutter) / 7;
    const headH = 30;
    const rows = dated ? monthGrid(year, m, weekStart) : null;
    const nRows = dated ? rows.length : UNDATED_WEEKS;
    const cellH = (BODY_H - headH) / nRows;
    const gx = CX + gutter;
    const gy = BODY_Y + headH;

    dayNames.forEach((name, i) => {
      c.label(name.slice(0, 3), gx + i * cellW + 10, BODY_Y + 6);
      if (name === "Saturday" || name === "Sunday")
        c.rect(gx + i * cellW, gy, cellW, cellH * nRows, { fill: t.surface });
    });
    for (let r = 0; r <= nRows; r++)
      c.line(gx, gy + r * cellH, gx + 7 * cellW, gy + r * cellH, t.line, 1);
    for (let i = 0; i <= 7; i++)
      c.line(gx + i * cellW, gy, gx + i * cellW, gy + nRows * cellH, t.line, 1);

    for (let r = 0; r < nRows; r++) {
      const ry = gy + r * cellH;
      let weekKey = null;
      let weekLabel = "";
      if (dated) {
        const wk = S.pages.find(
          (pg) => pg.type === "week" && isoKey(pg.start) === isoKey(rows[r][0]),
        );
        if (wk) {
          weekKey = wk.key;
          weekLabel = `W${wk.week + 1}`;
        }
      } else {
        weekKey = `week-${m}-${r}`;
        weekLabel = `W${r + 1}`;
      }
      if (weekKey) {
        c.rect(CX, ry + 8, gutter - 10, 30, { r: 8, fill: t.accentSoft });
        const lw = c.width(weekLabel, "monoMedium", 11);
        c.text(weekLabel, CX + (gutter - 10 - lw) / 2, ry + 16, {
          font: "monoMedium",
          size: 11,
          color: t.accent,
        });
        c.link(CX - 4, ry + 4, gutter, 38, go(weekKey));
      }
      for (let i = 0; i < 7; i++) {
        const x = gx + i * cellW;
        if (dated) {
          const d = rows[r][i];
          const inMonth = d.getUTCMonth() === m;
          c.text(String(d.getUTCDate()), x + 10, ry + 9, {
            font: inMonth ? "monoMedium" : "mono",
            size: 14,
            color: inMonth ? t.ink : t.faint,
          });
          if (d.getUTCFullYear() === year)
            c.link(x, ry, 52, 38, go(`day-${isoKey(d)}`));
        } else {
          c.line(x + 10, ry + 30, x + 40, ry + 30, t.faint, 0.8);
          c.link(x, ry, cellW, cellH, go(`day-${m}-${r}-${i}`));
        }
      }
    }

    const sx = CX + gridW + GAP;
    const sw = CR - sx;
    const goal = c.card(sx, BODY_Y, sw, 210, "One big goal this month", {
      fill: t.accentSoft,
    });
    star(c, goal.x + 10, goal.y + 18, 10, t.warm);
    c.ruled(goal.x + 28, goal.y - 4, goal.w - 28, 60, 34);
    c.ruled(goal.x, goal.y + 62, goal.w, goal.h - 66, 34);
    const dy = BODY_Y + 210 + GAP;
    const dates = c.card(sx, dy, sw, 290, "Dates I can't forget");
    c.ruled(dates.x, dates.y - 6, dates.w, dates.h, 32);
    const ry = dy + 290 + GAP;
    const rw = c.card(sx, ry, sw, BODY_B - ry, "When I hit my goal, I'll…", {
      fill: t.warmSoft,
    });
    c.ruled(rw.x, rw.y - 6, rw.w, rw.h, 32);
  },

  dump(S, p) {
    const { c, t, go, dated, year } = S;
    const m = p.month;
    header(S, `${MONTHS[m]}${dated ? ` ${year}` : ""}`, "Brain dump", [
      { chevron: "left", target: m > 0 ? go(`dump-${m - 1}`) : null },
      { label: "Calendar", target: go(`month-${m}`) },
      { chevron: "right", target: m < 11 ? go(`dump-${m + 1}`) : null },
    ]);
    const lw = 560;
    const b = c.card(CX, BODY_Y, lw, BODY_H, "1 · Dump everything here");
    c.text(
      "No order, no judging. Tasks, worries, ideas: just get them out.",
      b.x,
      b.y - 4,
      {
        font: "body",
        size: 13,
        color: t.faint,
      },
    );
    c.dots(b.x - 8, b.y + 18, b.w + 16, b.h - 22, 24);

    const rx = CX + lw + GAP;
    const rw = CR - rx;
    c.label("2 · Then sort it", rx, BODY_Y);
    const bw = (rw - GAP) / 2;
    const bh = (BODY_H - 26 - GAP) / 2;
    const boxes = [
      ["Do today", "Small and urgent", t.accentSoft],
      ["Schedule it", "Give it a day", t.surface],
      ["Ask for help", "Delegate or share", t.surface],
      ["Let it go", "Not mine / not now", t.warmSoft],
    ];
    boxes.forEach(([title, hint, fill], i) => {
      const x = rx + (i % 2) * (bw + GAP);
      const y = BODY_Y + 26 + Math.floor(i / 2) * (bh + GAP);
      const box = c.card(x, y, bw, bh, title, { fill });
      c.text(hint, box.x, box.y - 4, {
        font: "body",
        size: 12.5,
        color: t.faint,
      });
      c.checklist(box.x, box.y + 12, box.w, Math.floor((box.h - 16) / 34), 34);
    });
  },

  habit(S, p) {
    const { c, t, go, dated, year } = S;
    const m = p.month;
    header(S, `${MONTHS[m]}${dated ? ` ${year}` : ""}`, "Habit tracker", [
      { chevron: "left", target: m > 0 ? go(`habit-${m - 1}`) : null },
      { label: "Calendar", target: go(`month-${m}`) },
      { chevron: "right", target: m < 11 ? go(`habit-${m + 1}`) : null },
    ]);
    const n = dated ? daysInMonth(year, m) : 31;
    const nameW = 220;
    const totalW = 64;
    const colW = (CW - nameW - totalW) / 31;
    const headH = 50;
    const footH = 120;
    const rowH = (BODY_H - headH - footH - GAP) / HABIT_ROWS;
    const tx = CX + nameW;
    const ty = BODY_Y + headH;
    const initials = ["S", "M", "T", "W", "T", "F", "S"];

    c.label("Habit (keep it small)", CX, BODY_Y + 18);
    for (let d = 0; d < n; d++) {
      const x = tx + d * colW;
      if (dated) {
        const date = utc(year, m, d + 1);
        const dow = date.getUTCDay();
        c.text(initials[dow], x, BODY_Y + 2, {
          font: "mono",
          size: 10,
          color: t.faint,
          width: colW,
          align: "center",
        });
        if (dow === 0 || dow === 6)
          c.rect(x, ty, colW, rowH * HABIT_ROWS, { fill: t.surface });
        c.link(x, BODY_Y, colW, headH, go(`day-${isoKey(date)}`));
      }
      c.text(String(d + 1), x, BODY_Y + 22, {
        font: "monoMedium",
        size: 11,
        color: t.ink,
        width: colW,
        align: "center",
      });
    }
    c.label("Done", tx + 31 * colW + 10, BODY_Y + 18);

    for (let r = 0; r < HABIT_ROWS; r++) {
      const y = ty + r * rowH;
      c.line(CX, y + rowH, CR, y + rowH, t.line, 0.8);
      c.line(CX, y + rowH - 14, CX + nameW - 24, y + rowH - 14, t.line, 0.6);
      c.line(
        tx + 31 * colW + 12,
        y + rowH - 14,
        CR,
        y + rowH - 14,
        t.line,
        0.6,
      );
      for (let d = 0; d < n; d++)
        c.circle(
          tx + d * colW + colW / 2,
          y + rowH / 2,
          Math.min(11, colW / 2 - 3),
          {
            stroke: t.faint,
            lw: 1,
          },
        );
    }
    c.line(CX, ty, CR, ty, t.line, 1);

    const fy = BODY_B - footH;
    const b = c.card(
      CX,
      fy,
      CW,
      footH,
      "What made it easier this month? (Missed days are fine.)",
    );
    c.ruled(b.x, b.y - 8, b.w, b.h, 30);
  },

  week(S, p) {
    const { c, t, go, dated, year, dayNames } = S;
    const m = p.month;
    let eyebrow;
    let title;
    let prev;
    let next;
    if (dated) {
      eyebrow = `${MONTHS[m]} ${year} · Week ${p.week + 1}`;
      title = `${fmtShort(p.days[0])} – ${fmtShort(p.days[6])}`;
      prev = go(`week-${p.week - 1}`);
      next = go(`week-${p.week + 1}`);
    } else {
      eyebrow = `${MONTHS[m]} · Week ${p.w + 1}`;
      title = "Week of";
      prev =
        p.w > 0
          ? go(`week-${m}-${p.w - 1}`)
          : m > 0
            ? go(`week-${m - 1}-${UNDATED_WEEKS - 1}`)
            : null;
      next =
        p.w < UNDATED_WEEKS - 1
          ? go(`week-${m}-${p.w + 1}`)
          : m < 11
            ? go(`week-${m + 1}-0`)
            : null;
    }
    header(S, eyebrow, title, [
      { chevron: "left", target: prev },
      { label: MONTHS[m], target: go(`month-${m}`) },
      { chevron: "right", target: next },
    ]);
    if (!dated) c.line(CX + 170, CY + 64, CX + 560, CY + 64, t.faint, 1);

    // Left: focus + must/should/could + reset
    const lw = 320;
    const f = c.card(CX, BODY_Y, lw, 130, "This week's one focus", {
      fill: t.accentSoft,
    });
    star(c, f.x + 10, f.y + 22, 10, t.warm);
    c.ruled(f.x + 28, f.y - 4, f.w - 28, f.h, 34);
    const ty = BODY_Y + 130 + GAP;
    const tiers = c.card(CX, ty, lw, 420, "Priorities");
    [
      ["Must", t.accent],
      ["Should", t.ink],
      ["Could", t.muted],
    ].forEach(([label, color], i) => {
      const y = tiers.y + i * 124;
      c.text(label.toUpperCase(), tiers.x, y, {
        font: "monoMedium",
        size: 11,
        spacing: 1.4,
        color,
      });
      c.checklist(tiers.x, y + 4, tiers.w, 3, 34);
    });
    const ry = ty + 420 + GAP;
    const reset = c.card(CX, ry, lw, BODY_B - ry, "Plan next week");
    c.checklist(reset.x, reset.y - 8, reset.w, Math.floor(reset.h / 34), 34);

    // Day boxes 4 × 2 (7 days + habit streak)
    const gx = CX + lw + GAP;
    const gw = CR - gx;
    const bw = (gw - 14 * 3) / 4;
    const bh = (BODY_H - 14) / 2;
    for (let i = 0; i < 8; i++) {
      const x = gx + (i % 4) * (bw + 14);
      const y = BODY_Y + Math.floor(i / 4) * (bh + 14);
      c.rect(x, y, bw, bh, { r: 14, fill: t.surface });
      if (i === 7) {
        c.label("Habit streak", x + 16, y + 16);
        for (let h = 0; h < 5; h++) {
          const hy = y + 56 + h * 62;
          c.line(x + 16, hy, x + bw - 16, hy, t.line, 0.8);
          for (let d = 0; d < 7; d++)
            c.circle(x + 26 + d * ((bw - 52) / 6), hy + 24, 8, {
              stroke: t.faint,
            });
        }
        continue;
      }
      let target = null;
      let faded = false;
      c.label(dayNames[i].slice(0, 3), x + 16, y + 18, { color: t.muted });
      if (dated) {
        const d = p.days[i];
        faded = d.getUTCFullYear() !== year;
        c.text(String(d.getUTCDate()), x + bw - 56, y + 10, {
          font: "display",
          size: 24,
          color: faded ? t.faint : t.ink,
          width: 40,
          align: "right",
        });
        if (!faded) target = go(`day-${isoKey(d)}`);
      } else {
        c.line(x + bw - 64, y + 34, x + bw - 16, y + 34, t.faint, 0.8);
        target = go(`day-${m}-${p.w}-${i}`);
      }
      if (target != null) {
        c.chevron(x + 66, y + 24, "right", 4.5, t.accent);
        c.link(x, y, bw, 52, target);
      }
      c.line(x + 16, y + 52, x + bw - 16, y + 52, t.line, 1);
      star(c, x + 24, y + 74, 7, t.warm);
      c.line(x + 38, y + 84, x + bw - 16, y + 84, t.line, 0.8);
      c.ruled(x + 16, y + 88, bw - 32, bh - 100, 32);
    }
  },

  day(S, p) {
    const { c, t, go, dated, year, dayNames } = S;
    const m = p.month;
    let eyebrow;
    let title;
    let prev;
    let next;
    let weekKey;
    let weekLabel;
    if (dated) {
      const d = p.date;
      eyebrow = `${MONTHS[m]} ${year} · Week ${p.week + 1}`;
      title = `${dayNames[weekdayIndex(d, S.weekStart)]}, ${MONTHS[m]} ${d.getUTCDate()}`;
      prev = go(`day-${isoKey(addDays(d, -1))}`);
      next = go(`day-${isoKey(addDays(d, 1))}`);
      weekKey = `week-${p.week}`;
      weekLabel = `Week ${p.week + 1}`;
    } else {
      eyebrow = `${MONTHS[m]} · Week ${p.w + 1}`;
      title = dayNames[p.d];
      const flat = (mm, ww, dd) => `day-${mm}-${ww}-${dd}`;
      prev =
        p.d > 0
          ? go(flat(m, p.w, p.d - 1))
          : p.w > 0
            ? go(flat(m, p.w - 1, 6))
            : m > 0
              ? go(flat(m - 1, UNDATED_WEEKS - 1, 6))
              : null;
      next =
        p.d < 6
          ? go(flat(m, p.w, p.d + 1))
          : p.w < UNDATED_WEEKS - 1
            ? go(flat(m, p.w + 1, 0))
            : m < 11
              ? go(flat(m + 1, 0, 0))
              : null;
      weekKey = `week-${m}-${p.w}`;
      weekLabel = `Week ${p.w + 1}`;
    }
    header(S, eyebrow, title, [
      { chevron: "left", target: prev },
      { label: weekLabel, target: go(weekKey) },
      { label: MONTHS_SHORT[m], target: go(`month-${m}`) },
      { chevron: "right", target: next },
    ]);
    if (!dated) {
      const tw = c.width(title, "display", 40);
      c.label("Date", CX + tw + 30, CY + 44, { color: t.faint });
      c.line(CX + tw + 78, CY + 58, CX + tw + 330, CY + 58, t.faint, 1);
    }

    // Column 1: visual time blocks
    const c1w = 330;
    const tb = c.card(CX, BODY_Y, c1w, BODY_H, "Time blocks");
    c.text("Colour in what you'll do when", tb.x + 104, tb.y - 26, {
      font: "body",
      size: 11.5,
      color: t.faint,
    });
    const hours = 15; // 7:00 → 21:00
    const rh = (tb.h - 6) / hours;
    for (let i = 0; i < hours; i++) {
      const y = tb.y + i * rh;
      const hr = 7 + i;
      const label = `${hr > 12 ? hr - 12 : hr}${hr >= 12 ? "pm" : "am"}`;
      c.text(label, tb.x, y + rh / 2 - 6, {
        font: "mono",
        size: 10.5,
        color: t.muted,
      });
      c.rect(tb.x + 46, y + 4, tb.w - 46, rh - 8, {
        r: 8,
        stroke: t.line,
        lw: 1,
      });
    }

    // Column 2: just 3 things, brain dump, basics
    const c2x = CX + c1w + GAP;
    const c2w = 440;
    const th = 250;
    const tp = c.card(c2x, BODY_Y, c2w, th, "Just 3 things", {
      fill: t.accentSoft,
    });
    c.label("Mins", tp.x + tp.w - 40, tp.y - 26, { color: t.faint });
    for (let i = 0; i < 3; i++) {
      const y = tp.y + 8 + i * 58;
      if (i === 0) star(c, tp.x + 14, y + 18, 13, t.warm);
      else bigCheck(c, tp.x + 14, y + 18, 12);
      c.line(tp.x + 40, y + 34, tp.x + tp.w - 60, y + 34, t.line, 1);
      c.line(tp.x + tp.w - 44, y + 34, tp.x + tp.w, y + 34, t.line, 1);
    }
    // The star is drawn: the embedded fonts don't include a ★ glyph.
    star(c, tp.x + 6, tp.y + tp.h - 17, 6, t.warm);
    c.text("= if I only do one thing", tp.x + 16, tp.y + tp.h - 24, {
      font: "body",
      size: 12,
      color: t.muted,
    });

    const dy = BODY_Y + th + GAP;
    const dh = 330;
    const dump = c.card(c2x, dy, c2w, dh, "Brain dump");
    c.dots(dump.x - 8, dump.y - 10, dump.w + 16, dump.h + 6, 22);

    const by = dy + dh + GAP;
    const basics = c.card(c2x, by, c2w, BODY_B - by, "Basics");
    const groups = [
      ["Water", 6, "circle"],
      ["Meals", 3, "box"],
      ["Move", 1, "box"],
      ["Outside", 1, "box"],
    ];
    let gx = basics.x;
    groups.forEach(([label, n, shape]) => {
      c.text(label, gx, basics.y + 2, {
        font: "bodyMedium",
        size: 13,
        color: t.muted,
      });
      for (let k = 0; k < n; k++) {
        const x = gx + k * 22;
        if (shape === "circle")
          c.circle(x + 8, basics.y + 40, 8, { stroke: t.faint });
        else
          c.rect(x, basics.y + 32, 16, 16, { r: 4, stroke: t.faint, lw: 1.1 });
      }
      gx += Math.max(70, n * 22 + 24);
    });

    // Column 3: energy + mood, wins, tomorrow
    const c3x = c2x + c2w + GAP;
    const c3w = CR - c3x;
    const eh = 170;
    const en = c.card(c3x, BODY_Y, c3w, eh, "Energy");
    const cellW = (en.w - 20) / 5;
    for (let i = 0; i < 5; i++)
      c.rect(en.x + i * cellW, en.y + 4, cellW - 6, 30, {
        r: 6,
        stroke: t.faint,
        lw: 1.1,
      });
    c.text("low", en.x, en.y + 40, { font: "body", size: 11, color: t.faint });
    c.text("high", en.x + en.w - 46, en.y + 40, {
      font: "body",
      size: 11,
      color: t.faint,
    });
    c.label("Mood", en.x, en.y + 66);
    for (let i = 0; i < 5; i++)
      c.circle(en.x + 12 + i * 34, en.y + 100, 11, { stroke: t.faint });

    const wy = BODY_Y + eh + GAP;
    const wh = 330;
    const wins = c.card(c3x, wy, c3w, wh, "Wins today", { fill: t.warmSoft });
    c.text("Big or tiny, they all count.", wins.x, wins.y - 4, {
      font: "body",
      size: 12.5,
      color: t.muted,
    });
    c.ruled(wins.x, wins.y + 14, wins.w, wins.h - 18, 34);

    const ty = wy + wh + GAP;
    const tm = c.card(c3x, ty, c3w, BODY_B - ty, "Tomorrow, first thing");
    c.ruled(tm.x, tm.y - 6, tm.w, tm.h, 34);
  },

  breakdowns(S) {
    const { c, t, go } = S;
    header(S, "Make big tasks smaller", "Task breakdowns");
    const cw = (CW - GAP) / 2;
    const ch = (BODY_H - GAP * 5) / 6;
    for (let n = 1; n <= BREAKDOWN_PAGES; n++) {
      const i = n - 1;
      const x = CX + (i % 2) * (cw + GAP);
      const y = BODY_Y + Math.floor(i / 2) * (ch + GAP);
      c.rect(x, y, cw, ch, { r: 14, fill: t.surface });
      c.text(pad2(n), x + 20, y + ch / 2 - 9, {
        font: "monoMedium",
        size: 14,
        color: t.accent,
      });
      c.line(
        x + 60,
        y + ch / 2 + 10,
        x + cw - 140,
        y + ch / 2 + 10,
        t.line,
        0.8,
      );
      const bx = x + cw - 116;
      const by = y + ch / 2 - 20;
      c.rect(bx, by, 96, 40, { r: 20, fill: t.accent });
      c.text("Open", bx + 22, by + 11, {
        font: "bodySemi",
        size: 14,
        color: t.onAccent,
      });
      c.chevron(bx + 72, by + 20, "right", 5, t.onAccent);
      c.link(bx, by, 96, 40, go(`breakdown-${n}`));
      c.link(x, y, 60, ch, go(`breakdown-${n}`));
    }
  },

  breakdown(S, p) {
    const { c, t, go } = S;
    header(S, "Task breakdown", `Breakdown ${pad2(p.n)}`, [
      { chevron: "left", target: p.n > 1 ? go(`breakdown-${p.n - 1}`) : null },
      { label: "All breakdowns", target: go("breakdowns") },
      {
        chevron: "right",
        target: p.n < BREAKDOWN_PAGES ? go(`breakdown-${p.n + 1}`) : null,
      },
    ]);
    const lw = 480;
    let y = BODY_Y;
    for (const [title, h] of [
      ["The big, scary task", 130],
      ["Why it matters to me", 150],
      ["Done looks like…", 150],
    ]) {
      const b = c.card(CX, y, lw, h, title);
      c.ruled(b.x, b.y - 6, b.w, b.h, 34);
      y += h + GAP;
    }
    const half = (lw - GAP) / 2;
    ["Deadline", "Reward when done"].forEach((title, i) => {
      const b = c.card(CX + i * (half + GAP), y, half, BODY_B - y, title, {
        fill: i ? t.warmSoft : t.surface,
      });
      c.ruled(b.x, b.y, b.w, b.h - 10, 38);
    });

    const rx = CX + lw + GAP;
    const rw = CR - rx;
    const fh = 130;
    const first = c.card(
      rx,
      BODY_Y,
      rw,
      fh,
      "The first step (make it tiny: 5 minutes or less)",
      {
        fill: t.accentSoft,
      },
    );
    star(c, first.x + 12, first.y + 22, 12, t.warm);
    c.ruled(first.x + 34, first.y - 4, first.w - 34, first.h, 36);
    const sy = BODY_Y + fh + GAP;
    const steps = c.card(rx, sy, rw, BODY_B - sy, "Then the next tiny steps");
    c.label("Mins", steps.x + steps.w - 40, steps.y - 26, { color: t.faint });
    const rows = Math.floor((steps.h - 4) / 42);
    for (let i = 0; i < rows; i++) {
      const yy = steps.y + i * 42;
      c.text(String(i + 2), steps.x, yy + 14, {
        font: "mono",
        size: 11,
        color: t.faint,
      });
      bigCheck(c, steps.x + 34, yy + 22, 10);
      c.line(
        steps.x + 54,
        yy + 34,
        steps.x + steps.w - 60,
        yy + 34,
        t.line,
        0.8,
      );
      c.line(
        steps.x + steps.w - 44,
        yy + 34,
        steps.x + steps.w,
        yy + 34,
        t.line,
        0.8,
      );
    }
  },

  notes(S) {
    const { c, t, go } = S;
    header(S, "Notes index", "Notes");
    const per = NOTE_PAGES / 2;
    const cw = (CW - GAP * 2) / 2;
    const rh = BODY_H / per;
    for (let n = 1; n <= NOTE_PAGES; n++) {
      const i = n - 1;
      const x = CX + Math.floor(i / per) * (cw + GAP * 2);
      const y = BODY_Y + (i % per) * rh;
      c.text(pad2(n), x, y + rh / 2 - 8, {
        font: "monoMedium",
        size: 13,
        color: t.accent,
      });
      c.line(x + 40, y + rh - 18, x + cw - 150, y + rh - 18, t.line, 0.8);
      c.text(n % 2 ? "Dot grid" : "Lined", x + cw - 136, y + rh / 2 - 7, {
        font: "body",
        size: 12.5,
        color: t.faint,
      });
      const bx = x + cw - 52;
      c.rect(bx, y + rh / 2 - 18, 44, 36, { r: 18, fill: t.surface });
      c.chevron(bx + 22, y + rh / 2, "right", 5, t.accent);
      c.link(bx - 4, y + rh / 2 - 22, 52, 44, go(`note-${n}`));
    }
  },

  note(S, p) {
    const { c, t, go } = S;
    header(
      S,
      `Note ${pad2(p.n)} · ${p.style === "dots" ? "Dot grid" : "Lined"}`,
      "",
      [
        { chevron: "left", target: p.n > 1 ? go(`note-${p.n - 1}`) : null },
        { label: "All notes", target: go("notes") },
        {
          chevron: "right",
          target: p.n < NOTE_PAGES ? go(`note-${p.n + 1}`) : null,
        },
      ],
    );
    c.label("Topic", CX, CY + 46, { color: t.faint });
    c.line(CX + 60, CY + 62, CX + 640, CY + 62, t.faint, 1);
    c.rect(CX, BODY_Y, CW, BODY_H, { r: 14, fill: t.surface });
    if (p.style === "dots")
      c.dots(CX + 10, BODY_Y + 10, CW - 20, BODY_H - 20, 24);
    else c.ruled(CX + 28, BODY_Y + 8, CW - 56, BODY_H - 30, 36);
  },
};
