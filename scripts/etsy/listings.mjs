/**
 * The Etsy shop's niche: planners and spreadsheets. (Prompt packs, guides,
 * the AI course and the automation kit are sold on the website only.)
 *
 * Etsy listing details per product: what goes in the listing form (title,
 * tags, price) and how the files are packaged. The description is built
 * from the product's own copy (catalog.mjs).
 *
 * Etsy limits: title ≤ 140 chars, 13 tags of ≤ 20 chars, 5 files ≤ 20 MB.
 */

/** kind: planner | webapp | sheet | bundle (of planners) */
export const LISTINGS = {
  // ---- Planners ----------------------------------------------------------
  "clarity-digital-planner": {
    kind: "planner",
    price: 12.99,
    title:
      "2027 Digital Planner, Hyperlinked iPad Planner for GoodNotes & Notability, Undated Option, Daily Weekly Monthly, Light & Dark",
    tags: [
      "digital planner",
      "2027 planner",
      "goodnotes planner",
      "ipad planner",
      "hyperlinked planner",
      "undated planner",
      "daily planner",
      "weekly planner",
      "notability planner",
      "dark mode planner",
      "minimalist planner",
      "goal planner",
      "android planner",
    ],
  },
  "focus-adhd-digital-planner": {
    kind: "planner",
    price: 11.99,
    title:
      "ADHD Digital Planner 2027, Hyperlinked GoodNotes Planner, Brain Dump, Time Blocks, Task Breakdown, Undated, Light & Dark",
    tags: [
      "adhd planner",
      "digital planner",
      "adhd digital planner",
      "goodnotes planner",
      "ipad planner",
      "2027 planner",
      "undated planner",
      "brain dump",
      "time blocking",
      "neurodivergent",
      "focus planner",
      "habit tracker",
      "daily planner",
    ],
  },
  "budget-digital-planner": {
    kind: "planner",
    price: 9.99,
    title:
      "Digital Budget Planner 2027, Hyperlinked GoodNotes Finance Planner, Bill Tracker, Savings & Debt Payoff, Undated Option",
    tags: [
      "budget planner",
      "digital budget",
      "finance planner",
      "goodnotes planner",
      "ipad planner",
      "bill tracker",
      "savings tracker",
      "debt payoff",
      "expense tracker",
      "2027 planner",
      "money planner",
      "no spend challenge",
      "undated planner",
    ],
  },
  "life-planner-web-app": {
    kind: "webapp",
    app: "planner",
    price: 14.99,
    title:
      "Life Planner for Your Computer, Interactive Daily Weekly Monthly Planner With Habit Tracker, Goals & Budget, Saves Automatically",
    tags: [
      "digital planner",
      "life planner",
      "interactive planner",
      "daily planner",
      "weekly planner",
      "habit tracker",
      "budget planner",
      "goal planner",
      "to do list",
      "productivity",
      "planner for laptop",
      "2027 planner",
      "undated planner",
    ],
  },
  // ---- Spreadsheets (Google Sheets + Excel) ------------------------------
  "budget-spreadsheet": {
    kind: "sheet",
    sheet: "budget",
    price: 11.99,
    title:
      "Budget Spreadsheet Google Sheets & Excel, Paycheck Budget, Debt Snowball Calculator, Sinking Funds, Bill Tracker, Monthly Budget Template",
    tags: [
      "budget spreadsheet",
      "google sheets budget",
      "budget template",
      "excel budget",
      "paycheck budget",
      "debt snowball",
      "sinking funds",
      "bill tracker",
      "monthly budget",
      "zero based budget",
      "savings tracker",
      "net worth tracker",
      "personal finance",
    ],
  },
  "adhd-student-planner": {
    kind: "sheet",
    sheet: "student",
    price: 9.99,
    title:
      "ADHD Student Planner Spreadsheet, Google Sheets & Excel Assignment Tracker, College Homework Planner, Exam Countdown, Study Log",
    tags: [
      "adhd planner",
      "student planner",
      "assignment tracker",
      "college planner",
      "google sheets",
      "homework planner",
      "study planner",
      "adhd student",
      "exam tracker",
      "academic planner",
      "excel template",
      "university planner",
      "study tracker",
    ],
  },
  "new-year-planner-bundle": {
    kind: "bundle",
    price: 24.99,
    title:
      "2027 Digital Planner Bundle: Life Planner + ADHD Planner + Budget Planner, Hyperlinked GoodNotes iPad Planners, Light & Dark",
    tags: [
      "planner bundle",
      "digital planner",
      "2027 planner",
      "adhd planner",
      "budget planner",
      "goodnotes planner",
      "ipad planner",
      "hyperlinked planner",
      "daily planner",
      "finance planner",
      "dark mode planner",
      "android planner",
      "new year planner",
    ],
  },
};

/** Fail loudly if a listing breaks Etsy's limits. */
export function checkListing(slug, l) {
  const errors = [];
  if (l.title.length > 140) errors.push(`title is ${l.title.length} chars`);
  if (l.tags.length !== 13) errors.push(`${l.tags.length} tags (need 13)`);
  for (const t of l.tags)
    if (t.length > 20) errors.push(`tag "${t}" is ${t.length} chars`);
  if (new Set(l.tags).size !== l.tags.length) errors.push("duplicate tags");
  if (errors.length) throw new Error(`${slug}: ${errors.join("; ")}`);
}
