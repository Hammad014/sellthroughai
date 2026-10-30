/**
 * Every planner the store sells, and everything the build / check / mockup /
 * publish scripts need to know about it. Add a planner here and the
 * pipeline picks it up.
 */
import { fileURLToPath } from "node:url";
import path from "node:path";
import { THEMES } from "./lib/pdf.mjs";
import { buildClarity } from "./clarity.mjs";
import { buildFocus } from "./focus.mjs";
import { buildBudget } from "./budget.mjs";

export const YEAR = 2027;
const OUT_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "out");

export const PLANNERS = {
  clarity: {
    name: "Clarity",
    slug: "clarity-digital-planner",
    build: buildClarity,
    themes: ["light", "dark"],
    /** Gallery: [variant index, page key, file, caption]. */
    shots: [
      [0, "home", "01-home", "Home hub — every month and section one tap away"],
      [
        0,
        "month-3",
        "02-monthly",
        "Monthly calendar — tap a date to open that day, a week number to open the week",
      ],
      [
        1,
        "week-14",
        "03-weekly-midnight",
        "Weekly spread in the Midnight theme",
      ],
      [
        0,
        "day-2027-04-05",
        "04-daily",
        "Daily page — schedule, top 3, to-do, notes, mood & water",
      ],
      [1, "habit-3", "05-habits-midnight", "Monthly habit tracker"],
      [0, "year", "06-year", "Year at a glance — all 365 dates are links"],
      [
        0,
        "goal-1",
        "07-goals",
        "Goal planners with milestones and action steps",
      ],
      [
        4,
        "month-3",
        "08-undated",
        "Undated edition — start any month, any year",
      ],
    ],
    /** Cover: a dark page tilted behind a light one. */
    cover: { back: [1, "month-3"], front: [0, "week-14"] },
    /** Mockup background gradient: [highlight, mid, deep, glow]. */
    palette: ["#2d5f93", "#173252", "#0c1626", "#5da9f2"],
  },
  focus: {
    name: "Focus",
    slug: "focus-adhd-digital-planner",
    build: buildFocus,
    themes: ["sage", "night"],
    shots: [
      [
        0,
        "day-2027-04-05",
        "01-daily",
        "Daily page — just 3 things, visual time blocks, brain dump, energy and wins",
      ],
      [
        1,
        "day-2027-04-06",
        "02-daily-night",
        "The same daily page in the Night theme",
      ],
      [
        0,
        "dump-3",
        "03-brain-dump",
        "Monthly brain dump — empty your head, then sort it into four boxes",
      ],
      [
        0,
        "week-14",
        "04-weekly",
        "Weekly page — one focus, must / should / could, habit streak",
      ],
      [
        0,
        "breakdown-1",
        "05-breakdown",
        "Task breakdowns turn scary tasks into tiny first steps",
      ],
      [
        0,
        "dopamine",
        "06-dopamine-menu",
        "Dopamine menu — your go-to list for flat days",
      ],
      [
        1,
        "month-3",
        "07-monthly-night",
        "Monthly calendar with one big goal and a reward",
      ],
      [
        0,
        "routines",
        "08-routines",
        "Morning, evening and weekly reset routines",
      ],
    ],
    cover: { back: [1, "dump-3"], front: [0, "day-2027-04-05"] },
    palette: ["#3c7d61", "#1d3b30", "#0d1a15", "#7fd3a8"],
  },
  budget: {
    name: "Budget",
    slug: "budget-digital-planner",
    build: buildBudget,
    themes: ["linen", "ink"],
    // Only the no-spend calendars show weekdays, so no Sunday-start files.
    editions: ["dated-mon", "undated"],
    shots: [
      [
        0,
        "month-0",
        "01-monthly-budget",
        "Monthly budget — income, bills, spending categories and what's left",
      ],
      [
        1,
        "month-1",
        "02-budget-ink",
        "The same budget page in the dark Ink theme",
      ],
      [
        0,
        "bills-0",
        "03-bills",
        "Bill tracker — due dates, amounts and a tick when it's paid",
      ],
      [
        0,
        "spend1-0",
        "04-spending",
        "Spending log — every purchase, need or want",
      ],
      [
        0,
        "saving-1",
        "05-savings",
        "Savings goals — shade a box every time you save",
      ],
      [
        0,
        "debt-1",
        "06-debt",
        "Debt payoff tracker — log payments and watch the balance drop",
      ],
      [
        0,
        "nospend-0",
        "07-no-spend",
        "No-spend challenge calendar for every month",
      ],
      [
        0,
        "year",
        "08-year",
        "Year at a glance — the whole year's money on one page",
      ],
    ],
    cover: { back: [1, "month-0"], front: [0, "saving-1"] },
    palette: ["#2f6f78", "#173740", "#0b1a1f", "#e3b25a"],
  },
};

export const outDir = (id) => path.join(OUT_ROOT, id);

const EDITIONS = {
  "dated-mon": { edition: "dated", weekStart: "mon" },
  "dated-sun": { edition: "dated", weekStart: "sun" },
  undated: { edition: "undated", weekStart: "mon" },
};

/** The files buyers receive (order = order shown in their library). */
export function variants(id) {
  const {
    name,
    themes,
    editions = ["dated-mon", "dated-sun", "undated"],
  } = PLANNERS[id];
  return editions
    .flatMap((e) => themes.map((theme) => ({ ...EDITIONS[e], theme })))
    .map((v) => ({
      ...v,
      file:
        v.edition === "dated"
          ? `${name}-Planner-${YEAR}-${v.weekStart === "mon" ? "Monday" : "Sunday"}-${THEMES[v.theme].name}.pdf`
          : `${name}-Planner-Undated-${THEMES[v.theme].name}.pdf`,
    }));
}

/** Planner ids named on the command line, or all of them. */
export function selected(argv = process.argv.slice(2)) {
  const ids = argv.filter((a) => PLANNERS[a]);
  return ids.length ? ids : Object.keys(PLANNERS);
}
