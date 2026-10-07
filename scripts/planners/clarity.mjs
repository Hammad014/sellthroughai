/**
 * Clarity Planner — Promptory's hyperlinked digital planner.
 *
 * Editions:
 *   dated   — a specific year (Monday- or Sunday-start), real dates everywhere,
 *             every date on every calendar links to its daily page.
 *   undated — months + 5 weeks/month + 7 days/week, write-your-own dates.
 *
 * Usage: buildClarity({ edition, year, weekStart, theme }) → Promise<Buffer>
 */
import { Ctx, createDoc, THEMES, W, H } from "./lib/pdf.mjs";
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
  dayOfYear,
  fmtShort,
} from "./lib/calendar.mjs";

// ---------- Layout grid ----------
const CX = 64; // content left
const TAB_X = 1290; // month tab strip
const CR = TAB_X - 48; // content right
const CW = CR - CX; // 1178
const CY = 104; // header top
const BODY_Y = CY + 92; // body top (196)
const BODY_B = H - 48; // body bottom (976)
const BODY_H = BODY_B - BODY_Y; // 780
const GAP = 18;

const UNDATED_WEEKS = 5;
const NOTE_PAGES = 24;
const PROJECT_PAGES = 8;
const GOAL_PAGES = 4;
const HABIT_ROWS = 14;

const NAV = [
  { label: "Home", section: "home", target: () => "home" },
  { label: "Year", section: "year", target: () => "year" },
  { label: "Goals", section: "goals", target: () => "vision" },
  {
    label: "Habits",
    section: "habits",
    target: (p) => `habit-${p.month ?? 0}`,
  },
  { label: "Projects", section: "projects", target: () => "projects" },
  { label: "Notes", section: "notes", target: () => "notes" },
];

const pad2 = (n) => String(n).padStart(2, "0");

// ======================================================================
// Page plan
// ======================================================================

function planPages({ edition, year, weekStart }) {
  const pages = [];
  const add = (p) => pages.push(p);

  add({ key: "cover", type: "cover" });
  add({ key: "guide", type: "guide" });
  add({ key: "home", type: "home", section: "home" });
  add({ key: "year", type: "year", section: "year" });
  add({ key: "vision", type: "vision", section: "goals" });
  for (let g = 1; g <= GOAL_PAGES; g++)
    add({ key: `goal-${g}`, type: "goal", n: g, section: "goals" });

  const addMonth = (m) => {
    add({ key: `month-${m}`, type: "month", month: m });
    add({ key: `plan-${m}`, type: "plan", month: m });
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
      for (const d of inYear) {
        add({
          key: `day-${isoKey(d)}`,
          type: "day",
          date: d,
          week: i,
          month: d.getUTCMonth(),
        });
      }
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

  add({ key: "projects", type: "projects", section: "projects" });
  for (let n = 1; n <= PROJECT_PAGES; n++)
    add({ key: `project-${n}`, type: "project", n, section: "projects" });
  add({ key: "notes", type: "notes", section: "notes" });
  for (let n = 1; n <= NOTE_PAGES; n++)
    add({
      key: `note-${n}`,
      type: "note",
      n,
      style: n % 2 ? "dots" : "lined",
      section: "notes",
    });
  add({ key: "review", type: "review" });
  return pages;
}

// ======================================================================
// Builder
// ======================================================================

export async function buildClarity({
  edition = "dated",
  year = 2027,
  weekStart = "mon",
  theme = "light",
}) {
  const dated = edition === "dated";
  const t = THEMES[theme];
  const doc = createDoc({
    title: dated
      ? `Clarity Planner ${year} (${weekStart === "sun" ? "Sunday" : "Monday"} start, ${t.name})`
      : `Clarity Planner — Undated (${t.name})`,
    subject: "Hyperlinked digital planner by Promptory",
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
  item(root, "Year at a glance", "year");
  const goals = item(root, "Vision & goals", "vision");
  for (let g = 1; g <= GOAL_PAGES; g++)
    item(goals, `Goal ${pad2(g)}`, `goal-${g}`);
  for (let m = 0; m < 12; m++) {
    const mo = item(root, MONTHS[m], `month-${m}`);
    item(mo, "Plan & review", `plan-${m}`);
    item(mo, "Habit tracker", `habit-${m}`);
    pages
      .filter((p) => p.type === "week" && p.month === m)
      .forEach((p) => item(mo, weekTitle(S, p), p.key));
  }
  item(root, "Projects", "projects");
  item(root, "Notes", "notes");
  item(root, "Year in review", "review");
}

// ======================================================================
// Chrome: top nav + month tabs (every page except the cover)
// ======================================================================

function chrome(S, p) {
  const { c, t, go } = S;

  // Brand → Home
  c.text("CLARITY", CX, 34, {
    font: "displayBold",
    size: 15,
    spacing: 2.4,
    color: t.ink,
  });
  if (S.yearLabel)
    c.text(S.yearLabel, CX + 86, 35.5, {
      font: "mono",
      size: 12,
      color: t.muted,
    });
  c.link(CX - 8, 20, 150, 44, go("home"));

  // Nav pills (right-aligned to content edge)
  const items = NAV.map((n) => ({
    label: n.label,
    active: n.section === p.section,
    target: go(n.target(p)),
  }));
  pillRow(c, CR, 26, items);

  // Month tabs
  const top = 24;
  const gap = 6;
  const th = (H - top * 2 - gap * 11) / 12;
  for (let m = 0; m < 12; m++) {
    const y = top + m * (th + gap);
    const active = p.month === m;
    c.rect(TAB_X, y, W - TAB_X + 16, th, {
      r: 12,
      fill: active ? t.accent : t.surface,
    });
    const label = MONTHS_SHORT[m].toUpperCase();
    const lw = c.width(label, "monoMedium", 12.5, 1.6);
    c.text(label, TAB_X + (W - TAB_X - lw) / 2, y + th / 2 - 7, {
      font: "monoMedium",
      size: 12.5,
      spacing: 1.6,
      color: active ? t.onAccent : t.muted,
    });
    c.link(TAB_X, y, W - TAB_X, th, go(`month-${m}`));
  }
}

/** Right-aligned row of pills ending at `right`. Items: {label|chevron, active, target}. */
function pillRow(c, right, y, items, { h = 34, size = 13.5 } = {}) {
  const { t } = c;
  const pad = 16;
  const gap = 8;
  const widths = items.map((it) =>
    it.chevron ? h : c.width(it.label, "bodyMedium", size) + pad * 2,
  );
  let x = right - widths.reduce((a, b) => a + b, 0) - gap * (items.length - 1);
  items.forEach((it, i) => {
    const w = widths[i];
    const disabled = it.target == null;
    c.rect(x, y, w, h, {
      r: h / 2,
      fill: it.active ? t.accent : t.surface,
    });
    const color = it.active ? t.onAccent : disabled ? t.faint : t.ink;
    if (it.chevron) c.chevron(x + w / 2, y + h / 2, it.chevron, 6, color);
    else
      c.text(it.label, x + pad, y + h / 2 - size * 0.62, {
        font: "bodyMedium",
        size,
        color,
      });
    if (!disabled) c.link(x, y, w, h, it.target);
    x += w + gap;
  });
}

function header(S, eyebrow, title, actions = []) {
  const { c, t } = S;
  c.label(eyebrow, CX, CY);
  c.text(title, CX - 2, CY + 20, { font: "display", size: 40, color: t.ink });
  if (actions.length) pillRow(c, CR, CY + 28, actions);
}

function weekTitle(S, p) {
  if (S.dated) return `Week ${p.week + 1}`;
  return `${MONTHS_SHORT[p.month]} · Week ${p.w + 1}`;
}

// ======================================================================
// Page renderers
// ======================================================================

const RENDER = {
  cover(S) {
    const { c, t, go, dated, year, weekStart } = S;
    c.label("Promptory  ·  Digital planner", 96, 92, { color: t.muted });
    const dy = dated ? 40 : 80; // optically centre the title block

    const big = dated ? String(year) : "Undated";
    c.text(big, 88, 230 + dy, {
      font: "displayBold",
      size: dated ? 230 : 150,
      spacing: dated ? -6 : -3,
      color: t.ink,
    });
    c.text("Clarity Planner", 96, (dated ? 500 : 450) + dy, {
      font: "display",
      size: 54,
      color: t.accent,
    });
    c.text(
      dated
        ? `A calm, fully hyperlinked planner · ${weekStart === "sun" ? "Sunday" : "Monday"} start`
        : "A calm, fully hyperlinked planner · start any month, any year",
      98,
      (dated ? 576 : 526) + dy,
      { font: "body", size: 21, color: t.muted },
    );

    // Start button → Home
    const by = (dated ? 660 : 610) + dy;
    c.rect(96, by, 236, 60, { r: 30, fill: t.accent });
    c.text("Open planner", 128, by + 18, {
      font: "bodySemi",
      size: 19,
      color: t.onAccent,
    });
    c.chevron(300, by + 30, "right", 7, t.onAccent);
    c.link(96, by, 236, 60, go("home"));

    // Month grid (decorative + functional)
    const gx = 846;
    const gy = 250;
    const s = 112;
    const g = 14;
    for (let m = 0; m < 12; m++) {
      const x = gx + (m % 3) * (s + g);
      const y = gy + Math.floor(m / 3) * (s + g);
      c.rect(x, y, s, s, {
        r: 18,
        fill: m % 4 === 0 ? t.accentSoft : t.surface,
      });
      c.text(pad2(m + 1), x + 16, y + 14, {
        font: "mono",
        size: 11,
        color: t.muted,
      });
      c.text(MONTHS_SHORT[m], x + 16, y + s - 44, {
        font: "display",
        size: 24,
        color: t.ink,
      });
      c.link(x, y, s, s, go(`month-${m}`));
    }

    c.label("Tap a month to jump in", gx, gy + 4 * (s + g) + 6, {
      color: t.faint,
    });
  },

  guide(S) {
    const { c, t, pages } = S;
    header(S, "Start here", "How this planner works");

    const count = (type) => pages.filter((p) => p.type === type).length;
    const colW = (CW - GAP * 2) / 3;
    const cards = [
      {
        title: "Tap to navigate",
        body: [
          "Every page is linked. The tabs on the right jump to any month, and the top bar takes you Home or to your Year, Goals, Habits, Projects and Notes.",
          S.dated
            ? "Tap any date on a calendar to open that day. Tap a week number to open the week. Daily pages link back to their week and month."
            : "Each month has five weekly spreads, and each week links to seven daily pages. Write your own dates in as you go.",
        ],
      },
      {
        title: "Write on it",
        body: [
          "Open the PDF in GoodNotes, Notability, Noteshelf, Xodo, Samsung Notes or any annotation app, then write with your pen, type, or add stickers.",
          "If tapping a link draws a line instead of jumping, switch to read-only mode or turn on your app's 'Pencil only draws' setting so your finger follows links.",
        ],
      },
      {
        title: "Make it yours",
        body: [
          "Need more pages? Duplicate any notes, project or daily page from your app's page menu. The links on the original keep working.",
          "Tip: use the Plan & review page at the start and end of every month. It's where the real progress happens.",
        ],
      },
    ];
    cards.forEach((card, i) => {
      const x = CX + i * (colW + GAP);
      const box = c.card(x, BODY_Y, colW, 360, card.title);
      let y = box.y + 6;
      card.body.forEach((para) => {
        c.text(para, box.x, y, {
          font: "body",
          size: 16.5,
          width: box.w,
          lineGap: 5,
          color: t.ink,
          wrap: true,
        });
        y = S.c.doc.y + 16;
      });
    });

    // What's inside
    const y = BODY_Y + 360 + GAP;
    const box = c.card(CX, y, CW, BODY_B - y, "What's inside");
    const stats = [
      [count("month"), "Monthly calendars"],
      [count("plan"), "Plan & review pages"],
      [count("habit"), "Habit trackers"],
      [count("week"), "Weekly spreads"],
      [count("day"), "Daily pages"],
      [count("goal"), "Goal planners"],
      [count("project"), "Project planners"],
      [count("note"), "Notes pages"],
    ];
    const sw = box.w / 4;
    stats.forEach(([n, label], i) => {
      const sx = box.x + (i % 4) * sw;
      const sy = box.y + 30 + Math.floor(i / 4) * 160;
      c.text(String(n), sx, sy, { font: "display", size: 48, color: t.accent });
      c.text(label, sx + 2, sy + 62, {
        font: "body",
        size: 16,
        color: t.muted,
      });
    });
  },

  home(S) {
    const { c, t, go, dated, year, weekStart } = S;
    header(S, dated ? `Clarity ${year}` : "Clarity · Undated", "Home");

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
      c.text(pad2(m + 1), x + cw - 34, y + 18, {
        font: "mono",
        size: 11,
        color: t.faint,
      });
      if (dated) {
        miniMonth(S, x + 12, y + 52, cw - 24, ch - 64, year, m, {
          links: false,
          size: 9.5,
        });
      } else {
        c.ruled(x + 16, y + 52, cw - 32, ch - 74, 30);
      }
      c.link(x, y, cw, ch, go(`month-${m}`));
    }

    // Jump-to list
    const lx = CX + gridW + 30;
    const lw = CR - lx;
    c.label("Jump to", lx, BODY_Y);
    const links = [
      ["Year at a glance", "year"],
      ["Vision & goals", "vision"],
      ["Goal planners", "goal-1"],
      ["Habit trackers", "habit-0"],
      ["Projects", "projects"],
      ["Notes", "notes"],
      ["Year in review", "review"],
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
    const box = c.card(lx, iy, lw, BODY_B - iy, "Intentions");
    c.ruled(box.x, box.y - 8, box.w, box.h, 32);
    void weekStart;
  },

  year(S) {
    const { c, t, go, dated, year } = S;
    header(
      S,
      "The big picture",
      dated ? `${year} at a glance` : "Year at a glance",
    );
    const cols = 4;
    const gx = 26;
    const gy = 18;
    const cw = (CW - gx * (cols - 1)) / cols;
    const ch = (BODY_H - gy * 2) / 3;
    for (let m = 0; m < 12; m++) {
      const x = CX + (m % cols) * (cw + gx);
      const y = BODY_Y + Math.floor(m / cols) * (ch + gy);
      c.rect(x, y, cw, ch, { r: 14, fill: t.surface });
      c.text(MONTHS[m], x + 16, y + 12, {
        font: "display",
        size: 18,
        color: t.ink,
      });
      c.link(x, y, cw, 44, go(`month-${m}`));
      if (dated)
        miniMonth(S, x + 10, y + 46, cw - 20, ch - 54, year, m, {
          links: true,
          size: 11.5,
        });
      else blankMini(S, x + 10, y + 46, cw - 20, ch - 56);
    }
  },

  vision(S) {
    const { c, go, dated, year } = S;
    header(
      S,
      dated ? `The year ahead · ${year}` : "The year ahead",
      "Vision & goals",
      Array.from({ length: GOAL_PAGES }, (_, i) => ({
        label: `Goal ${pad2(i + 1)}`,
        target: go(`goal-${i + 1}`),
      })),
    );
    const topH = 150;
    const b1 = c.card(CX, BODY_Y, 380, topH, "Word of the year");
    c.ruled(b1.x, b1.y, b1.w, b1.h - 8, 40);
    const b2 = c.card(
      CX + 380 + GAP,
      BODY_Y,
      CW - 380 - GAP,
      topH,
      "By the end of the year I want to feel…",
    );
    c.ruled(b2.x, b2.y, b2.w, b2.h - 8, 40);

    const areas = [
      "Career & work",
      "Health & energy",
      "Money",
      "Relationships",
      "Growth & learning",
      "Fun & adventure",
    ];
    const gy = BODY_Y + topH + GAP;
    const cw = (CW - GAP * 2) / 3;
    const ch = (BODY_B - gy - GAP) / 2;
    areas.forEach((a, i) => {
      const x = CX + (i % 3) * (cw + GAP);
      const y = gy + Math.floor(i / 3) * (ch + GAP);
      const b = c.card(x, y, cw, ch, a);
      c.ruled(b.x, b.y - 6, b.w, b.h, 34);
    });
  },

  goal(S, p) {
    const { c, go } = S;
    header(S, "Goal planner", `Goal ${pad2(p.n)}`, [
      { chevron: "left", target: p.n > 1 ? go(`goal-${p.n - 1}`) : null },
      { label: "Vision", target: go("vision") },
      {
        chevron: "right",
        target: p.n < GOAL_PAGES ? go(`goal-${p.n + 1}`) : null,
      },
    ]);
    const lw = 560;
    const rx = CX + lw + GAP;
    const rw = CW - lw - GAP;
    let y = BODY_Y;
    for (const [title, h] of [
      ["The goal", 170],
      ["Why it matters", 210],
      ["Success looks like", 210],
    ]) {
      const b = c.card(CX, y, lw, h, title);
      c.ruled(b.x, b.y - 6, b.w, b.h, 34);
      y += h + GAP;
    }
    const dh = BODY_B - y;
    const half = (lw - GAP) / 2;
    for (const [i, title] of ["Start date", "Deadline"].entries()) {
      const b = c.card(CX + i * (half + GAP), y, half, dh, title);
      c.ruled(b.x, b.y, b.w, b.h - 20, 40);
    }

    let ry = BODY_Y;
    const m = c.card(rx, ry, rw, 300, "Milestones");
    for (let i = 0; i < 6; i++) {
      const yy = m.y + i * 40;
      c.checkbox(m.x, yy + 14);
      c.line(m.x + 26, yy + 32, m.x + m.w - 110, yy + 32, c.t.line, 0.8);
      c.line(m.x + m.w - 90, yy + 32, m.x + m.w, yy + 32, c.t.line, 0.8);
    }
    c.label("By", m.x + m.w - 90, m.y - 26, { color: c.t.faint });
    ry += 300 + GAP;
    const a = c.card(rx, ry, rw, 300, "Action steps");
    c.checklist(a.x, a.y - 6, a.w, 7, 36);
    ry += 300 + GAP;
    const r = c.card(
      rx,
      ry,
      rw,
      BODY_B - ry,
      "When I hit it, I'll celebrate by…",
    );
    c.ruled(r.x, r.y - 6, r.w, r.h, 34);
  },

  month(S, p) {
    const { c, t, go, dated, year, weekStart, dayNames } = S;
    const m = p.month;
    header(S, dated ? `Month · ${year}` : "Month", MONTHS[m], [
      { chevron: "left", target: m > 0 ? go(`month-${m - 1}`) : null },
      { label: "Plan & review", target: go(`plan-${m}`) },
      { label: "Habits", target: go(`habit-${m}`) },
      { chevron: "right", target: m < 11 ? go(`month-${m + 1}`) : null },
    ]);

    const gridW = 860;
    const gutter = 46;
    const cellW = (gridW - gutter) / 7;
    const headH = 30;
    const rows = dated ? monthGrid(year, m, weekStart) : null;
    const nRows = dated ? rows.length : 6;
    const cellH = (BODY_H - headH) / nRows;
    const gx = CX + gutter;
    const gy = BODY_Y + headH;

    // Weekday header + weekend tint
    dayNames.forEach((name, i) => {
      c.label(name.slice(0, 3), gx + i * cellW + 10, BODY_Y + 6);
      if (name === "Saturday" || name === "Sunday")
        c.rect(gx + i * cellW, gy, cellW, cellH * nRows, { fill: t.surface });
    });

    // Grid lines
    for (let r = 0; r <= nRows; r++)
      c.line(gx, gy + r * cellH, gx + 7 * cellW, gy + r * cellH, t.line, 1);
    for (let i = 0; i <= 7; i++)
      c.line(gx + i * cellW, gy, gx + i * cellW, gy + nRows * cellH, t.line, 1);

    for (let r = 0; r < nRows; r++) {
      const ry = gy + r * cellH;
      // Week handle in the gutter
      let weekKey = null;
      let weekLabel = "";
      if (dated) {
        const idx = S.pages.find(
          (pg) => pg.type === "week" && isoKey(pg.start) === isoKey(rows[r][0]),
        );
        if (idx) {
          weekKey = idx.key;
          weekLabel = `W${idx.week + 1}`;
        }
      } else if (r < UNDATED_WEEKS) {
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
          const inYear = d.getUTCFullYear() === year;
          c.text(String(d.getUTCDate()), x + 10, ry + 9, {
            font: inMonth ? "monoMedium" : "mono",
            size: 14,
            color: inMonth ? t.ink : t.faint,
          });
          if (inYear) c.link(x, ry, 52, 38, go(`day-${isoKey(d)}`));
        } else {
          c.line(x + 10, ry + 30, x + 40, ry + 30, t.faint, 0.8);
        }
      }
    }

    // Side column
    const sx = CX + gridW + GAP;
    const sw = CR - sx;
    let y = BODY_Y;
    for (const [title, h, kind] of [
      ["Monthly focus", 230, "ruled"],
      ["Important dates", 250, "ruled"],
      ["Notes", BODY_H - 480 - GAP * 2, "dots"],
    ]) {
      const b = c.card(sx, y, sw, h, title);
      if (kind === "ruled") c.ruled(b.x, b.y - 6, b.w, b.h, 32);
      else c.dots(b.x - 6, b.y - 10, b.w + 12, b.h + 4, 22);
      y += h + GAP;
    }
  },

  plan(S, p) {
    const { c, t, go, dated, year } = S;
    const m = p.month;
    header(S, `${MONTHS[m]}${dated ? ` ${year}` : ""}`, "Plan & review", [
      { label: "Calendar", target: go(`month-${m}`) },
      { label: "Habits", target: go(`habit-${m}`) },
    ]);
    const cw = (CW - GAP) / 2;
    const col = (x, kicker, cards) => {
      c.text(kicker, x, BODY_Y - 2, {
        font: "displayBold",
        size: 13,
        spacing: 2,
        color: t.accent,
      });
      let y = BODY_Y + 26;
      const total = BODY_B - y - GAP * (cards.length - 1);
      const sum = cards.reduce((a, cd) => a + cd[1], 0);
      for (const [title, weight, kind] of cards) {
        const h = (weight / sum) * total;
        const b = c.card(x, y, cw, h, title);
        if (kind === "check")
          c.checklist(b.x, b.y - 8, b.w, Math.floor(b.h / 36), 36);
        else if (kind === "rate") ratingRow(c, b, 10);
        else c.ruled(b.x, b.y - 6, b.w, b.h, 34);
        y += h + GAP;
      }
    };
    col(CX, "PLAN", [
      ["This month's focus", 130],
      ["Top goals", 240, "check"],
      ["Key dates & deadlines", 190],
      ["Habits to build", 170],
    ]);
    col(CX + cw + GAP, "REVIEW", [
      ["Wins", 200],
      ["Lessons learned", 200],
      ["What I'll change next month", 190],
      ["Rate the month", 140, "rate"],
    ]);
  },

  habit(S, p) {
    const { c, t, go, dated, year, weekStart } = S;
    const m = p.month;
    header(S, `${MONTHS[m]}${dated ? ` ${year}` : ""}`, "Habit tracker", [
      { chevron: "left", target: m > 0 ? go(`habit-${m - 1}`) : null },
      { label: "Calendar", target: go(`month-${m}`) },
      { chevron: "right", target: m < 11 ? go(`habit-${m + 1}`) : null },
    ]);
    const n = dated ? daysInMonth(year, m) : 31;
    const nameW = 230;
    const totalW = 64;
    const colW = (CW - nameW - totalW) / 31;
    const headH = 50;
    const footH = 110;
    const rowH = (BODY_H - headH - footH - GAP) / HABIT_ROWS;
    const tx = CX + nameW;
    const ty = BODY_Y + headH;
    const initials = ["S", "M", "T", "W", "T", "F", "S"];

    c.label("Habit", CX, BODY_Y + 18);
    for (let d = 0; d < n; d++) {
      const x = tx + d * colW;
      let weekend = false;
      if (dated) {
        const date = utc(year, m, d + 1);
        const dow = date.getUTCDay();
        weekend = dow === 0 || dow === 6;
        c.text(initials[dow], x, BODY_Y + 2, {
          font: "mono",
          size: 10,
          color: t.faint,
          width: colW,
          align: "center",
        });
        c.link(x, BODY_Y, colW, headH, go(`day-${isoKey(date)}`));
      }
      if (weekend) c.rect(x, ty, colW, rowH * HABIT_ROWS, { fill: t.surface });
      c.text(String(d + 1), x, BODY_Y + 22, {
        font: "monoMedium",
        size: 11,
        color: t.ink,
        width: colW,
        align: "center",
      });
    }
    void weekStart;
    c.label("Done", tx + 31 * colW + 10, BODY_Y + 18);

    for (let r = 0; r < HABIT_ROWS; r++) {
      const y = ty + r * rowH;
      c.line(CX, y + rowH, CR, y + rowH, t.line, 0.8);
      c.line(CX, y + rowH - 10, CX + nameW - 24, y + rowH - 10, t.line, 0.6);
      c.line(
        tx + 31 * colW + 12,
        y + rowH - 10,
        CR,
        y + rowH - 10,
        t.line,
        0.6,
      );
      for (let d = 0; d < n; d++)
        c.circle(
          tx + d * colW + colW / 2,
          y + rowH / 2,
          Math.min(8.5, colW / 2 - 4),
          {
            stroke: t.faint,
            lw: 0.9,
          },
        );
    }
    c.line(CX, ty, CR, ty, t.line, 1);

    const fy = BODY_B - footH;
    const b = c.card(CX, fy, CW, footH, "How did my habits feel this month?");
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

    // Left column
    const lw = 300;
    const f = c.card(CX, BODY_Y, lw, 150, "Focus this week");
    c.ruled(f.x, f.y - 6, f.w, f.h, 32);
    const top3Y = BODY_Y + 150 + GAP;
    const tp = c.card(CX, top3Y, lw, 190, "Top 3");
    for (let i = 0; i < 3; i++) {
      const y = tp.y + i * 44;
      c.text(String(i + 1), tp.x, y + 12, {
        font: "display",
        size: 20,
        color: t.accent,
      });
      c.line(tp.x + 26, y + 34, tp.x + tp.w, y + 34, t.line, 0.8);
    }
    const tdY = top3Y + 190 + GAP;
    const td = c.card(CX, tdY, lw, BODY_B - tdY, "To-do");
    c.checklist(td.x, td.y - 8, td.w, Math.floor(td.h / 34), 34);

    // Day boxes: 4 × 2 (7 days + notes)
    const gx = CX + lw + GAP;
    const gw = CR - gx;
    const bw = (gw - 14 * 3) / 4;
    const bh = (BODY_H - 14) / 2;
    for (let i = 0; i < 8; i++) {
      const x = gx + (i % 4) * (bw + 14);
      const y = BODY_Y + Math.floor(i / 4) * (bh + 14);
      c.rect(x, y, bw, bh, { r: 14, fill: t.surface });
      if (i === 7) {
        c.label("Notes", x + 16, y + 16);
        c.dots(x + 6, y + 40, bw - 12, bh - 48, 22);
        continue;
      }
      let target = null;
      let faded = false;
      c.label(dayNames[i].slice(0, 3), x + 16, y + 18, {
        color: t.muted,
      });
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
      c.ruled(x + 16, y + 56, bw - 32, bh - 70, 32);
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
      const wd = dayNames[weekdayIndex(d, S.weekStart)];
      eyebrow = `${MONTHS[m]} ${year} · Week ${p.week + 1} · Day ${dayOfYear(d)}`;
      title = `${wd}, ${MONTHS[m]} ${d.getUTCDate()}`;
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

    // Schedule
    const c1w = 340;
    const sch = c.card(CX, BODY_Y, c1w, BODY_H, "Schedule");
    const hours = 17; // 6:00 → 22:00
    const rh = sch.h / hours;
    for (let i = 0; i < hours; i++) {
      const y = sch.y + i * rh;
      const hr = 6 + i;
      const label = `${hr > 12 ? hr - 12 : hr}${hr >= 12 ? "pm" : "am"}`;
      c.text(label, sch.x, y + rh / 2 - 6, {
        font: "mono",
        size: 10.5,
        color: t.muted,
      });
      c.line(sch.x + 48, y + rh, sch.x + sch.w, y + rh, t.line, 0.8);
    }

    // Middle
    const c2x = CX + c1w + GAP;
    const c2w = 400;
    const tp = c.card(c2x, BODY_Y, c2w, 200, "Top 3");
    for (let i = 0; i < 3; i++) {
      const y = tp.y + i * 46;
      c.circle(tp.x + 12, y + 22, 12, { fill: t.accentSoft });
      c.text(String(i + 1), tp.x, y + 14.5, {
        font: "monoMedium",
        size: 12,
        color: t.accent,
        width: 24,
        align: "center",
      });
      c.line(tp.x + 36, y + 36, tp.x + tp.w, y + 36, t.line, 0.8);
    }
    const tdY = BODY_Y + 200 + GAP;
    const tdH = 400;
    const td = c.card(c2x, tdY, c2w, tdH, "To-do");
    c.checklist(td.x, td.y - 8, td.w, Math.floor(td.h / 34), 34);
    const grY = tdY + tdH + GAP;
    const gr = c.card(c2x, grY, c2w, BODY_B - grY, "Grateful for");
    c.ruled(gr.x, gr.y - 8, gr.w, gr.h, 32);

    // Right
    const c3x = c2x + c2w + GAP;
    const c3w = CR - c3x;
    const nh = 620;
    const nb = c.card(c3x, BODY_Y, c3w, nh, "Notes");
    c.dots(nb.x - 8, nb.y - 10, nb.w + 16, nb.h + 6, 22);
    const my = BODY_Y + nh + GAP;
    const mb = c.card(c3x, my, c3w, BODY_B - my, "Mood");
    c.label("Water", mb.x + 176, my + 18);
    for (let i = 0; i < 5; i++)
      c.circle(mb.x + 11 + i * 31, mb.y + 26, 10.5, { stroke: t.faint });
    for (let i = 0; i < 8; i++)
      c.rect(mb.x + 176 + i * 22, mb.y + 14, 13, 24, {
        r: 6.5,
        stroke: t.faint,
      });
  },

  projects(S) {
    const { c, t, go } = S;
    header(S, "Project planners", "Projects");
    const cw = (CW - GAP) / 2;
    const ch = (BODY_H - GAP * 3) / 4;
    for (let n = 1; n <= PROJECT_PAGES; n++) {
      const i = n - 1;
      const x = CX + (i % 2) * (cw + GAP);
      const y = BODY_Y + Math.floor(i / 2) * (ch + GAP);
      c.rect(x, y, cw, ch, { r: 14, fill: t.surface });
      c.label(`Project ${pad2(n)}`, x + 20, y + 18);
      c.line(x + 20, y + 70, x + cw - 150, y + 70, t.line, 1);
      c.line(x + 20, y + 112, x + cw - 150, y + 112, t.line, 0.8);
      c.label("Deadline", x + 20, y + ch - 36, { color: t.faint });
      c.line(x + 100, y + ch - 24, x + 260, y + ch - 24, t.line, 0.8);
      // Open button
      const bx = x + cw - 124;
      const by = y + ch / 2 - 22;
      c.rect(bx, by, 104, 44, { r: 22, fill: t.accent });
      c.text("Open", bx + 26, by + 13, {
        font: "bodySemi",
        size: 15,
        color: t.onAccent,
      });
      c.chevron(bx + 80, by + 22, "right", 5, t.onAccent);
      c.link(bx, by, 104, 44, go(`project-${n}`));
      c.link(x, y, 160, 40, go(`project-${n}`));
    }
  },

  project(S, p) {
    const { c, t, go } = S;
    header(S, "Project planner", `Project ${pad2(p.n)}`, [
      { chevron: "left", target: p.n > 1 ? go(`project-${p.n - 1}`) : null },
      { label: "All projects", target: go("projects") },
      {
        chevron: "right",
        target: p.n < PROJECT_PAGES ? go(`project-${p.n + 1}`) : null,
      },
    ]);
    const lw = 560;
    let y = BODY_Y;
    const nm = c.card(CX, y, lw, 120, "Project name");
    c.ruled(nm.x, nm.y - 4, nm.w, nm.h, 36);
    y += 120 + GAP;
    const oc = c.card(CX, y, lw, 170, "Outcome — what does done look like?");
    c.ruled(oc.x, oc.y - 6, oc.w, oc.h, 34);
    y += 170 + GAP;
    const half = (lw - GAP) / 2;
    for (const [i, title] of ["Start", "Deadline"].entries()) {
      const b = c.card(CX + i * (half + GAP), y, half, 96, title);
      c.line(b.x, b.y + 28, b.x + b.w, b.y + 28, t.line, 0.8);
    }
    y += 96 + GAP;
    const st = c.card(CX, y, lw, 92, "Status");
    ["Not started", "In progress", "On hold", "Done"].forEach((s, i) => {
      const sx = st.x + i * 132;
      c.checkbox(sx, st.y + 6);
      c.text(s, sx + 22, st.y + 5, { font: "body", size: 14, color: t.ink });
    });
    y += 92 + GAP;
    const rs = c.card(CX, y, lw, BODY_B - y, "Resources, people & links");
    c.ruled(rs.x, rs.y - 6, rs.w, rs.h, 34);

    const rx = CX + lw + GAP;
    const rw = CR - rx;
    const th = 520;
    const tk = c.card(rx, BODY_Y, rw, th, "Tasks");
    c.label("Due", tk.x + tk.w - 80, tk.y - 26, { color: t.faint });
    const rows = Math.floor(tk.h / 36);
    for (let i = 0; i < rows; i++) {
      const yy = tk.y - 6 + i * 36;
      c.checkbox(tk.x, yy + 14);
      c.line(tk.x + 26, yy + 30, tk.x + tk.w - 96, yy + 30, t.line, 0.8);
      c.line(tk.x + tk.w - 80, yy + 30, tk.x + tk.w, yy + 30, t.line, 0.8);
    }
    const ny = BODY_Y + th + GAP;
    const nb = c.card(rx, ny, rw, BODY_B - ny, "Notes");
    c.dots(nb.x - 8, nb.y - 10, nb.w + 16, nb.h + 6, 22);
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
      c.line(x + 40, y + rh - 14, x + cw - 150, y + rh - 14, t.line, 0.8);
      const style = n % 2 ? "Dot grid" : "Lined";
      c.text(style, x + cw - 136, y + rh / 2 - 7, {
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

  review(S) {
    const { c, dated, year } = S;
    header(S, dated ? `End of ${year}` : "End of the year", "Year in review");
    const cw = (CW - GAP * 2) / 3;
    const ch = (BODY_H - GAP) / 2;
    const cards = [
      "Biggest wins",
      "What I learned",
      "Proudest moment",
      "What I'm leaving behind",
      dated ? `Carrying into ${year + 1}` : "Carrying into next year",
      "Rate the year",
    ];
    cards.forEach((title, i) => {
      const x = CX + (i % 3) * (cw + GAP);
      const y = BODY_Y + Math.floor(i / 3) * (ch + GAP);
      const b = c.card(x, y, cw, ch, title);
      if (i === 5) {
        ratingRow(c, { ...b, h: 60 }, 10);
        c.label("One word for next year", b.x, b.y + 110);
        c.ruled(b.x, b.y + 120, b.w, b.h - 130, 40);
      } else c.ruled(b.x, b.y - 6, b.w, b.h, 34);
    });
  },
};

// ======================================================================
// Shared bits
// ======================================================================

function ratingRow(c, box, n) {
  const step = Math.min(44, box.w / n);
  for (let i = 0; i < n; i++) {
    const cx = box.x + 16 + i * step;
    c.circle(cx, box.y + 22, 15, { stroke: c.t.faint });
    c.text(String(i + 1), cx - 15, box.y + 16, {
      font: "mono",
      size: 11,
      color: c.t.muted,
      width: 30,
      align: "center",
    });
  }
}

/** Mini month calendar; optional per-date links to daily pages. */
function miniMonth(S, x, y, w, h, year, m, { links, size }) {
  const { c, t, go, weekStart, dayNames } = S;
  const rows = monthGrid(year, m, weekStart);
  const cw = w / 7;
  const rh = h / 7;
  dayNames.forEach((n, i) =>
    c.text(n[0], x + i * cw, y, {
      font: "mono",
      size: size - 1,
      color: t.faint,
      width: cw,
      align: "center",
    }),
  );
  rows.forEach((row, r) => {
    row.forEach((d, i) => {
      if (d.getUTCMonth() !== m) return;
      const cx = x + i * cw;
      const cy = y + (r + 1) * rh;
      c.text(String(d.getUTCDate()), cx, cy, {
        font: "mono",
        size,
        color: t.ink,
        width: cw,
        align: "center",
      });
      if (links) c.link(cx, cy - rh / 3, cw, rh, go(`day-${isoKey(d)}`));
    });
  });
}

function blankMini(S, x, y, w, h) {
  const { c, t, dayNames } = S;
  const cw = w / 7;
  const rh = (h - 18) / 6;
  dayNames.forEach((n, i) =>
    c.text(n[0], x + i * cw, y, {
      font: "mono",
      size: 10.5,
      color: t.faint,
      width: cw,
      align: "center",
    }),
  );
  for (let r = 0; r < 6; r++)
    for (let i = 0; i < 7; i++)
      c.rect(x + i * cw + cw / 2 - 9, y + 22 + r * rh, 18, rh - 8, {
        r: 4,
        stroke: t.line,
        lw: 0.8,
      });
}
