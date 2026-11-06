/**
 * Builds the spreadsheet products → scripts/sheets/out/
 *   <file>.xlsx        what buyers get (opens in Excel; imports into Google Sheets)
 *   demo/<file>.xlsx   the same with example data (tests + store screenshots)
 *
 *   node scripts/sheets/build.mjs
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildBudget, fillDemo as budgetDemo } from "./budget.mjs";
import { applyPrint } from "./print.mjs";
import { buildStudent, fillDemo as studentDemo } from "./student.mjs";
import { buildAdhd, fillDemo as adhdDemo } from "./adhd.mjs";
import { buildLife, fillDemo as lifeDemo } from "./life.mjs";
import { buildReading, fillDemo as readingDemo } from "./reading.mjs";
import { buildMeal, fillDemo as mealDemo } from "./meal.mjs";
import { buildCleaning, fillDemo as cleaningDemo } from "./cleaning.mjs";
import { buildFitness, fillDemo as fitnessDemo } from "./fitness.mjs";
import { buildBaby, fillDemo as babyDemo } from "./baby.mjs";
import { buildWedding, fillDemo as weddingDemo } from "./wedding.mjs";
import { buildShop, fillDemo as shopDemo } from "./shop.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const outDir = path.join(HERE, "out");
export const demoDir = path.join(outDir, "demo");

export const SHEETS = {
  budget: {
    slug: "budget-spreadsheet",
    file: "Makeready-Budget-Spreadsheet.xlsx",
    title: "Budget Spreadsheet",
    build: buildBudget,
    demo: budgetDemo,
  },
  student: {
    slug: "adhd-student-planner",
    file: "Makeready-ADHD-Student-Planner.xlsx",
    title: "ADHD Student Planner",
    build: buildStudent,
    demo: studentDemo,
  },
  adhd: {
    slug: "adhd-daily-planner",
    file: "Makeready-ADHD-Daily-Planner.xlsx",
    title: "ADHD Daily Planner",
    build: buildAdhd,
    demo: adhdDemo,
  },
  life: {
    slug: "life-planner-spreadsheet",
    file: "Makeready-Life-Planner-Spreadsheet.xlsx",
    title: "Life Planner",
    build: buildLife,
    demo: lifeDemo,
  },
  reading: {
    slug: "reading-tracker",
    file: "Makeready-Reading-Tracker.xlsx",
    title: "Reading Tracker",
    build: buildReading,
    demo: readingDemo,
  },
  meal: {
    slug: "meal-planner",
    file: "Makeready-Meal-Planner.xlsx",
    title: "Meal Planner",
    build: buildMeal,
    demo: mealDemo,
  },
  cleaning: {
    slug: "cleaning-schedule",
    file: "Makeready-Cleaning-Schedule.xlsx",
    title: "Cleaning Schedule",
    build: buildCleaning,
    demo: cleaningDemo,
  },
  fitness: {
    slug: "workout-weight-tracker",
    file: "Makeready-Workout-Weight-Tracker.xlsx",
    title: "Workout & Weight Tracker",
    build: buildFitness,
    demo: fitnessDemo,
  },
  baby: {
    slug: "pregnancy-baby-tracker",
    file: "Makeready-Pregnancy-Baby-Tracker.xlsx",
    title: "Pregnancy & Baby Tracker",
    build: buildBaby,
    demo: babyDemo,
  },
  wedding: {
    slug: "wedding-planner",
    file: "Makeready-Wedding-Planner.xlsx",
    title: "Wedding Planner",
    build: buildWedding,
    demo: weddingDemo,
  },
  shop: {
    slug: "small-business-sales-tracker",
    file: "Makeready-Sales-Tracker.xlsx",
    title: "Sales Tracker",
    build: buildShop,
    demo: shopDemo,
  },
};

export async function buildSheet(id) {
  const s = SHEETS[id];
  await mkdir(demoDir, { recursive: true });
  const wb = s.build();
  applyPrint(wb);
  await wb.xlsx.writeFile(path.join(outDir, s.file));
  const demo = s.build();
  s.demo(demo);
  applyPrint(demo);
  await demo.xlsx.writeFile(path.join(demoDir, s.file));
  return path.join(outDir, s.file);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ids = process.argv.slice(2).filter((a) => SHEETS[a]);
  for (const id of ids.length ? ids : Object.keys(SHEETS))
    console.log(await buildSheet(id));
}
