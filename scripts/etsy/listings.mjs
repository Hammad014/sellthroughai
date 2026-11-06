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

/** kind: webapp | sheet | sheetbundle (all the spreadsheets) */
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
      "Budget Spreadsheet Google Sheets & Excel + Printable Budget Planner, Paycheck Budget, Debt Snowball, Sinking Funds, Bill Tracker",
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
      "printable budget",
    ],
  },
  "adhd-student-planner": {
    kind: "sheet",
    sheet: "student",
    price: 9.99,
    title:
      "ADHD Student Planner Spreadsheet + Printable, Google Sheets & Excel Assignment Tracker, College Homework Planner, Exam Study Plan",
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
      "printable planner",
    ],
  },

  "adhd-daily-planner": {
    kind: "sheet",
    sheet: "adhd",
    price: 9.99,
    title:
      "ADHD Daily Planner Printable + Spreadsheet, Google Sheets & Excel, Brain Dump, Habit Tracker, Routines, Dopamine Menu",
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
      "adhd printable",
    ],
  },
  "life-planner-spreadsheet": {
    kind: "sheet",
    sheet: "life",
    price: 11.99,
    title:
      "Life Planner Printable + Spreadsheet, Google Sheets & Excel Goal Planner, Weekly Planner, Habit Tracker, Undated Digital Planner",
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
      "printable planner",
    ],
  },
  "reading-tracker": {
    kind: "sheet",
    sheet: "reading",
    price: 8.99,
    title:
      "Reading Tracker Spreadsheet + Printable Reading Journal, Google Sheets & Excel Book Log, Reading Challenge, Book Review Pages",
    tags: [
      "reading tracker",
      "reading journal",
      "book tracker",
      "reading log",
      "google sheets",
      "book journal",
      "reading challenge",
      "bookish gift",
      "book lover gift",
      "reading goal",
      "tbr list",
      "excel template",
      "printable journal",
    ],
  },
  "meal-planner": {
    kind: "sheet",
    sheet: "meal",
    price: 8.99,
    title:
      "Meal Planner Printable + Spreadsheet, Google Sheets & Excel Weekly Meal Plan, Automatic Grocery List by Aisle, Recipe Cards",
    tags: [
      "meal planner",
      "meal plan template",
      "grocery list",
      "google sheets",
      "weekly meal plan",
      "recipe organizer",
      "shopping list",
      "meal prep planner",
      "family meal plan",
      "food planner",
      "excel template",
      "dinner planner",
      "meal plan printable",
    ],
  },
  "planner-spreadsheet-bundle": {
    kind: "sheetbundle",
    price: 29.99,
    title:
      "Planner Spreadsheet Bundle + Printables, Google Sheets & Excel: Budget, Life Planner, ADHD, Student, Reading Tracker, Meal Planner",
    tags: [
      "planner bundle",
      "google sheets",
      "spreadsheet bundle",
      "budget spreadsheet",
      "adhd planner",
      "life planner",
      "student planner",
      "reading tracker",
      "meal planner",
      "habit tracker",
      "excel template",
      "digital planner",
      "printable planner",
    ],
  },
  "cleaning-schedule": {
    kind: "sheet",
    sheet: "cleaning",
    price: 7.99,
    title:
      "Cleaning Schedule Printable + Spreadsheet, Google Sheets & Excel Chore Chart, Cleaning Checklist, Declutter Challenge",
    tags: [
      "cleaning schedule",
      "chore chart",
      "cleaning checklist",
      "google sheets",
      "cleaning planner",
      "house cleaning",
      "chore tracker",
      "declutter",
      "home organization",
      "family chore chart",
      "weekly cleaning",
      "excel template",
      "cleaning printable",
    ],
  },
  "workout-weight-tracker": {
    kind: "sheet",
    sheet: "fitness",
    price: 8.99,
    title:
      "Workout and Weight Loss Tracker Printable + Spreadsheet, Google Sheets & Excel Fitness Planner, Gym Log, Workout Calendar",
    tags: [
      "workout tracker",
      "weight loss tracker",
      "fitness planner",
      "gym log",
      "google sheets",
      "workout log",
      "weight tracker",
      "fitness tracker",
      "strength training",
      "workout planner",
      "weight loss chart",
      "excel template",
      "fitness printable",
    ],
  },
  "pregnancy-baby-tracker": {
    kind: "sheet",
    sheet: "baby",
    price: 9.99,
    title:
      "Pregnancy Tracker Printable + Spreadsheet, Google Sheets & Excel, Hospital Bag Checklist, Appointments, Baby Feeding Log",
    tags: [
      "pregnancy tracker",
      "pregnancy planner",
      "baby tracker",
      "google sheets",
      "hospital bag list",
      "baby feeding log",
      "newborn tracker",
      "mom to be gift",
      "pregnancy journal",
      "baby sleep log",
      "due date",
      "excel template",
      "pregnancy printable",
    ],
  },
  "wedding-planner": {
    kind: "sheet",
    sheet: "wedding",
    price: 12.99,
    title:
      "Wedding Planner Printable + Spreadsheet, Google Sheets & Excel Wedding Budget, Guest List & RSVP Tracker, Wedding Checklist",
    tags: [
      "wedding planner",
      "wedding budget",
      "guest list",
      "rsvp tracker",
      "google sheets",
      "wedding checklist",
      "wedding planning",
      "bride to be gift",
      "engagement gift",
      "wedding organizer",
      "seating plan",
      "excel template",
      "wedding printable",
    ],
  },
  "small-business-sales-tracker": {
    kind: "sheet",
    sheet: "shop",
    price: 12.99,
    title:
      "Small Business Sales Tracker Spreadsheet + Printable, Google Sheets & Excel for Etsy Sellers, Profit, Expense & Inventory Log",
    tags: [
      "etsy seller tools",
      "sales tracker",
      "small business",
      "google sheets",
      "profit tracker",
      "expense tracker",
      "etsy fee calculator",
      "bookkeeping",
      "inventory tracker",
      "business planner",
      "etsy shop",
      "excel template",
      "business printable",
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
