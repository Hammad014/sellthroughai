/**
 * Recalculates the demo workbooks in LibreOffice (headless) and checks the
 * results against an independent JavaScript calculation, plus a scan of
 * every sheet for formula errors.
 *
 *   node scripts/sheets/test.mjs   (run build.mjs first; needs LibreOffice)
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import ExcelJS from "exceljs";
import { CATEGORIES, DEBT_EXAMPLES, buildBudget, fillDemo } from "./budget.mjs";
import { SHEETS, demoDir } from "./build.mjs";
import { buildStudent, fillDemo as studentDemo } from "./student.mjs";
import { buildAdhd, fillDemo as adhdDemo } from "./adhd.mjs";
import { buildLife, fillDemo as lifeDemo } from "./life.mjs";

let fails = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "PASS" : "FAIL"} ${msg}`);
  if (!cond) fails++;
};
const near = (a, b) => Math.abs(Number(a) - Number(b)) < 0.011;

/** Recalculate a workbook in LibreOffice and load the computed values. */
export async function recalc(file) {
  const out = mkdtempSync(path.join(tmpdir(), "sheets-"));
  execFileSync(
    "soffice",
    ["--headless", "--calc", "--convert-to", "xlsx", "--outdir", out, file],
    { stdio: "ignore", timeout: 180000 },
  );
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path.join(out, path.basename(file)));
  return wb;
}

const value = (cell) => {
  const v = cell.value;
  if (v && typeof v === "object" && "formula" in v) return v.result;
  if (v && typeof v === "object" && "sharedFormula" in v) return v.result;
  return v;
};

/** Functions newer than Excel 2010 need an _xlfn. prefix in the file; we avoid them. */
const MODERN =
  /\b(MINIFS|MAXIFS|IFS|SWITCH|XLOOKUP|FILTER|SORT|UNIQUE|SEQUENCE|LET|TEXTJOIN|CONCAT)\(/i;
function scanModern(wb) {
  const found = [];
  wb.eachSheet((ws) =>
    ws.eachRow((row) =>
      row.eachCell((cell) => {
        const f = cell.value?.formula;
        if (f && MODERN.test(f)) found.push(`${ws.name}!${cell.address}`);
      }),
    ),
  );
  return found;
}

function scanErrors(wb) {
  const errors = [];
  wb.eachSheet((ws) =>
    ws.eachRow((row) =>
      row.eachCell((cell) => {
        const v = value(cell);
        const bad =
          (v && typeof v === "object" && "error" in v) ||
          (typeof v === "string" &&
            /^(#(REF|NAME|VALUE|DIV|N\/A|NUM|NULL)|Err:)/.test(v));
        if (bad) errors.push(`${ws.name}!${cell.address}=${JSON.stringify(v)}`);
      }),
    ),
  );
  return errors;
}

// ---- Budget --------------------------------------------------------------

/** Same payoff rules as the sheet, written independently. */
function simulateDebts(debts, extra, method) {
  const order = debts
    .map((d, i) => ({ ...d, i }))
    .sort(
      (a, b) =>
        (method === "Avalanche" ? b.rate - a.rate : a.balance - b.balance) ||
        a.i - b.i,
    );
  const bal = debts.map((d) => d.balance);
  const months = debts.map(() => null);
  const interest = debts.map(() => 0);
  const budget = debts.reduce((s, d) => s + d.min, 0) + extra;
  for (let m = 1; m <= 360 && bal.some((b) => b > 0); m++) {
    let left = budget;
    const owed = bal.map((b, i) => {
      const int = Math.round((b * debts[i].rate * 100) / 1200) / 100;
      interest[i] += int;
      const pay = Math.min(debts[i].min, b + int);
      left -= pay;
      return b + int - pay;
    });
    left = Math.max(0, left);
    for (const d of order) {
      const x = Math.min(owed[d.i], left);
      left -= x;
      owed[d.i] = Math.round((owed[d.i] - x) * 100) / 100;
    }
    owed.forEach((b, i) => {
      if (bal[i] > 0 && b <= 0 && months[i] === null) months[i] = m;
      bal[i] = b;
    });
  }
  return { months, interest };
}

async function testBudget() {
  const file = path.join(demoDir, SHEETS.budget.file);
  const rows = fillDemo(buildBudget()); // same rows the demo file holds
  const wb = await recalc(file);
  const errors = scanErrors(wb);
  ok(
    errors.length === 0,
    `budget: no formula errors ${errors.slice(0, 5).join(" ")}`,
  );
  const modern = scanModern(buildBudget());
  ok(
    modern.length === 0,
    `budget: only classic functions ${modern.slice(0, 3).join(" ")}`,
  );

  const typeOf = Object.fromEntries(CATEGORIES.map(([n, t]) => [n, t]));
  const sum = (pred) => rows.filter(pred).reduce((s, r) => s + r[3], 0);
  const inMonth = (m) => (r) => r[0].getUTCMonth() === m;

  const dash = wb.getWorksheet("Dashboard");
  const jan = { Income: 0, Need: 0, Want: 0, Savings: 0, Debt: 0 };
  for (const r of rows.filter(inMonth(0))) jan[typeOf[r[2]]] += r[3];
  ["Income", "Need", "Want", "Savings", "Debt"].forEach((t, i) =>
    ok(
      near(value(dash.getCell(`E${12 + i}`)), jan[t]),
      `dashboard Jan ${t}: ${value(dash.getCell(`E${12 + i}`))} = ${jan[t].toFixed(2)}`,
    ),
  );
  const left = jan.Income - jan.Need - jan.Want - jan.Savings - jan.Debt;
  ok(
    near(value(dash.getCell("G9")), left),
    `dashboard left over ${value(dash.getCell("G9"))} = ${left.toFixed(2)}`,
  );
  const groceries = sum((r) => r[2] === "Groceries" && inMonth(0)(r));
  const gRow = 20 + CATEGORIES.findIndex((c) => c[0] === "Groceries");
  ok(
    near(value(dash.getCell(`E${gRow}`)), groceries),
    `dashboard groceries ${value(dash.getCell(`E${gRow}`))}`,
  );
  ok(
    near(value(dash.getCell(`F${gRow}`)), 350 - groceries),
    "dashboard groceries left",
  );
  ok(
    String(value(dash.getCell(`G${gRow}`))).includes("█"),
    `progress bar renders: ${value(dash.getCell(`G${gRow}`))}`,
  );

  const setup = wb.getWorksheet("Setup");
  const planned = (t) =>
    CATEGORIES.filter((c) => c[1] === t).reduce((s, c) => s + c[2], 0);
  ok(
    near(
      value(setup.getCell("G16")),
      planned("Income") -
        ["Need", "Want", "Savings", "Debt"].reduce((s, t) => s + planned(t), 0),
    ),
    `setup left to assign ${value(setup.getCell("G16"))}`,
  );

  const year = wb.getWorksheet("Year");
  for (let m = 0; m < 3; m++) {
    const inc = sum((r) => typeOf[r[2]] === "Income" && inMonth(m)(r));
    ok(
      near(value(year.getCell(7, 3 + m)), inc),
      `year income month ${m + 1}: ${value(year.getCell(7, 3 + m))}`,
    );
  }
  const totalIncome = sum((r) => typeOf[r[2]] === "Income");
  ok(
    near(value(year.getCell("O7")), totalIncome),
    `year income total ${value(year.getCell("O7"))}`,
  );

  const tx = wb.getWorksheet("Transactions");
  ok(value(tx.getCell("F6")) === typeOf[rows[0][2]], "transaction type lookup");

  const bills = wb.getWorksheet("Bills");
  ok(
    near(value(bills.getCell("E5")), 1000 + 100 + 15 + 70),
    `paycheck 1 bills ${value(bills.getCell("E5"))}`,
  );
  ok(
    near(
      value(bills.getCell("G42")),
      1000 + 100 + 15 + 70 + 35 + 50 + 25 + 150 + 120,
    ),
    `bills paid Jan ${value(bills.getCell("G42"))}`,
  );
  ok(
    value(bills.getCell("S11")) === "3/12",
    `bill paid count ${value(bills.getCell("S11"))}`,
  );

  const debt = wb.getWorksheet("Debt Payoff");
  const debts = DEBT_EXAMPLES.map(([, balance, rate, min]) => ({
    balance,
    rate,
    min,
  }));
  for (const method of ["Snowball"]) {
    const sim = simulateDebts(debts, 200, method);
    sim.months.forEach((m, i) =>
      ok(
        value(debt.getCell(`G${10 + i}`)) === m,
        `debt ${i + 1} paid off in month ${value(debt.getCell(`G${10 + i}`))} (expected ${m})`,
      ),
    );
    sim.interest.forEach((x, i) =>
      ok(
        near(value(debt.getCell(`I${10 + i}`)), x),
        `debt ${i + 1} interest ${value(debt.getCell(`I${10 + i}`))} ≈ ${x.toFixed(2)}`,
      ),
    );
    const order = [2, 1, 3, 4]; // snowball: store card (600) first, then credit card, car, student
    order.forEach((o, i) =>
      ok(
        value(debt.getCell(`F${10 + i}`)) === o,
        `snowball order debt ${i + 1} = ${value(debt.getCell(`F${10 + i}`))}`,
      ),
    );
  }
  // Same debts, Avalanche method.
  const av = buildBudget();
  fillDemo(av);
  av.getWorksheet("Debt Payoff").getCell("C5").value = "Avalanche";
  av.getWorksheet("Debt Payoff").getCell("D13").value = 30; // student loan now costliest
  const avFile = path.join(
    mkdtempSync(path.join(tmpdir(), "sheets-av-")),
    SHEETS.budget.file,
  );
  await av.xlsx.writeFile(avFile);
  const avDebt = (await recalc(avFile)).getWorksheet("Debt Payoff");
  const avDebts = debts.map((d, i) => (i === 3 ? { ...d, rate: 30 } : d));
  const avSim = simulateDebts(avDebts, 200, "Avalanche");
  const snSim = simulateDebts(avDebts, 200, "Snowball");
  ok(
    value(avDebt.getCell("F13")) === 1,
    `avalanche puts the 30% loan first: order ${value(avDebt.getCell("F13"))}`,
  );
  avSim.months.forEach((m, i) =>
    ok(
      value(avDebt.getCell(`G${10 + i}`)) === m,
      `avalanche debt ${i + 1} month ${value(avDebt.getCell(`G${10 + i}`))} (expected ${m})`,
    ),
  );
  const sumI = (x) => x.interest.reduce((a, b) => a + b, 0);
  ok(
    near(value(avDebt.getCell("E21")), sumI(avSim)),
    `avalanche total interest ${value(avDebt.getCell("E21"))} ≈ ${sumI(avSim).toFixed(2)}`,
  );
  ok(
    sumI(avSim) < sumI(snSim),
    `avalanche beats snowball on interest: ${sumI(avSim).toFixed(2)} < ${sumI(snSim).toFixed(2)}`,
  );

  const plan = wb.getWorksheet("Debt Plan");
  const total0 = debts.reduce((s, d) => s + d.balance, 0);
  ok(
    Number(value(plan.getCell("K6"))) < total0 &&
      Number(value(plan.getCell("K6"))) > total0 - 1000,
    `debt plan month 1 total ${value(plan.getCell("K6"))}`,
  );

  const sav = wb.getWorksheet("Savings");
  const ef = sum((r) => r[2] === "Emergency fund");
  ok(
    near(value(sav.getCell("F7")), ef),
    `savings added this year ${value(sav.getCell("F7"))}`,
  );
  ok(near(value(sav.getCell("G7")), 1200 + ef), "savings total saved");

  const nw = wb.getWorksheet("Net Worth");
  const nwRow = 25;
  ok(
    near(
      value(nw.getCell(`C${nwRow}`)),
      1850 + 1350 + 6400 + 18200 + 9500 - (3110 + 8350 + 13950),
    ),
    `net worth Jan ${value(nw.getCell(`C${nwRow}`))}`,
  );
}

// ---- Student planner ----------------------------------------------------

async function testStudent() {
  const wb = await recalc(path.join(demoDir, SHEETS.student.file));
  const errors = scanErrors(wb);
  ok(
    errors.length === 0,
    `student: no formula errors ${errors.slice(0, 5).join(" ")}`,
  );
  const modern = scanModern(buildStudent());
  ok(
    modern.length === 0,
    `student: only classic functions ${modern.slice(0, 3).join(" ")}`,
  );
  const { tasks } = studentDemo(buildStudent());
  const open = tasks
    .map((t, i) => ({
      cls: t[0],
      task: t[1],
      due: t[3],
      status: t[4],
      grade: t[7],
      i,
    }))
    .filter((t) => t.status !== "Done")
    .sort((a, b) => a.due - b.due || a.i - b.i);
  const today = wb.getWorksheet("Today");
  open
    .slice(0, 12)
    .forEach((t, k) =>
      ok(
        value(today.getCell(`D${11 + k}`)) === t.task,
        `next up #${k + 1}: ${value(today.getCell(`D${11 + k}`))}`,
      ),
    );
  ok(
    [null, ""].includes(value(today.getCell(`D${11 + open.length}`)) ?? null),
    "next up stops after the last open task",
  );
  ok(
    value(today.getCell("F11")) === "2 days late",
    `overdue wording: ${value(today.getCell("F11"))}`,
  );
  ok(
    value(today.getCell("F12")) === "Today",
    `today wording: ${value(today.getCell("F12"))}`,
  );
  ok(
    value(today.getCell("F13")) === "Tomorrow",
    `tomorrow wording: ${value(today.getCell("F13"))}`,
  );
  ok(
    value(today.getCell("G16")) === "Decide the first 5-minute step",
    "blank first step gets a default",
  );
  ok(
    value(today.getCell("B8")) === open.filter((t) => t.due < 0).length,
    `overdue count ${value(today.getCell("B8"))}`,
  );
  ok(
    value(today.getCell("D8")) ===
      open.filter((t) => t.due >= 0 && t.due <= 7).length,
    `due in 7 days ${value(today.getCell("D8"))}`,
  );
  ok(
    value(today.getCell("E8")) === tasks.filter((t) => t[4] === "Done").length,
    `done count ${value(today.getCell("E8"))}`,
  );

  // This Week: today's column lists the task due today; past days in the week list overdue ones.
  const wk = wb.getWorksheet("This Week");
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // Monday = 0
  const col = String.fromCharCode(66 + dow);
  const dueToday = open
    .filter((t) => t.due === 0)
    .map((t) => `${t.cls}: ${t.task}`);
  ok(
    value(wk.getCell(`${col}7`)) === dueToday[0],
    `this week, today's column: ${value(wk.getCell(`${col}7`))}`,
  );
  const thisWeek = open.filter(
    (t) => t.due - -dow >= 0 && t.due + dow < 7,
  ).length;
  let shown = 0;
  for (let d = 0; d < 7; d++)
    for (let k = 7; k <= 14; k++)
      if (value(wk.getCell(`${String.fromCharCode(66 + d)}${k}`))) shown++;
  ok(
    shown === thisWeek,
    `this week shows ${shown} open tasks (expected ${thisWeek})`,
  );

  const cls = wb.getWorksheet("Classes");
  const calc1 = tasks.filter((t) => t[0] === "Calculus I");
  ok(
    value(cls.getCell("F8")) === calc1.length,
    `calculus tasks ${value(cls.getCell("F8"))}`,
  );
  ok(
    value(cls.getCell("G8")) === calc1.filter((t) => t[4] === "Done").length,
    "calculus done",
  );
  ok(
    near(value(cls.getCell("K8")), 88),
    `calculus avg grade ${value(cls.getCell("K8"))}`,
  );
  ok(
    value(cls.getCell("L8")) === 50,
    `calculus focus minutes ${value(cls.getCell("L8"))}`,
  );
  const nextDue = value(cls.getCell("J8"));
  const expect = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 2),
  );
  ok(
    nextDue instanceof Date &&
      nextDue.toISOString().slice(0, 10) === expect.toISOString().slice(0, 10),
    `calculus next due ${nextDue?.toISOString?.().slice(0, 10)}`,
  );

  const ex = wb.getWorksheet("Exams");
  ok(
    value(ex.getCell("G6")) === "9 days",
    `exam countdown ${value(ex.getCell("G6"))}`,
  );
  // Singular wording: a task one day late, an exam tomorrow.
  const one = buildStudent();
  const oneDay = studentDemo(one).day;
  one.getWorksheet("Assignments").getCell("E6").value = oneDay(-1);
  one.getWorksheet("Exams").getCell("D6").value = oneDay(1);
  const oneFile = path.join(
    mkdtempSync(path.join(tmpdir(), "sheets-one-")),
    SHEETS.student.file,
  );
  await one.xlsx.writeFile(oneFile);
  const oneWb = await recalc(oneFile);
  const late = value(oneWb.getWorksheet("Today").getCell("F11"));
  ok(late === "1 day late", `singular late: ${late}`);
  const soon = value(oneWb.getWorksheet("Exams").getCell("G6"));
  ok(soon === "Tomorrow", `exam tomorrow: ${soon}`);
  const fl = wb.getWorksheet("Focus Log");
  ok(
    value(fl.getCell("B6")) === 25,
    `focus minutes today ${value(fl.getCell("B6"))}`,
  );
  ok(
    near(value(fl.getCell("E6")), 165 / 60),
    `focus hours all term ${value(fl.getCell("E6"))}`,
  );
}

// ---- ADHD Daily Planner -------------------------------------------------

/** Current (alive through today or yesterday) and best streak of an "x." string. */
function streaks(p, length = 21) {
  const days = [...p.padEnd(length, ".")].map((c) => c === "x");
  let best = 0;
  let run = 0;
  const runs = days.map((d) => {
    run = d ? run + 1 : 0;
    best = Math.max(best, run);
    return run;
  });
  const t = runs.length - 1;
  return { current: Math.max(runs[t], runs[t - 1]), best, today: days[t] };
}

async function testAdhd() {
  const wb = await recalc(path.join(demoDir, SHEETS.adhd.file));
  const errors = scanErrors(wb);
  ok(
    errors.length === 0,
    `adhd: no formula errors ${errors.slice(0, 5).join(" ")}`,
  );
  const modern = scanModern(buildAdhd());
  ok(
    modern.length === 0,
    `adhd: only classic functions ${modern.slice(0, 3).join(" ")}`,
  );
  const { items, pattern } = adhdDemo(buildAdhd());

  const today = wb.getWorksheet("Today");
  const open = items.filter((i) => i[1] === "Today" && i[4] !== "✓");
  open.forEach((it, k) =>
    ok(
      value(today.getCell(`C${18 + k}`)) === it[0],
      `today list #${k + 1}: ${value(today.getCell(`C${18 + k}`))}`,
    ),
  );
  ok(
    [null, ""].includes(value(today.getCell(`C${18 + open.length}`)) ?? null),
    "today list stops after the last one",
  );
  ok(
    value(today.getCell("F18")) === open[0][3],
    `tiny first step: ${value(today.getCell("F18"))}`,
  );
  ok(
    String(value(today.getCell("F7"))).startsWith("Steady"),
    `energy 3 suggestion: ${value(today.getCell("F7"))}`,
  );
  ok(
    value(today.getCell("B10")) === 2 + open.length,
    `to do today: ${value(today.getCell("B10"))} (expected ${2 + open.length})`,
  );

  const s = pattern.map(streaks);
  const hab = wb.getWorksheet("Habits");
  s.forEach((x, h) => {
    const col = String.fromCharCode(67 + h);
    // exceljs drops a cached result of exactly 0 when reading, hence ?? 0.
    ok(
      (value(hab.getCell(`${col}7`)) ?? 0) === x.current,
      `habit ${h + 1} current streak ${value(hab.getCell(`${col}7`))} (expected ${x.current})`,
    );
    ok(
      value(hab.getCell(`${col}8`)) === x.best,
      `habit ${h + 1} best streak ${value(hab.getCell(`${col}8`))} (expected ${x.best})`,
    );
    ok(
      value(today.getCell(`D${32 + h}`)) === (x.today ? "✓" : "–"),
      `today shows habit ${h + 1} ${value(today.getCell(`D${32 + h}`))}`,
    );
  });
  const ticked = s.filter((x) => x.today).length;
  ok(
    value(today.getCell("D10")) === `${ticked} / ${pattern.length}`,
    `habits card ${value(today.getCell("D10"))}`,
  );

  const rt = wb.getWorksheet("Routines");
  ok(
    value(rt.getCell("C14")) === 29,
    `morning routine minutes ${value(rt.getCell("C14"))}`,
  );
  ok(
    value(rt.getCell("D14")) === "3/5",
    `morning steps done Monday ${value(rt.getCell("D14"))}`,
  );

  ok(
    value(today.getCell("F10")) === 40,
    `focus today ${value(today.getCell("F10"))}`,
  );
  const fl = wb.getWorksheet("Focus Log");
  ok(
    near(value(fl.getCell("E6")), 115 / 60),
    `focus all time ${value(fl.getCell("E6"))}`,
  );
}

// ---- Life Planner --------------------------------------------------------

async function testLife() {
  const wb = await recalc(path.join(demoDir, SHEETS.life.file));
  const errors = scanErrors(wb);
  ok(
    errors.length === 0,
    `life: no formula errors ${errors.slice(0, 5).join(" ")}`,
  );
  const modern = scanModern(buildLife());
  ok(
    modern.length === 0,
    `life: only classic functions ${modern.slice(0, 3).join(" ")}`,
  );
  const { tasks, pattern } = lifeDemo(buildLife());

  const goals = wb.getWorksheet("Goals");
  const expectGoals = [
    ["Run a 10k", 3, 1, "Sign up for a 10k race"],
    ["Save a 3-month emergency fund", 2, 1, "Automate a monthly transfer"],
    ["Read 12 books", 2, 1, "Finish book 1"],
  ];
  expectGoals.forEach(([name, steps, done, next], i) => {
    const r = 6 + i;
    ok(
      value(goals.getCell(`F${r}`)) === steps &&
        value(goals.getCell(`G${r}`)) === done,
      `${name}: ${value(goals.getCell(`G${r}`))}/${value(goals.getCell(`F${r}`))} steps`,
    );
    ok(
      value(goals.getCell(`J${r}`)) === next,
      `${name} next step: ${value(goals.getCell(`J${r}`))}`,
    );
  });

  const dash = wb.getWorksheet("Dashboard");
  ok(
    near(value(dash.getCell("B8")), 3 / 7),
    `goals progress ${value(dash.getCell("B8"))}`,
  );
  const all = tasks.flatMap((l) => l.filter((_, i) => i % 2 === 0));
  const done = tasks
    .flatMap((l) => l.filter((_, i) => i % 2 === 1))
    .filter((x) => x === "✓");
  ok(
    near(value(dash.getCell("C8")), done.length / all.length),
    `this week ${value(dash.getCell("C8"))} = ${done.length}/${all.length}`,
  );
  ok(
    value(dash.getCell("B11")) === "Finish the Q1 budget",
    `top 3 shows: ${value(dash.getCell("B11"))}`,
  );
  ok(value(dash.getCell("E12")) === "✓", "top 3 done tick shows");
  ok(
    value(wb.getWorksheet("Weekly Plan").getCell("B21")) === "2 of 4 done",
    `day count: ${value(wb.getWorksheet("Weekly Plan").getCell("B21"))}`,
  );

  const upcoming = [
    "Project deadline",
    "Dentist 4pm",
    "Mum's birthday",
    "Weekend in Lisbon",
  ];
  upcoming.forEach((what, k) =>
    ok(
      value(dash.getCell(`B${28 + k}`)) === what,
      `coming up #${k + 1}: ${value(dash.getCell(`B${28 + k}`))}`,
    ),
  );
  ok(
    [null, ""].includes(value(dash.getCell("B32")) ?? null),
    "past dates are not shown",
  );
  ok(
    value(dash.getCell("C28")) === "Tomorrow",
    `first date wording: ${value(dash.getCell("C28"))}`,
  );
  ok(
    value(dash.getCell("C30")) === "In 10 days",
    `birthday rolls over: ${value(dash.getCell("C30"))}`,
  );
  ok(
    value(dash.getCell("F8")) === "Tomorrow",
    `next date card: ${value(dash.getCell("F8"))}`,
  );

  const hab = wb.getWorksheet("Habits");
  pattern
    .map((p) => streaks(p, 10))
    .forEach((x, h) => {
      const col = String.fromCharCode(67 + h);
      ok(
        (value(hab.getCell(`${col}7`)) ?? 0) === x.current,
        `life habit ${h + 1} streak ${value(hab.getCell(`${col}7`)) ?? 0} (expected ${x.current})`,
      );
      ok(
        value(dash.getCell(`C${35 + h}`)) === (x.today ? "✓" : "–"),
        `dashboard habit ${h + 1}: ${value(dash.getCell(`C${35 + h}`))}`,
      );
    });
  ok(
    near(value(wb.getWorksheet("Monthly Review").getCell("C20")), 7),
    `monthly average ${value(wb.getWorksheet("Monthly Review").getCell("C20"))}`,
  );
}

await testBudget();
await testStudent();
await testAdhd();
await testLife();
console.log(fails ? `${fails} FAILED` : "ALL PASSED");
if (fails) process.exit(1);
