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
  "reading-tracker": {
    kind: "sheet",
    sheet: "reading",
    price: 8.99,
    title:
      "Reading Tracker Spreadsheet, Google Sheets & Excel Book Log, Reading Goal, Reading Challenge, Book Journal, Digital Reading Journal",
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
      "digital download",
    ],
  },
  "meal-planner": {
    kind: "sheet",
    sheet: "meal",
    price: 8.99,
    title:
      "Meal Planner Spreadsheet, Google Sheets & Excel, Weekly Meal Plan With Automatic Grocery List by Aisle, Recipe Organizer Template",
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
      "digital download",
    ],
  },
  "planner-spreadsheet-bundle": {
    kind: "sheetbundle",
    price: 29.99,
    title:
      "Planner Spreadsheet Bundle, Google Sheets & Excel: Budget, Life Planner, ADHD Planner, Student Planner, Reading Tracker, Meal Planner",
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
      "productivity",
    ],
  },
  "cleaning-schedule": {
    kind: "sheet",
    sheet: "cleaning",
    price: 7.99,
    title:
      "Cleaning Schedule Spreadsheet, Google Sheets & Excel Chore Chart, House Cleaning Checklist, Weekly Cleaning Planner, Declutter Challenge",
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
      "digital download",
    ],
  },
  "workout-weight-tracker": {
    kind: "sheet",
    sheet: "fitness",
    price: 8.99,
    title:
      "Workout and Weight Loss Tracker Spreadsheet, Google Sheets & Excel Fitness Planner, Gym Log, Personal Bests, Weight Loss Chart",
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
      "digital download",
    ],
  },
  "pregnancy-baby-tracker": {
    kind: "sheet",
    sheet: "baby",
    price: 9.99,
    title:
      "Pregnancy Tracker Spreadsheet, Google Sheets & Excel, Week by Week, Appointments, Hospital Bag Checklist, Baby Feeding and Sleep Log",
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
      "new mom gift",
    ],
  },
  "wedding-planner": {
    kind: "sheet",
    sheet: "wedding",
    price: 12.99,
    title:
      "Wedding Planner Spreadsheet, Google Sheets & Excel, Wedding Budget, Guest List & RSVP Tracker, Wedding Checklist, Vendor Planner",
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
      "digital download",
    ],
  },
  "small-business-sales-tracker": {
    kind: "sheet",
    sheet: "shop",
    price: 12.99,
    title:
      "Etsy Seller Spreadsheet, Small Business Sales Tracker, Google Sheets & Excel, Profit and Expense Tracker With Etsy Fee Calculator",
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
      "digital download",
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
