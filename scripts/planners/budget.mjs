/**
 * Budget Planner — Makeready's hyperlinked digital money planner.
 *
 * Same engine and grid as Clarity and Focus. Every month has a budget,
 * bill tracker, two spending logs, a no-spend challenge and a review; the
 * year has an overview, savings goals, debt payoff, subscriptions, sinking
 * funds and a net worth tracker.
 *
 * Editions: dated (a year — real dates on the no-spend calendars) or undated
 * (month names only, write your own year).
 *
 * Usage: buildBudget({ edition, year, weekStart, theme }) → Promise<{buffer,…}>
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
  ratingRow,
} from "./lib/layout.mjs";
import {
  MONTHS,
  MONTHS_SHORT,
  weekdayNames,
  monthGrid,
} from "./lib/calendar.mjs";

const SAVINGS_GOALS = 6;
const DEBTS = 4;
const NOTE_PAGES = 10;

const NAV = [
  { label: "Home", section: "home", target: () => "home" },
  { label: "Year", section: "year", target: () => "year" },
  { label: "Savings", section: "savings", target: () => "savings" },
  { label: "Debt", section: "debt", target: () => "debt" },
  { label: "Subscriptions", section: "subs", target: () => "subs" },
  { label: "Notes", section: "notes", target: () => "notes" },
];

/** The pages every month gets, in order (key prefix, label). */
const MONTH_PAGES = [
  ["month", "Budget"],
  ["bills", "Bills"],
  ["spend1", "Spending"],
  ["spend2", "Spending 2"],
  ["nospend", "No-spend"],
  ["review", "Review"],
];

// ======================================================================
// Page plan
// ======================================================================

function planPages() {
  const pages = [];
  const add = (p) => pages.push(p);
  add({ key: "cover", type: "cover" });
  add({ key: "guide", type: "guide" });
  add({ key: "home", type: "home", section: "home" });
  add({ key: "year", type: "year", section: "year" });
  add({ key: "networth", type: "networth", section: "year" });
  add({ key: "sinking", type: "sinking", section: "savings" });
  add({ key: "savings", type: "savings", section: "savings" });
  for (let n = 1; n <= SAVINGS_GOALS; n++)
    add({ key: `saving-${n}`, type: "saving", n, section: "savings" });
  add({ key: "debt", type: "debt", section: "debt" });
  for (let n = 1; n <= DEBTS; n++)
    add({ key: `debt-${n}`, type: "debtOne", n, section: "debt" });
  add({ key: "subs", type: "subs", section: "subs" });
  for (let m = 0; m < 12; m++)
    for (const [prefix] of MONTH_PAGES)
      add({ key: `${prefix}-${m}`, type: prefix, month: m });
  add({ key: "notes", type: "notes", section: "notes" });
  for (let n = 1; n <= NOTE_PAGES; n++)
    add({
      key: `note-${n}`,
      type: "note",
      n,
      style: n % 2 ? "lined" : "dots",
      section: "notes",
    });
  return pages;
}

// ======================================================================
// Builder
// ======================================================================

export async function buildBudget({
  edition = "dated",
  year = 2027,
  weekStart = "mon",
  theme = "linen",
}) {
  const dated = edition === "dated";
  const t = THEMES[theme];
  const doc = createDoc({
    title: dated
      ? `Budget Planner ${year} (${t.name})`
      : `Budget Planner — Undated (${t.name})`,
    subject: "Hyperlinked digital budget planner by Makeready",
  });
  const c = new Ctx(doc, t);
  const pages = planPages();
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

  const root = doc.outline;
  const item = (parent, title, key) =>
    parent.addItem(title, { pageNumber: go(key) });
  item(root, "Home", "home");
  item(root, "How to use", "guide");
  item(root, "Year at a glance", "year");
  item(root, "Net worth", "networth");
  item(root, "Savings goals", "savings");
  item(root, "Sinking funds", "sinking");
  item(root, "Debt payoff", "debt");
  item(root, "Subscriptions", "subs");
  for (let m = 0; m < 12; m++) {
    const mo = item(root, MONTHS[m], `month-${m}`);
    for (const [prefix, label] of MONTH_PAGES.slice(1))
      item(mo, label, `${prefix}-${m}`);
  }
  item(root, "Notes", "notes");

  const chunks = [];
  doc.on("data", (b) => chunks.push(b));
  const done = new Promise((r) => doc.on("end", r));
  doc.end();
  await done;
  return { buffer: Buffer.concat(chunks), pageCount: pages.length, pages };
}

// ======================================================================
// Chrome + shared bits
// ======================================================================

function chrome(S, p) {
  const { c, t, go } = S;
  c.text("BUDGET", CX, 34, {
    font: "displayBold",
    size: 15,
    spacing: 2.4,
    color: t.ink,
  });
  if (S.yearLabel)
    c.text(S.yearLabel, CX + 84, 35.5, {
      font: "mono",
      size: 12,
      color: t.muted,
    });
  c.link(CX - 8, 20, 150, 44, go("home"));
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

/** Header for a month page: month name + links to that month's pages. */
function monthHeader(S, p, title) {
  const { go, dated, year } = S;
  const m = p.month;
  const prefix = p.key.split("-")[0];
  header(S, `${MONTHS[m]}${dated ? ` ${year}` : ""}`, title, [
    { chevron: "left", target: m > 0 ? go(`${prefix}-${m - 1}`) : null },
    ...MONTH_PAGES.filter(([k]) => k !== "spend2").map(([k, label]) => ({
      label,
      active: k === prefix || (k === "spend1" && prefix === "spend2"),
      target: go(`${k}-${m}`),
    })),
    { chevron: "right", target: m < 11 ? go(`${prefix}-${m + 1}`) : null },
  ]);
}

/**
 * Write-in table inside a box. cols: [{ label, w (fraction), align }].
 * Draws a header row and `rows` ruled rows; returns the row height.
 */
function table(c, box, cols, rows, { headH = 26, firstCheck = false } = {}) {
  const { t } = c;
  const total = cols.reduce((a, col) => a + col.w, 0);
  const xs = [];
  let x = box.x;
  for (const col of cols) {
    xs.push(x);
    x += (col.w / total) * box.w;
  }
  cols.forEach((col, i) =>
    c.label(col.label, xs[i] + (i ? 8 : 0), box.y - 4, { color: t.muted }),
  );
  const rh = (box.h - headH) / rows;
  const y0 = box.y + headH - 8;
  c.line(box.x, y0, box.x + box.w, y0, t.line, 1.2);
  for (let r = 1; r <= rows; r++)
    c.line(box.x, y0 + r * rh, box.x + box.w, y0 + r * rh, t.line, 0.8);
  for (let i = 1; i < cols.length; i++)
    c.line(xs[i], y0, xs[i], y0 + rows * rh, t.line, 0.6);
  if (firstCheck)
    for (let r = 0; r < rows; r++)
      c.checkbox(box.x + 6, y0 + r * rh + rh / 2 - 7);
  return rh;
}

/** Big labelled amount box (e.g. "Money in"). */
function amountBox(c, x, y, w, h, label, fill) {
  c.rect(x, y, w, h, { r: 12, fill });
  c.label(label, x + 16, y + 14, { color: c.t.muted });
  c.text("$", x + 16, y + h - 44, {
    font: "display",
    size: 24,
    color: c.t.faint,
  });
  c.line(x + 40, y + h - 18, x + w - 16, y + h - 18, c.t.line, 1);
}

/** Row of segments to shade in as progress grows. */
function progressBar(c, x, y, w, n = 10, h = 18) {
  const sw = (w - (n - 1) * 4) / n;
  for (let i = 0; i < n; i++)
    c.rect(x + i * (sw + 4), y, sw, h, { r: 4, stroke: c.t.faint, lw: 1 });
}

// ======================================================================
// Page renderers
// ======================================================================

const RENDER = {
  cover(S) {
    const { c, t, go, dated, year } = S;
    c.label("Makeready  ·  Digital planner", 96, 92, { color: t.muted });
    const dy = dated ? 40 : 80;
    c.text(dated ? String(year) : "Undated", 88, 230 + dy, {
      font: "displayBold",
      size: dated ? 230 : 150,
      spacing: dated ? -6 : -3,
      color: t.ink,
    });
    c.text("Budget Planner", 96, (dated ? 500 : 450) + dy, {
      font: "display",
      size: 54,
      color: t.accent,
    });
    c.text(
      "Budgets, bills, savings & debt · fully hyperlinked",
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

    // Summary motif: money in / out / left — opens January's budget.
    const gx = 846;
    const gy = 250;
    [
      ["Money in", t.surface],
      ["Money out", t.surface],
      ["Left over", t.warmSoft],
    ].forEach(([label, fill], i) => {
      const y = gy + i * 150;
      c.rect(gx, y, 370, 130, { r: 22, fill });
      c.text(label, gx + 30, y + 28, {
        font: "display",
        size: 24,
        color: t.ink,
      });
      c.text("$", gx + 30, y + 72, {
        font: "display",
        size: 30,
        color: i === 2 ? t.warm : t.faint,
      });
      c.line(gx + 60, y + 102, gx + 340, y + 102, t.line, 1.2);
      c.link(gx, y, 370, 130, go("month-0"));
    });
  },

  guide(S) {
    const { c, t, pages } = S;
    header(S, "Start here", "How this planner works");
    const colW = (CW - GAP * 2) / 3;
    const cards = [
      {
        title: "Each month",
        body: [
          "Start on the Budget page: write what's coming in, your bills, and a budget for each spending category. Log what you spend on the Spending pages as you go.",
          "At the end of the month, fill in Spent and Left, then the Review page.",
        ],
      },
      {
        title: "Bigger goals",
        body: [
          "Savings goals: shade a box every time you put money aside. Debt payoff: log each payment and watch the balance drop.",
          "Sinking funds spread big yearly costs (car, gifts, holidays) into small monthly amounts.",
        ],
      },
      {
        title: "Tap to get around",
        body: [
          "Tabs on the right open each month's budget; the pills under the title switch between that month's pages. The top bar opens your Year, Savings, Debt, Subscriptions and Notes.",
          "If tapping draws a line, switch to read-only mode or set your app so only the pencil draws.",
        ],
      },
    ];
    cards.forEach((card, i) => {
      const x = CX + i * (colW + GAP);
      const box = c.card(x, BODY_Y, colW, 400, card.title);
      let y = box.y + 6;
      for (const para of card.body) {
        c.text(para, box.x, y, {
          font: "body",
          size: 16.5,
          width: box.w,
          lineGap: 5,
          color: t.ink,
          wrap: true,
        });
        y = c.doc.y + 16;
      }
    });
    const y = BODY_Y + 400 + GAP;
    const box = c.card(CX, y, CW, BODY_B - y, "What's inside");
    const count = (type) => pages.filter((p) => p.type === type).length;
    const stats = [
      [count("month"), "Monthly budgets"],
      [count("bills"), "Bill trackers"],
      [count("spend1") + count("spend2"), "Spending logs"],
      [count("nospend"), "No-spend challenges"],
      [count("saving"), "Savings goal trackers"],
      [count("debtOne"), "Debt payoff trackers"],
      [count("review"), "Monthly reviews"],
      [3, "Subscriptions, sinking funds & net worth"],
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
        width: sw - 20,
        wrap: true,
      });
    });
  },

  home(S) {
    const { c, t, go, dated, year } = S;
    header(S, dated ? `Budget ${year}` : "Budget · Undated", "Home");
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
      c.link(x, y, cw, 50, go(`month-${m}`));
      // Quick links to the month's pages.
      MONTH_PAGES.filter(([k]) => k !== "spend2").forEach(([k, label], i) => {
        const ly = y + 52 + i * ((ch - 64) / 5);
        c.text(label, x + 16, ly, { font: "body", size: 13, color: t.muted });
        c.chevron(x + cw - 22, ly + 8, "right", 4, t.faint);
        c.link(x + 8, ly - 6, cw - 16, (ch - 64) / 5, go(`${k}-${m}`));
      });
    }
    const lx = CX + gridW + 30;
    const lw = CR - lx;
    c.label("Jump to", lx, BODY_Y);
    const links = [
      ["Year at a glance", "year"],
      ["Net worth", "networth"],
      ["Savings goals", "savings"],
      ["Sinking funds", "sinking"],
      ["Debt payoff", "debt"],
      ["Subscriptions", "subs"],
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
    const box = c.card(lx, iy, lw, BODY_B - iy, "This year I'm saving for", {
      fill: t.warmSoft,
    });
    c.ruled(box.x, box.y - 6, box.w, box.h, 32);
  },

  year(S) {
    const { c, t, go, dated, year } = S;
    header(
      S,
      "The big picture",
      dated ? `${year} at a glance` : "Year at a glance",
    );
    const tw = 800;
    const b = c.card(CX, BODY_Y, tw, BODY_H, "");
    const rh = table(
      c,
      { x: b.x, y: b.y, w: b.w, h: b.h - 8 },
      [
        { label: "Month", w: 1.3 },
        { label: "Income", w: 1 },
        { label: "Expenses", w: 1 },
        { label: "Saved", w: 1 },
        { label: "Debt paid", w: 1 },
        { label: "Left", w: 1 },
      ],
      13,
    );
    for (let m = 0; m < 12; m++) {
      const y = b.y + 18 + m * rh;
      c.text(MONTHS[m], b.x, y + rh / 2 - 8, {
        font: "bodyMedium",
        size: 14,
        color: t.ink,
      });
      c.link(b.x, y, 140, rh, go(`month-${m}`));
    }
    c.text("Total", b.x, b.y + 18 + 12 * rh + rh / 2 - 8, {
      font: "bodySemi",
      size: 14,
      color: t.accent,
    });
    const rx = CX + tw + GAP;
    const rw = CR - rx;
    const g = c.card(rx, BODY_Y, rw, 420, "Money goals this year", {
      fill: t.accentSoft,
    });
    c.checklist(g.x, g.y - 8, g.w, 10, 36);
    const ny = BODY_Y + 420 + GAP;
    const n = c.card(rx, ny, rw, BODY_B - ny, "Notes");
    c.ruled(n.x, n.y - 6, n.w, n.h, 32);
  },

  networth(S) {
    const { c, t } = S;
    header(S, "Track it monthly", "Net worth");
    const lw = 720;
    const b = c.card(CX, BODY_Y, lw, BODY_H, "");
    const rh = table(
      c,
      { x: b.x, y: b.y, w: b.w, h: b.h - 8 },
      [
        { label: "Month", w: 1.2 },
        { label: "What I own", w: 1 },
        { label: "What I owe", w: 1 },
        { label: "Net worth", w: 1 },
      ],
      12,
    );
    for (let m = 0; m < 12; m++)
      c.text(MONTHS[m], b.x, b.y + 18 + m * rh + rh / 2 - 8, {
        font: "bodyMedium",
        size: 14,
        color: t.ink,
      });
    const rx = CX + lw + GAP;
    const rw = CR - rx;
    const a = c.card(
      rx,
      BODY_Y,
      rw,
      (BODY_H - GAP) / 2,
      "Assets (cash, savings, investments…)",
    );
    c.ruled(a.x, a.y - 6, a.w, a.h, 32);
    const dy = BODY_Y + (BODY_H - GAP) / 2 + GAP;
    const d = c.card(rx, dy, rw, BODY_B - dy, "Debts (cards, loans…)");
    c.ruled(d.x, d.y - 6, d.w, d.h, 32);
  },

  sinking(S) {
    const { c, t } = S;
    header(S, "Save a little for big costs", "Sinking funds");
    const b = c.card(CX, BODY_Y, CW, BODY_H - 120, "");
    const cols = [
      { label: "Fund", w: 3 },
      { label: "Goal", w: 1.6 },
      { label: "Per month", w: 1.6 },
      ...MONTHS_SHORT.map((m) => ({ label: m, w: 0.75 })),
      { label: "Saved", w: 1.6 },
    ];
    const rh = table(c, { x: b.x, y: b.y, w: b.w, h: b.h - 8 }, cols, 10);
    const total = cols.reduce((a, col) => a + col.w, 0);
    const start = ((3 + 1.6 + 1.6) / total) * b.w;
    const mw = (0.75 / total) * b.w;
    for (let r = 0; r < 10; r++)
      for (let m = 0; m < 12; m++)
        c.circle(b.x + start + m * mw + mw / 2, b.y + 18 + r * rh + rh / 2, 8, {
          stroke: t.faint,
        });
    const hy = BODY_Y + BODY_H - 120 + GAP;
    const h = c.card(CX, hy, CW, BODY_B - hy, "Ideas", { fill: t.warmSoft });
    c.text(
      "Car repairs · Christmas & birthdays · Holidays · Insurance · Annual subscriptions · Pet costs · Back to school · Home repairs",
      h.x,
      h.y,
      { font: "body", size: 14, color: t.muted, width: h.w, wrap: true },
    );
  },

  savings(S) {
    const { c, t, go } = S;
    header(S, "Watch them grow", "Savings goals");
    const cw = (CW - GAP * 2) / 3;
    const ch = (BODY_H - GAP) / 2;
    for (let n = 1; n <= SAVINGS_GOALS; n++) {
      const i = n - 1;
      const x = CX + (i % 3) * (cw + GAP);
      const y = BODY_Y + Math.floor(i / 3) * (ch + GAP);
      const b = c.card(x, y, cw, ch, `Goal ${pad2(n)}`);
      c.line(b.x, b.y + 36, b.x + b.w, b.y + 36, t.line, 1);
      c.label("Target", b.x, b.y + 62, { color: t.faint });
      c.line(b.x + 70, b.y + 76, b.x + b.w / 2 - 10, b.y + 76, t.line, 0.8);
      c.label("By", b.x + b.w / 2, b.y + 62, { color: t.faint });
      c.line(b.x + b.w / 2 + 30, b.y + 76, b.x + b.w, b.y + 76, t.line, 0.8);
      progressBar(c, b.x, b.y + 110, b.w);
      c.text("Shade a segment for every 10% saved", b.x, b.y + 138, {
        font: "body",
        size: 12,
        color: t.faint,
      });
      const bx = b.x + b.w - 96;
      const by = y + ch - 60;
      c.rect(bx, by, 96, 40, { r: 20, fill: t.accent });
      c.text("Open", bx + 22, by + 11, {
        font: "bodySemi",
        size: 14,
        color: t.onAccent,
      });
      c.chevron(bx + 72, by + 20, "right", 5, t.onAccent);
      c.link(bx, by, 96, 40, go(`saving-${n}`));
      c.link(x, y, cw, 44, go(`saving-${n}`));
    }
  },

  saving(S, p) {
    const { c, t, go } = S;
    header(S, "Savings goal", `Goal ${pad2(p.n)}`, [
      { chevron: "left", target: p.n > 1 ? go(`saving-${p.n - 1}`) : null },
      { label: "All goals", target: go("savings") },
      {
        chevron: "right",
        target: p.n < SAVINGS_GOALS ? go(`saving-${p.n + 1}`) : null,
      },
    ]);
    const lw = 420;
    let y = BODY_Y;
    for (const [title, h] of [
      ["I'm saving for", 120],
      ["Target amount", 100],
      ["By (date)", 100],
      ["Why it matters", 150],
    ]) {
      const b = c.card(CX, y, lw, h, title);
      c.ruled(b.x, b.y - 6, b.w, b.h, 34);
      y += h + GAP;
    }
    const lg = c.card(CX, y, lw, BODY_B - y, "Deposits");
    table(
      c,
      lg,
      [
        { label: "Date", w: 1 },
        { label: "Amount", w: 1 },
        { label: "Total", w: 1 },
      ],
      Math.floor((lg.h - 26) / 30),
    );

    const rx = CX + lw + GAP;
    const rw = CR - rx;
    const g = c.card(rx, BODY_Y, rw, BODY_H, "Shade a box each time you save", {
      fill: t.accentSoft,
    });
    c.label("Each box =", g.x, g.y + 2, { color: t.muted });
    c.line(g.x + 100, g.y + 16, g.x + 260, g.y + 16, t.line, 1);
    const gy = g.y + 40;
    const size = Math.min((g.w - 9 * 8) / 10, (g.h - 50 - 9 * 8) / 10);
    const ox = g.x + (g.w - (size * 10 + 72)) / 2;
    for (let r = 0; r < 10; r++)
      for (let k = 0; k < 10; k++) {
        const bx = ox + k * (size + 8);
        const by = gy + r * (size + 8);
        c.rect(bx, by, size, size, { r: 8, stroke: t.faint, lw: 1 });
        c.text(String(r * 10 + k + 1), bx, by + size / 2 - 6, {
          font: "mono",
          size: 10,
          color: t.faint,
          width: size,
          align: "center",
        });
      }
  },

  debt(S) {
    const { c, t, go } = S;
    header(S, "Pay it down, one by one", "Debt payoff");
    const b = c.card(CX, BODY_Y, CW, 430, "All my debts");
    table(
      c,
      { x: b.x, y: b.y, w: b.w, h: b.h - 8 },
      [
        { label: "Order", w: 0.7 },
        { label: "Debt", w: 3 },
        { label: "Balance", w: 1.4 },
        { label: "Interest %", w: 1.2 },
        { label: "Min payment", w: 1.4 },
        { label: "Due day", w: 1 },
      ],
      9,
    );
    const ty = BODY_Y + 430 + GAP;
    const cw = (CW - GAP * (DEBTS - 1)) / DEBTS;
    for (let n = 1; n <= DEBTS; n++) {
      const x = CX + (n - 1) * (cw + GAP);
      c.rect(x, ty, cw, 150, { r: 14, fill: t.surface });
      c.label(`Tracker ${pad2(n)}`, x + 18, ty + 18);
      c.line(x + 18, ty + 70, x + cw - 18, ty + 70, t.line, 0.8);
      const bx = x + cw - 114;
      const by = ty + 96;
      c.rect(bx, by, 96, 40, { r: 20, fill: t.accent });
      c.text("Open", bx + 22, by + 11, {
        font: "bodySemi",
        size: 14,
        color: t.onAccent,
      });
      c.chevron(bx + 72, by + 20, "right", 5, t.onAccent);
      c.link(x, ty, cw, 150, go(`debt-${n}`));
    }
    const hy = ty + 150 + GAP;
    const h = c.card(CX, hy, CW, BODY_B - hy, "Pick a method", {
      fill: t.warmSoft,
    });
    c.text(
      "Snowball: pay the smallest balance first for quick wins.   Avalanche: pay the highest interest first to save the most money.   Either way, pay the minimum on everything else.",
      h.x,
      h.y,
      { font: "body", size: 14, color: t.muted, width: h.w, wrap: true },
    );
  },

  debtOne(S, p) {
    const { c, t, go } = S;
    header(S, "Debt payoff tracker", `Tracker ${pad2(p.n)}`, [
      { chevron: "left", target: p.n > 1 ? go(`debt-${p.n - 1}`) : null },
      { label: "All debts", target: go("debt") },
      { chevron: "right", target: p.n < DEBTS ? go(`debt-${p.n + 1}`) : null },
    ]);
    const lw = 400;
    let y = BODY_Y;
    for (const [title, h] of [
      ["Debt", 100],
      ["Starting balance", 90],
      ["Interest rate · minimum payment", 90],
      ["Debt-free by", 90],
    ]) {
      const b = c.card(CX, y, lw, h, title);
      c.ruled(b.x, b.y - 4, b.w, b.h, 30);
      y += h + GAP;
    }
    const th = c.card(CX, y, lw, BODY_B - y, "Shade as you pay it off", {
      fill: t.accentSoft,
    });
    const segs = 10;
    const sw = (th.w - (segs - 1) * 6) / segs;
    for (let i = 0; i < segs; i++) {
      const sx = th.x + i * (sw + 6);
      c.rect(sx, th.y + 4, sw, th.h - 34, { r: 8, stroke: t.faint, lw: 1 });
      c.text(`${(i + 1) * 10}%`, sx, th.y + th.h - 22, {
        font: "mono",
        size: 9.5,
        color: t.faint,
        width: sw,
        align: "center",
      });
    }
    const rx = CX + lw + GAP;
    const b = c.card(rx, BODY_Y, CR - rx, BODY_H, "Payments");
    table(
      c,
      { x: b.x, y: b.y, w: b.w, h: b.h - 8 },
      [
        { label: "Date", w: 1 },
        { label: "Paid", w: 1 },
        { label: "Extra", w: 1 },
        { label: "New balance", w: 1.3 },
      ],
      20,
    );
  },

  subs(S) {
    const { c, t } = S;
    header(S, "Know what you're paying for", "Subscriptions");
    const b = c.card(CX, BODY_Y, CW, BODY_H - 110, "");
    table(
      c,
      { x: b.x, y: b.y, w: b.w, h: b.h - 8 },
      [
        { label: "Keep", w: 0.6 },
        { label: "Service", w: 3 },
        { label: "Cost", w: 1.2 },
        { label: "Monthly / yearly", w: 1.6 },
        { label: "Renews", w: 1.3 },
        { label: "Cancel by", w: 1.3 },
      ],
      16,
      { firstCheck: true },
    );
    const ty = BODY_Y + BODY_H - 110 + GAP;
    const w = (CW - GAP * 2) / 3;
    [
      ["Total per month", t.surface],
      ["Total per year", t.surface],
      ["Saved by cancelling", t.warmSoft],
    ].forEach(([label, fill], i) =>
      amountBox(c, CX + i * (w + GAP), ty, w, BODY_B - ty, label, fill),
    );
  },

  month(S, p) {
    const { c, t } = S;
    monthHeader(S, p, "Budget");
    const lw = 560;
    let y = BODY_Y;
    const inc = c.card(CX, y, lw, 200, "Income");
    table(
      c,
      inc,
      [
        { label: "Source", w: 2.2 },
        { label: "Planned", w: 1 },
        { label: "Actual", w: 1 },
      ],
      4,
    );
    y += 200 + GAP;
    const bills = c.card(CX, y, lw, 300, "Fixed bills");
    table(
      c,
      bills,
      [
        { label: "Bill", w: 2.2 },
        { label: "Planned", w: 1 },
        { label: "Actual", w: 1 },
      ],
      7,
    );
    y += 300 + GAP;
    const sd = c.card(CX, y, lw, BODY_B - y, "Savings & debt payments");
    table(
      c,
      sd,
      [
        { label: "Where", w: 2.2 },
        { label: "Planned", w: 1 },
        { label: "Actual", w: 1 },
      ],
      4,
    );

    const rx = CX + lw + GAP;
    const rw = CR - rx;
    const sh = 600;
    const sp = c.card(rx, BODY_Y, rw, sh, "Spending categories");
    table(
      c,
      sp,
      [
        { label: "Category", w: 2 },
        { label: "Budget", w: 1 },
        { label: "Spent", w: 1 },
        { label: "Left", w: 1 },
      ],
      13,
    );
    const sy = BODY_Y + sh + GAP;
    const bw = (rw - GAP * 2) / 3;
    [
      ["Money in", t.surface],
      ["Money out", t.surface],
      ["Left over", t.warmSoft],
    ].forEach(([label, fill], i) =>
      amountBox(c, rx + i * (bw + GAP), sy, bw, BODY_B - sy, label, fill),
    );
  },

  bills(S, p) {
    const { c, t } = S;
    monthHeader(S, p, "Bill tracker");
    const b = c.card(CX, BODY_Y, CW, BODY_H - 110, "");
    table(
      c,
      { x: b.x, y: b.y, w: b.w, h: b.h - 8 },
      [
        { label: "Paid", w: 0.6 },
        { label: "Bill", w: 3 },
        { label: "Due", w: 1 },
        { label: "Amount", w: 1.3 },
        { label: "Auto-pay", w: 1 },
        { label: "Notes", w: 2.4 },
      ],
      15,
      { firstCheck: true },
    );
    const ty = BODY_Y + BODY_H - 110 + GAP;
    const w = (CW - GAP * 2) / 3;
    [
      ["Total bills", t.surface],
      ["Paid so far", t.surface],
      ["Still to pay", t.warmSoft],
    ].forEach(([label, fill], i) =>
      amountBox(c, CX + i * (w + GAP), ty, w, BODY_B - ty, label, fill),
    );
  },

  spend1(S, p) {
    spendingLog(S, p, 1);
  },

  spend2(S, p) {
    spendingLog(S, p, 2);
  },

  nospend(S, p) {
    const { c, t, dated, year, weekStart, dayNames } = S;
    const m = p.month;
    monthHeader(S, p, "No-spend challenge");
    const gw = 760;
    const b = c.card(
      CX,
      BODY_Y,
      gw,
      BODY_H,
      "Circle every day you spend nothing extra",
    );
    const cellW = b.w / 7;
    const gy = b.y + 22;
    dayNames.forEach((name, i) =>
      c.label(name.slice(0, 3), b.x + i * cellW + 8, b.y + 2, {
        color: t.faint,
      }),
    );
    if (dated) {
      const rows = monthGrid(year, m, weekStart);
      const ch = (b.h - 30) / rows.length;
      rows.forEach((row, r) =>
        row.forEach((d, i) => {
          if (d.getUTCMonth() !== m) return;
          const x = b.x + i * cellW;
          const y = gy + r * ch;
          c.rect(x + 3, y + 3, cellW - 6, ch - 6, { r: 10, fill: t.bg });
          c.text(String(d.getUTCDate()), x + 12, y + 10, {
            font: "monoMedium",
            size: 13,
            color: t.ink,
          });
          c.circle(x + cellW / 2, y + ch / 2 + 8, Math.min(18, ch / 3), {
            stroke: t.faint,
          });
        }),
      );
    } else {
      const n = 31;
      const rowsN = 5;
      const ch = (b.h - 30) / rowsN;
      for (let d = 0; d < n; d++) {
        const x = b.x + (d % 7) * cellW;
        const y = gy + Math.floor(d / 7) * ch;
        c.rect(x + 3, y + 3, cellW - 6, ch - 6, { r: 10, fill: t.bg });
        c.text(String(d + 1), x + 12, y + 10, {
          font: "monoMedium",
          size: 13,
          color: t.ink,
        });
        c.circle(x + cellW / 2, y + ch / 2 + 8, Math.min(18, ch / 3), {
          stroke: t.faint,
        });
      }
    }

    const rx = CX + gw + GAP;
    const rw = CR - rx;
    const r1 = c.card(
      rx,
      BODY_Y,
      rw,
      260,
      "My rules (what still counts as OK)",
    );
    c.ruled(r1.x, r1.y - 6, r1.w, r1.h, 32);
    const r2y = BODY_Y + 260 + GAP;
    const r2 = c.card(rx, r2y, rw, 260, "Things I wanted but skipped");
    c.ruled(r2.x, r2.y - 6, r2.w, r2.h, 32);
    const r3y = r2y + 260 + GAP;
    amountBox(c, rx, r3y, rw, BODY_B - r3y, "Saved this month", t.warmSoft);
  },

  review(S, p) {
    const { c, t } = S;
    monthHeader(S, p, "Month review");
    const cw = (CW - GAP * 2) / 3;
    const ch = (BODY_H - GAP) / 2;
    [
      ["Money wins"],
      ["Where I overspent"],
      ["What I'll change next month"],
      ["Saved this month"],
      ["Debt paid this month"],
      ["Rate the month", "rate"],
    ].forEach(([title, kind], i) => {
      const x = CX + (i % 3) * (cw + GAP);
      const y = BODY_Y + Math.floor(i / 3) * (ch + GAP);
      const b = c.card(x, y, cw, ch, title, {
        fill: i === 0 ? t.warmSoft : t.surface,
      });
      if (kind === "rate") {
        ratingRow(c, { ...b, h: 60 }, 10);
        c.label("One money habit for next month", b.x, b.y + 110);
        c.ruled(b.x, b.y + 120, b.w, b.h - 130, 36);
      } else c.ruled(b.x, b.y - 6, b.w, b.h, 34);
    });
  },

  notes(S) {
    const { c, t, go } = S;
    header(S, "Notes index", "Notes");
    const cw = (CW - GAP * 2) / 2;
    const per = NOTE_PAGES / 2;
    const rh = Math.min(BODY_H / per, 90);
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
      c.text(n % 2 ? "Lined" : "Dot grid", x + cw - 136, y + rh / 2 - 7, {
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

function spendingLog(S, p, n) {
  const { c, t } = S;
  monthHeader(S, p, n === 1 ? "Spending log" : "Spending log (2)");
  const b = c.card(CX, BODY_Y, CW, BODY_H - 110, "");
  table(
    c,
    { x: b.x, y: b.y, w: b.w, h: b.h - 8 },
    [
      { label: "Date", w: 0.9 },
      { label: "What", w: 3.4 },
      { label: "Category", w: 1.8 },
      { label: "Amount", w: 1.2 },
      { label: "Need / want", w: 1.2 },
    ],
    17,
  );
  const ty = BODY_Y + BODY_H - 110 + GAP;
  const w = (CW - GAP) / 2;
  amountBox(c, CX, ty, w, BODY_B - ty, "Page total", t.surface);
  amountBox(
    c,
    CX + w + GAP,
    ty,
    w,
    BODY_B - ty,
    n === 1 ? "Carried to page 2" : "Month total",
    t.warmSoft,
  );
}
