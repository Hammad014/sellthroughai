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

await testBudget();
await testStudent();
console.log(fails ? `${fails} FAILED` : "ALL PASSED");
if (fails) process.exit(1);
