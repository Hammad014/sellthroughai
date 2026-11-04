/**
 * The Etsy shop's niche: practical planners that do the work for the buyer
 * (spreadsheets and the web-app planner). The GoodNotes PDF planners, prompt
 * packs, guides, the AI course and the automation kit are website only.
 *
 * Etsy listing details per product: what goes in the listing form (title,
 * tags, price) and how the files are packaged. The description is built
 * from the product's own copy (catalog.mjs).
 *
 * Etsy limits: title ≤ 140 chars, 13 tags of ≤ 20 chars, 5 files ≤ 20 MB.
 */

/** kind: webapp | sheet */
export const LISTINGS = {
  // ---- Web app -----------------------------------------------------------
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

  "adhd-daily-planner": {
    kind: "sheet",
    sheet: "adhd",
    price: 9.99,
    title:
      "ADHD Daily Planner Spreadsheet, Google Sheets & Excel, Brain Dump, Habit Tracker, Routines, Dopamine Menu, Focus Planner Template",
    tags: [
      "adhd planner",
      "adhd daily planner",
      "brain dump",
      "habit tracker",
      "google sheets",
      "routine planner",
      "dopamine menu",
      "neurodivergent",
      "daily planner",
      "to do list",
      "focus planner",
      "excel template",
      "adhd tools",
    ],
  },
  "life-planner-spreadsheet": {
    kind: "sheet",
    sheet: "life",
    price: 11.99,
    title:
      "Life Planner Spreadsheet Google Sheets & Excel, Goal Tracker, Weekly Planner, Habit Tracker, Birthday Reminder, Undated Digital Planner",
    tags: [
      "life planner",
      "goal planner",
      "google sheets",
      "weekly planner",
      "habit tracker",
      "goal tracker",
      "digital planner",
      "excel planner",
      "undated planner",
      "monthly review",
      "productivity",
      "2027 planner",
      "planner template",
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
