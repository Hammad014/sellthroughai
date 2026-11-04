/**
 * Budget Spreadsheet System: one workbook for Excel and Google Sheets.
 *
 *   Start Here · Dashboard · Transactions · Setup · Year · Bills ·
 *   Debt Payoff · Debt Plan · Savings · Net Worth   (+ hidden DebtCalc)
 *
 * Buyers type in yellow cells only; everything else is a formula.
 */
import {
  C,
  DATE,
  MONEY,
  MONEY0,
  MONTHS,
  PCT,
  bar,
  calc,
  card,
  colName,
  header,
  input,
  list,
  note,
  put,
  sheet,
  title,
  workbook,
} from "./lib.mjs";
import { guideSheet } from "./blocks.mjs";

// ---- Shared ranges -------------------------------------------------------
const CAT0 = 11; // Setup category rows
const CAT1 = 50;
const TX0 = 6; // Transactions rows
const TX1 = 1505;
const DEBTS = 8;
const DEBT0 = 10; // Debt Payoff rows 10..17
const PLAN_MONTHS = 360;

const CATS = `Setup!$B$${CAT0}:$B$${CAT1}`;
const CAT_TYPES = `Setup!$B$${CAT0}:$C$${CAT1}`;
const YEAR = "Setup!$C$6";
const CUR = "Setup!$C$7";
const TXD = `Transactions!$B$${TX0}:$B$${TX1}`;
const TXC = `Transactions!$D$${TX0}:$D$${TX1}`;
const TXA = `Transactions!$E$${TX0}:$E$${TX1}`;
const TXT = `Transactions!$F$${TX0}:$F$${TX1}`;
const TYPES = ["Income", "Need", "Want", "Savings", "Debt"];
const DP = "'Debt Payoff'";

/** Money in/out for a type or category between two date cells. */
const sumBetween = (critRange, crit, from, to) =>
  `SUMIFS(${TXA},${critRange},${crit},${TXD},">="&${from},${TXD},"<="&${to})`;

// ---- Example content (buyers replace it) ---------------------------------
export const CATEGORIES = [
  ["Salary", "Income", 3000],
  ["Side income", "Income", 0],
  ["Rent / mortgage", "Need", 1000],
  ["Utilities", "Need", 120],
  ["Groceries", "Need", 350],
  ["Transport", "Need", 120],
  ["Insurance", "Need", 100],
  ["Phone & internet", "Need", 60],
  ["Health", "Need", 40],
  ["Eating out", "Want", 100],
  ["Shopping", "Want", 80],
  ["Entertainment", "Want", 50],
  ["Subscriptions", "Want", 30],
  ["Personal care", "Want", 40],
  ["Gifts", "Want", 30],
  ["Travel", "Want", 70],
  ["Emergency fund", "Savings", 150],
  ["Holiday fund", "Savings", 100],
  ["Christmas fund", "Savings", 50],
  ["Retirement", "Savings", 150],
  ["Credit card", "Debt", 150],
  ["Student loan", "Debt", 120],
];

const BILLS = [
  ["Rent", 1000, 1, "Paycheck 1", "No"],
  ["Car insurance", 100, 5, "Paycheck 1", "Yes"],
  ["Streaming", 15, 9, "Paycheck 1", "Yes"],
  ["Electricity", 70, 12, "Paycheck 1", "Yes"],
  ["Phone", 35, 18, "Paycheck 2", "Yes"],
  ["Water", 50, 20, "Paycheck 2", "No"],
  ["Internet", 25, 22, "Paycheck 2", "Yes"],
  ["Credit card", 150, 25, "Paycheck 2", "No"],
  ["Student loan", 120, 28, "Paycheck 2", "Yes"],
];

export const DEBT_EXAMPLES = [
  ["Credit card", 3200, 22.9, 90],
  ["Store card", 600, 26.9, 30],
  ["Car loan", 8500, 6.5, 250],
  ["Student loan", 14000, 5, 160],
];

const GOALS = [
  ["Emergency fund", 6000, "2027-12-31", 1200],
  ["Holiday fund", 1500, "2027-07-01", 200],
  ["Christmas fund", 600, "2027-12-01", 0],
];

const date = (s) => new Date(`${s}T00:00:00Z`);

// ======================================================================

export function buildBudget() {
  const wb = workbook();
  startHere(wb);
  dashboard(wb);
  transactions(wb);
  setup(wb);
  year(wb);
  bills(wb);
  debtPayoff(wb);
  debtPlan(wb);
  savings(wb);
  netWorth(wb);
  debtCalc(wb);
  return wb;
}

function startHere(wb) {
  guideSheet(
    wb,
    "Budget Planner",
    "by Makeready · works in Google Sheets and Excel",
    [
      ["", "HOW IT WORKS", "h"],
      [
        "1",
        "Setup: set your year and currency, then edit the categories and monthly budgets. Aim for “Left to assign” = 0, so all your income has a job.",
      ],
      [
        "2",
        "Bills: list your regular bills, choose which paycheck pays each one, and tick them off every month.",
      ],
      [
        "3",
        "Transactions: log money in and out. Pick a category from the dropdown; amounts are always positive. Two minutes a day, or once a week from your banking app.",
      ],
      [
        "4",
        "Dashboard: choose a month to see planned vs actual for every category, with progress bars.",
      ],
      [
        "5",
        "Year: all 12 months side by side, so you can spot where your money really goes.",
      ],
      [
        "6",
        "Debt Payoff: enter your debts, choose Snowball or Avalanche and see your debt-free date. Debt Plan shows every month.",
      ],
      [
        "7",
        "Savings: set goals and sinking funds and see how much to put aside each month.",
      ],
      ["8", "Net Worth: update once a month and watch it grow."],
      ["", ""],
      ["", "COLOUR KEY", "h"],
      [
        "",
        "Yellow cells are yours: type over the examples. Everything else calculates for you, so don't type over it.",
        "key",
      ],
      ["", ""],
      ["", "GOOD TO KNOW", "h"],
      [
        "•",
        "The categories, bills, debts and goals are examples. Replace them with your own; delete what you don't need.",
      ],
      [
        "•",
        "Savings goals count automatically when the goal has the same name as a Savings category.",
      ],
      [
        "•",
        "Renamed a category? Rename it in old transactions too, so they keep counting.",
      ],
      ["•", "Any currency works: just type numbers, no symbols."],
    ],
  );
}

function setup(wb) {
  const ws = sheet(wb, "Setup", {
    tab: C.blue,
    widths: [26, 12, 18, 3, 30, 16],
  });
  title(ws, "Setup", "Do this once. Yellow cells are yours to change.", 6);
  put(ws, "B5", "Your name");
  input(ws, "C5", "");
  ws.mergeCells("C5:D5");
  put(ws, "B6", "Year");
  input(ws, "C6", 2027, { align: "left" });
  put(ws, "B7", "Currency symbol");
  input(ws, "C7", "$", { align: "left" });
  note(
    ws,
    "B9",
    "Type decides where it counts: Income · Need (bills, essentials) · Want (fun, extras) · Savings · Debt (repayments).",
  );
  ws.mergeCells("B9:G9");

  header(ws, 10, 2, ["Category", "Type", { f: `"Monthly budget ("&$C$7&")"` }]);
  for (let r = CAT0; r <= CAT1; r++) {
    const ex = CATEGORIES[r - CAT0];
    input(ws, `B${r}`, ex ? ex[0] : null);
    input(ws, `C${r}`, ex ? ex[1] : null, { align: "center" });
    list(ws, `C${r}`, TYPES);
    input(ws, `D${r}`, ex ? ex[2] : null, { fmt: MONEY });
  }

  header(ws, 10, 6, ["Your plan each month", ""]);
  const plan = [
    [
      "Planned income",
      `SUMIF($C$${CAT0}:$C$${CAT1},"Income",$D$${CAT0}:$D$${CAT1})`,
    ],
    ["Needs", `SUMIF($C$${CAT0}:$C$${CAT1},"Need",$D$${CAT0}:$D$${CAT1})`],
    ["Wants", `SUMIF($C$${CAT0}:$C$${CAT1},"Want",$D$${CAT0}:$D$${CAT1})`],
    ["Savings", `SUMIF($C$${CAT0}:$C$${CAT1},"Savings",$D$${CAT0}:$D$${CAT1})`],
    [
      "Debt payments",
      `SUMIF($C$${CAT0}:$C$${CAT1},"Debt",$D$${CAT0}:$D$${CAT1})`,
    ],
    ["Left to assign", "G11-SUM(G12:G15)"],
  ];
  plan.forEach(([label, f], i) => {
    const r = 11 + i;
    const last = i === plan.length - 1;
    calc(ws, `F${r}`, label, { font: { bold: last } });
    calc(ws, `G${r}`, { f }, { fmt: MONEY, font: { bold: last } });
  });
  ws.addConditionalFormatting({
    ref: "G16",
    rules: [
      {
        type: "expression",
        formulae: ["ROUND(G16,2)=0"],
        style: {
          fill: {
            type: "pattern",
            pattern: "solid",
            bgColor: { argb: C.goodBg },
          },
        },
      },
      {
        type: "expression",
        formulae: ["G16<0"],
        style: {
          fill: {
            type: "pattern",
            pattern: "solid",
            bgColor: { argb: C.badBg },
          },
        },
      },
      {
        type: "expression",
        formulae: ["G16>0"],
        style: {
          fill: {
            type: "pattern",
            pattern: "solid",
            bgColor: { argb: C.warnBg },
          },
        },
      },
    ],
  });
  note(
    ws,
    "F17",
    "Zero-based budgeting: aim for 0, so all your income has a job.",
  );

  header(ws, 19, 6, ["50 / 30 / 20 check", ""]);
  [
    ["Needs (aim ≤ 50%)", 'IF($G$11=0,"",G12/$G$11)'],
    ["Wants (aim ≤ 30%)", 'IF($G$11=0,"",G13/$G$11)'],
    ["Savings + debt (aim ≥ 20%)", 'IF($G$11=0,"",(G14+G15)/$G$11)'],
  ].forEach(([label, f], i) => {
    calc(ws, `F${20 + i}`, label);
    calc(ws, `G${20 + i}`, { f }, { fmt: PCT });
  });
}

function transactions(wb) {
  const ws = sheet(wb, "Transactions", {
    tab: C.blue,
    widths: [13, 36, 24, 15, 12],
    freeze: 5,
  });
  title(
    ws,
    "Transactions",
    "Log money in and out. Amounts are always positive; the category decides if it's income or spending.",
    5,
  );
  header(ws, 5, 2, [
    "Date",
    "Description",
    "Category",
    { f: `"Amount ("&${CUR}&")"` },
    "Type",
  ]);
  for (let r = TX0; r <= TX1; r++) {
    input(ws, `B${r}`, null, { fmt: DATE, align: "center" });
    input(ws, `C${r}`, null);
    input(ws, `D${r}`, null);
    list(ws, `D${r}`, CATS);
    input(ws, `E${r}`, null, { fmt: MONEY });
    calc(
      ws,
      `F${r}`,
      {
        f: `IF(D${r}="","",IFERROR(VLOOKUP(D${r},${CAT_TYPES},2,FALSE),"Unknown"))`,
      },
      { align: "center", font: { color: { argb: C.muted } } },
    );
  }
  ws.addConditionalFormatting({
    ref: `F${TX0}:F${TX1}`,
    rules: [
      {
        type: "expression",
        formulae: [`F${TX0}="Unknown"`],
        style: { font: { color: { argb: C.bad }, bold: true } },
      },
    ],
  });
}

function dashboard(wb) {
  const ws = sheet(wb, "Dashboard", {
    tab: C.navy,
    widths: [24, 10, 14, 14, 14, 26, 8],
  });
  title(
    ws,
    "Monthly Dashboard",
    "Pick a month: everything below updates from your Transactions.",
    7,
  );
  put(ws, "B5", "Month", { font: { bold: true } });
  input(ws, "C5", "January", { font: { bold: true } });
  ws.mergeCells("C5:D5");
  list(ws, "C5", MONTHS);
  put(ws, "E5", { f: `${YEAR}` }, { font: { bold: true } });
  // Hidden helpers: first and last day of the chosen month.
  put(
    ws,
    "J5",
    {
      f: `DATE(${YEAR},MATCH($C$5,{${MONTHS.map((m) => `"${m}"`).join(",")}},0),1)`,
    },
    { fmt: DATE },
  );
  put(ws, "K5", { f: "EOMONTH($J$5,0)" }, { fmt: DATE });
  ws.getColumn(10).hidden = true;
  ws.getColumn(11).hidden = true;

  ws.getRow(8).height = 18;
  ws.getRow(9).height = 30;
  card(ws, "B8", "B9", "MONEY IN", { f: "E12" });
  card(ws, "C8", "C9", "MONEY OUT", { f: "E13+E14" });
  ws.mergeCells("C8:D8");
  ws.mergeCells("C9:D9");
  card(ws, "E8", "E9", "SAVED & DEBT", { f: "E15+E16" });
  ws.mergeCells("E8:F8");
  ws.mergeCells("E9:F9");
  card(ws, "G8", "G9", "LEFT OVER", { f: "E17" }, { tone: C.goodBg });
  ws.mergeCells("G8:H8");
  ws.mergeCells("G9:H9");

  header(ws, 11, 2, [
    "Summary",
    "",
    "Planned",
    "Actual",
    "Difference",
    "Progress",
    "%",
  ]);
  TYPES.forEach((t, i) => {
    const r = 12 + i;
    const label = {
      Income: "Income",
      Need: "Needs",
      Want: "Wants",
      Savings: "Savings",
      Debt: "Debt payments",
    }[t];
    calc(ws, `B${r}`, label, { font: { bold: true } });
    calc(ws, `C${r}`, t, { font: { color: { argb: C.white } } }); // type key (white)
    calc(
      ws,
      `D${r}`,
      {
        f: `SUMIF(Setup!$C$${CAT0}:$C$${CAT1},$C${r},Setup!$D$${CAT0}:$D$${CAT1})`,
      },
      { fmt: MONEY },
    );
    calc(
      ws,
      `E${r}`,
      { f: sumBetween(TXT, `$C${r}`, "$J$5", "$K$5") },
      { fmt: MONEY },
    );
    calc(
      ws,
      `F${r}`,
      { f: t === "Income" ? `E${r}-D${r}` : `D${r}-E${r}` },
      { fmt: MONEY },
    );
    calc(
      ws,
      `G${r}`,
      { f: bar(`IF(D${r}=0,"",E${r}/D${r})`) },
      { font: { color: { argb: C.blue } } },
    );
    calc(
      ws,
      `H${r}`,
      { f: `IF(D${r}=0,"",E${r}/D${r})` },
      { fmt: PCT, align: "right" },
    );
  });
  calc(ws, "B17", "Left over", { font: { bold: true } });
  calc(
    ws,
    "D17",
    { f: "D12-SUM(D13:D16)" },
    { fmt: MONEY, font: { bold: true } },
  );
  calc(
    ws,
    "E17",
    { f: "E12-SUM(E13:E16)" },
    { fmt: MONEY, font: { bold: true } },
  );

  header(ws, 19, 2, [
    "Category",
    "Type",
    "Budget",
    "Actual",
    "Left",
    "Progress",
    "%",
  ]);
  for (let i = 0; i <= CAT1 - CAT0; i++) {
    const r = 20 + i;
    const s = CAT0 + i;
    calc(ws, `B${r}`, { f: `IF(Setup!$B$${s}="","",Setup!$B$${s})` });
    calc(
      ws,
      `C${r}`,
      { f: `IF($B${r}="","",Setup!$C$${s})` },
      { align: "center", font: { color: { argb: C.muted }, size: 9 } },
    );
    calc(
      ws,
      `D${r}`,
      { f: `IF($B${r}="","",N(Setup!$D$${s}))` },
      { fmt: MONEY },
    );
    calc(
      ws,
      `E${r}`,
      { f: `IF($B${r}="","",${sumBetween(TXC, `$B${r}`, "$J$5", "$K$5")})` },
      { fmt: MONEY },
    );
    calc(
      ws,
      `F${r}`,
      { f: `IF($B${r}="","",IF($C${r}="Income",E${r}-D${r},D${r}-E${r}))` },
      { fmt: MONEY },
    );
    calc(
      ws,
      `G${r}`,
      { f: bar(`IF(OR($B${r}="",N(D${r})=0),"",E${r}/D${r})`) },
      { font: { color: { argb: C.blue } } },
    );
    calc(
      ws,
      `H${r}`,
      { f: `IF(OR($B${r}="",N(D${r})=0),"",E${r}/D${r})` },
      { fmt: PCT, align: "right" },
    );
  }
  const last = 20 + CAT1 - CAT0;
  ws.addConditionalFormatting({
    ref: `G12:G16 G20:G${last}`,
    rules: [
      {
        type: "expression",
        formulae: ['AND($C12<>"Income",N($H12)>1)'],
        style: { font: { color: { argb: C.bad } } },
      },
    ],
  });
  ws.addConditionalFormatting({
    ref: `F12:F16 F20:F${last}`,
    rules: [
      {
        type: "expression",
        formulae: ["N(F12)<0"],
        style: { font: { color: { argb: C.bad }, bold: true } },
      },
    ],
  });
}

function year(wb) {
  const ws = sheet(wb, "Year", {
    tab: C.blue,
    widths: [24, ...Array(12).fill(10), 12, 12],
    freeze: 6,
  });
  title(
    ws,
    "Year at a Glance",
    "Every month side by side, straight from your Transactions.",
    15,
  );
  header(ws, 6, 2, ["", ...MONTHS.map(() => ""), "Total", "Avg / month"]);
  for (let m = 0; m < 12; m++) {
    const cell = ws.getCell(6, 3 + m);
    cell.value = { formula: `DATE(${YEAR},${m + 1},1)` };
    cell.numFmt = "mmm";
  }
  const row = (r, label, f, bold) => {
    calc(ws, `B${r}`, label, { font: { bold } });
    for (let m = 0; m < 12; m++) {
      const c = colName(3 + m);
      calc(ws, `${c}${r}`, { f: f(c) }, { fmt: MONEY0, font: { bold } });
    }
    calc(
      ws,
      `O${r}`,
      { f: `IF($B${r}="","",SUM(C${r}:N${r}))` },
      { fmt: MONEY0, font: { bold: true } },
    );
    calc(
      ws,
      `P${r}`,
      {
        f: `IF($B${r}="","",IF(N(O${r})=0,0,O${r}/MAX(1,COUNTIF(C${r}:N${r},"<>0"))))`,
      },
      { fmt: MONEY0 },
    );
  };
  const LABEL = {
    Income: "Income",
    Need: "Needs",
    Want: "Wants",
    Savings: "Savings",
    Debt: "Debt payments",
  };
  TYPES.forEach((t, i) =>
    row(
      7 + i,
      LABEL[t],
      (c) => sumBetween(TXT, `"${t}"`, `${c}$6`, `EOMONTH(${c}$6,0)`),
      t === "Income",
    ),
  );
  row(12, "Left over", (c) => `${c}7-SUM(${c}8:${c}11)`, true);
  ws.addConditionalFormatting({
    ref: "C12:O12",
    rules: [
      {
        type: "expression",
        formulae: ["C12<0"],
        style: { font: { color: { argb: C.bad } } },
      },
    ],
  });

  header(ws, 14, 2, [
    "By category",
    ...MONTHS.map((m) => m.slice(0, 3)),
    "Total",
    "Avg / month",
  ]);
  for (let i = 0; i <= CAT1 - CAT0; i++) {
    const r = 15 + i;
    const s = CAT0 + i;
    calc(ws, `B${r}`, { f: `IF(Setup!$B$${s}="","",Setup!$B$${s})` });
    for (let m = 0; m < 12; m++) {
      const c = colName(3 + m);
      calc(
        ws,
        `${c}${r}`,
        {
          f: `IF($B${r}="","",${sumBetween(TXC, `$B${r}`, `${c}$6`, `EOMONTH(${c}$6,0)`)})`,
        },
        { fmt: MONEY0 },
      );
    }
    calc(
      ws,
      `O${r}`,
      { f: `IF($B${r}="","",SUM(C${r}:N${r}))` },
      { fmt: MONEY0, font: { bold: true } },
    );
    calc(
      ws,
      `P${r}`,
      {
        f: `IF($B${r}="","",IF(N(O${r})=0,0,O${r}/MAX(1,COUNTIF(C${r}:N${r},"<>0"))))`,
      },
      { fmt: MONEY0 },
    );
  }
}

function bills(wb) {
  const ws = sheet(wb, "Bills", {
    tab: C.blue,
    widths: [24, 12, 9, 13, 9, ...Array(12).fill(7), 8],
  });
  title(
    ws,
    "Bills & Paychecks",
    "List your bills, choose which paycheck pays each one, and tick them off every month.",
    18,
  );
  header(ws, 4, 2, ["Paycheck", "Amount", "", "Bills", "Left"]);
  const B0 = 11;
  const B1 = 40;
  ["Paycheck 1", "Paycheck 2"].forEach((p, i) => {
    const r = 5 + i;
    calc(ws, `B${r}`, `${p}${i ? " (mid-month)" : " (start of month)"}`);
    input(ws, `C${r}`, 1500, { fmt: MONEY });
    calc(
      ws,
      `E${r}`,
      { f: `SUMIF($E$${B0}:$E$${B1},"${p}",$C$${B0}:$C$${B1})` },
      { fmt: MONEY },
    );
    calc(ws, `F${r}`, { f: `C${r}-E${r}` }, { fmt: MONEY });
  });
  calc(ws, "B7", "Total", { font: { bold: true } });
  calc(ws, "C7", { f: "C5+C6" }, { fmt: MONEY, font: { bold: true } });
  calc(
    ws,
    "E7",
    { f: `SUM(C${B0}:C${B1})` },
    { fmt: MONEY, font: { bold: true } },
  );
  calc(ws, "F7", { f: "C7-E7" }, { fmt: MONEY, font: { bold: true } });
  ws.addConditionalFormatting({
    ref: "F5:F7",
    rules: [
      {
        type: "expression",
        formulae: ["F5<0"],
        style: { font: { color: { argb: C.bad }, bold: true } },
      },
    ],
  });

  header(ws, 10, 2, [
    "Bill",
    "Amount",
    "Due day",
    "Paid from",
    "Autopay",
    ...MONTHS.map((m) => m.slice(0, 3)),
    "Paid",
  ]);
  for (let r = B0; r <= B1; r++) {
    const ex = BILLS[r - B0];
    input(ws, `B${r}`, ex ? ex[0] : null);
    input(ws, `C${r}`, ex ? ex[1] : null, { fmt: MONEY });
    input(ws, `D${r}`, ex ? ex[2] : null, { align: "center" });
    input(ws, `E${r}`, ex ? ex[3] : null, { align: "center" });
    list(ws, `E${r}`, ["Paycheck 1", "Paycheck 2"]);
    input(ws, `F${r}`, ex ? ex[4] : null, { align: "center" });
    list(ws, `F${r}`, ["Yes", "No"]);
    for (let m = 0; m < 12; m++) {
      const c = colName(7 + m);
      input(ws, `${c}${r}`, null, { align: "center" });
      list(ws, `${c}${r}`, ["✓"]);
    }
    calc(
      ws,
      `S${r}`,
      { f: `IF(B${r}="","",COUNTIF(G${r}:R${r},"✓")&"/12")` },
      { align: "center" },
    );
  }
  ws.addConditionalFormatting({
    ref: `G${B0}:R${B1}`,
    rules: [
      {
        type: "expression",
        formulae: [`G${B0}="✓"`],
        style: {
          fill: {
            type: "pattern",
            pattern: "solid",
            bgColor: { argb: C.goodBg },
          },
          font: { color: { argb: C.good }, bold: true },
        },
      },
    ],
  });
  calc(ws, `B${B1 + 2}`, "Paid", { font: { bold: true } });
  calc(ws, `B${B1 + 3}`, "Still to pay", { font: { bold: true } });
  for (let m = 0; m < 12; m++) {
    const c = colName(7 + m);
    calc(
      ws,
      `${c}${B1 + 2}`,
      { f: `SUMIF(${c}${B0}:${c}${B1},"✓",$C$${B0}:$C$${B1})` },
      { fmt: MONEY0 },
    );
    calc(
      ws,
      `${c}${B1 + 3}`,
      { f: `SUM($C$${B0}:$C$${B1})-${c}${B1 + 2}` },
      { fmt: MONEY0 },
    );
  }
}

function debtPayoff(wb) {
  const ws = sheet(wb, "Debt Payoff", {
    tab: "FFC0392B",
    widths: [26, 14, 16, 16, 8, 10, 14, 14],
  });
  title(
    ws,
    "Debt Payoff",
    "Choose a method and see exactly when you'll be debt-free.",
    8,
  );
  put(ws, "B5", "Method", { font: { bold: true } });
  input(ws, "C5", "Snowball", { font: { bold: true } });
  list(ws, "C5", ["Snowball", "Avalanche"]);
  note(
    ws,
    "D5",
    "Snowball: smallest balance first, for quick wins. Avalanche: highest interest first, to pay the least interest.",
    { wrap: true },
  );
  ws.mergeCells("D5:I6");
  put(ws, "B6", "Extra each month", { font: { bold: true } });
  input(ws, "C6", 200, { fmt: MONEY });
  put(ws, "B7", "Start month", { font: { bold: true } });
  input(ws, "C7", date("2027-01-01"), { fmt: "mmm yyyy", align: "left" });

  header(ws, 9, 2, [
    "Debt",
    "Balance",
    "Interest (% a year)",
    "Minimum payment",
    "Order",
    "Months",
    "Paid off by",
    "Interest paid",
  ]);
  for (let i = 0; i < DEBTS; i++) {
    const r = DEBT0 + i;
    const ex = DEBT_EXAMPLES[i];
    input(ws, `B${r}`, ex ? ex[0] : null);
    input(ws, `C${r}`, ex ? ex[1] : null, { fmt: MONEY });
    input(ws, `D${r}`, ex ? ex[2] : null, { fmt: "0.0#", align: "center" });
    input(ws, `E${r}`, ex ? ex[3] : null, { fmt: MONEY });
    // Hidden sort key: payoff order (ties broken by row).
    put(ws, `K${r}`, {
      f: `IF(N(C${r})<=0,1E+12+ROW(),IF($C$5="Avalanche",-N(D${r}),N(C${r}))+ROW()/1E+6)`,
    });
    calc(
      ws,
      `F${r}`,
      {
        f: `IF(N(C${r})<=0,"",COUNTIF($K$${DEBT0}:$K$${DEBT0 + DEBTS - 1},"<"&K${r})+1)`,
      },
      { align: "center", font: { bold: true } },
    );
    const e = colName(3 + i * 6 + 5);
    const ecol = `DebtCalc!$${e}$2:$${e}$${PLAN_MONTHS + 1}`;
    calc(
      ws,
      `G${r}`,
      {
        f: `IF(N(C${r})<=0,"",IF(COUNTIF(${ecol},">0")>=${PLAN_MONTHS},"30+ years",COUNTIF(${ecol},">0")+1))`,
      },
      { align: "center" },
    );
    calc(
      ws,
      `H${r}`,
      { f: `IF(ISNUMBER(G${r}),EDATE($C$7,G${r}-1),"")` },
      { fmt: "mmm yyyy", align: "center" },
    );
    const icol = colName(3 + i * 6 + 1);
    calc(
      ws,
      `I${r}`,
      {
        f: `IF(N(C${r})<=0,"",SUM(DebtCalc!$${icol}$2:$${icol}$${PLAN_MONTHS + 1}))`,
      },
      { fmt: MONEY },
    );
  }
  ws.getColumn(11).hidden = true;
  const tot = DEBT0 + DEBTS;
  calc(ws, `B${tot}`, "Total", { font: { bold: true } });
  calc(
    ws,
    `C${tot}`,
    { f: `SUM(C${DEBT0}:C${tot - 1})` },
    { fmt: MONEY, font: { bold: true } },
  );
  calc(
    ws,
    `E${tot}`,
    { f: `SUM(E${DEBT0}:E${tot - 1})` },
    { fmt: MONEY, font: { bold: true } },
  );
  calc(
    ws,
    `I${tot}`,
    { f: `SUM(I${DEBT0}:I${tot - 1})` },
    { fmt: MONEY, font: { bold: true } },
  );

  const s = tot + 2; // summary block
  ws.getRow(s).height = 18;
  ws.getRow(s + 1).height = 30;
  card(
    ws,
    `B${s}`,
    `B${s + 1}`,
    "DEBT-FREE BY",
    {
      f: `IF(COUNT(G${DEBT0}:G${tot - 1})=0,"",IF(COUNTIF(G${DEBT0}:G${tot - 1},"30+*")>0,"30+ years",EDATE($C$7,MAX(G${DEBT0}:G${tot - 1})-1)))`,
    },
    { fmt: "mmm yyyy", tone: C.goodBg },
  );
  card(
    ws,
    `C${s}`,
    `C${s + 1}`,
    "MONTHS TO GO",
    {
      f: `IF(COUNTIF(G${DEBT0}:G${tot - 1},"30+*")>0,"30+ yrs",MAX(G${DEBT0}:G${tot - 1}))`,
    },
    { fmt: "0" },
  );
  card(ws, `D${s}`, `D${s + 1}`, "PAYING EACH MONTH", { f: `E${tot}+N($C$6)` });
  card(ws, `E${s}`, `E${s + 1}`, "TOTAL INTEREST", { f: `I${tot}` });
  ws.mergeCells(`E${s}:F${s}`);
  ws.mergeCells(`E${s + 1}:F${s + 1}`);
  note(
    ws,
    `B${s + 3}`,
    "Each month every debt gets its minimum; the extra (plus minimums freed up by debts you've cleared) goes to the debt with the lowest Order number. See every month in Debt Plan.",
    { wrap: true },
  );
  ws.mergeCells(`B${s + 3}:I${s + 4}`);
}

/** Hidden month-by-month simulation (one block of 6 columns per debt). */
function debtCalc(wb) {
  const ws = wb.addWorksheet("DebtCalc", { state: "hidden" });
  ws.getCell("A1").value = {
    formula: `${DP}!$E$${DEBT0 + DEBTS}+N(${DP}!$C$6)`,
  };
  const cols = (i) => {
    const c0 = 3 + i * 6;
    return {
      S: colName(c0),
      I: colName(c0 + 1),
      P: colName(c0 + 2),
      O: colName(c0 + 3),
      X: colName(c0 + 4),
      E: colName(c0 + 5),
    };
  };
  for (let i = 0; i < DEBTS; i++) {
    const k = cols(i);
    ["Start", "Interest", "Minimum", "Owed", "Extra", "End"].forEach(
      (h, j) => (ws.getCell(1, 3 + i * 6 + j).value = `${h} ${i + 1}`),
    );
    void k;
  }
  for (let m = 1; m <= PLAN_MONTHS; m++) {
    const r = m + 1;
    ws.getCell(`A${r}`).value = m;
    const pSum = Array.from(
      { length: DEBTS },
      (_, i) => `${cols(i).P}${r}`,
    ).join("+");
    ws.getCell(`B${r}`).value = { formula: `MAX(0,$A$1-(${pSum}))` };
    for (let i = 0; i < DEBTS; i++) {
      const k = cols(i);
      const d = DEBT0 + i;
      ws.getCell(`${k.S}${r}`).value = {
        formula: m === 1 ? `MAX(0,N(${DP}!$C$${d}))` : `${k.E}${r - 1}`,
      };
      ws.getCell(`${k.I}${r}`).value = {
        formula: `ROUND(${k.S}${r}*N(${DP}!$D$${d})/1200,2)`,
      };
      ws.getCell(`${k.P}${r}`).value = {
        formula: `MIN(N(${DP}!$E$${d}),${k.S}${r}+${k.I}${r})`,
      };
      ws.getCell(`${k.O}${r}`).value = {
        formula: `${k.S}${r}+${k.I}${r}-${k.P}${r}`,
      };
      const ahead = Array.from({ length: DEBTS }, (_, j) => j)
        .filter((j) => j !== i)
        .map((j) => `(${DP}!$K$${DEBT0 + j}<${DP}!$K$${d})*${cols(j).O}${r}`)
        .join("+");
      ws.getCell(`${k.X}${r}`).value = {
        formula: `MAX(0,MIN(${k.O}${r},$B${r}-(${ahead})))`,
      };
      ws.getCell(`${k.E}${r}`).value = {
        formula: `ROUND(${k.O}${r}-${k.X}${r},2)`,
      };
    }
  }
}

function debtPlan(wb) {
  const ws = sheet(wb, "Debt Plan", {
    tab: "FFC0392B",
    widths: [12, ...Array(DEBTS).fill(13), 14],
    freeze: 5,
  });
  title(
    ws,
    "Debt Plan",
    "Your balances after each month's payments. Rows stop when you're debt-free.",
    10,
  );
  header(ws, 5, 2, ["Month", ...Array(DEBTS).fill(""), "Total left"]);
  for (let i = 0; i < DEBTS; i++)
    ws.getCell(5, 3 + i).value = {
      formula: `IF(${DP}!$B$${DEBT0 + i}="","",${DP}!$B$${DEBT0 + i})`,
    };
  const tc = colName(3 + DEBTS);
  for (let m = 1; m <= PLAN_MONTHS; m++) {
    const r = 5 + m;
    const cr = m + 1;
    calc(
      ws,
      `B${r}`,
      {
        f:
          m === 1
            ? `IF(N(${DP}!$C$${DEBT0 + DEBTS})=0,"",${DP}!$C$7)`
            : `IF(OR($${tc}${r - 1}="",N($${tc}${r - 1})=0),"",EDATE($B$6,${m - 1}))`,
      },
      { fmt: "mmm yyyy" },
    );
    const ends = [];
    for (let i = 0; i < DEBTS; i++) {
      const e = colName(3 + i * 6 + 5);
      ends.push(`DebtCalc!${e}${cr}`);
      calc(
        ws,
        `${colName(3 + i)}${r}`,
        {
          f: `IF(OR($B${r}="",${DP}!$B$${DEBT0 + i}=""),"",DebtCalc!${e}${cr})`,
        },
        { fmt: MONEY0 },
      );
    }
    calc(
      ws,
      `${tc}${r}`,
      { f: `IF($B${r}="","",${ends.join("+")})` },
      { fmt: MONEY0, font: { bold: true } },
    );
  }
  ws.addConditionalFormatting({
    ref: `C6:${colName(2 + DEBTS)}${5 + PLAN_MONTHS}`,
    rules: [
      {
        type: "expression",
        formulae: ['AND(C6<>"",N(C6)=0)'],
        style: { font: { color: { argb: C.good }, bold: true } },
      },
    ],
  });
}

function savings(wb) {
  const ws = sheet(wb, "Savings", {
    tab: C.good,
    widths: [22, 12, 13, 13, 14, 13, 13, 10, 13, 24, 7],
  });
  title(
    ws,
    "Savings Goals & Sinking Funds",
    "Give a goal the same name as a Savings category and every transfer you log counts toward it.",
    11,
  );
  header(ws, 6, 2, [
    "Goal",
    "Target",
    "Target date",
    "Saved before",
    "Added this year",
    "Total saved",
    "Still needed",
    "Months left",
    "Save / month",
    "Progress",
    "%",
  ]);
  for (let r = 7; r <= 21; r++) {
    const ex = GOALS[r - 7];
    input(ws, `B${r}`, ex ? ex[0] : null);
    list(ws, `B${r}`, CATS);
    input(ws, `C${r}`, ex ? ex[1] : null, { fmt: MONEY });
    input(ws, `D${r}`, ex ? date(ex[2]) : null, { fmt: DATE });
    input(ws, `E${r}`, ex ? ex[3] : null, { fmt: MONEY });
    calc(
      ws,
      `F${r}`,
      {
        f: `IF(B${r}="","",${sumBetween(TXC, `B${r}`, `DATE(${YEAR},1,1)`, `DATE(${YEAR},12,31)`)})`,
      },
      { fmt: MONEY },
    );
    calc(ws, `G${r}`, { f: `IF(B${r}="","",N(E${r})+F${r})` }, { fmt: MONEY });
    calc(
      ws,
      `H${r}`,
      { f: `IF(B${r}="","",MAX(0,N(C${r})-G${r}))` },
      { fmt: MONEY },
    );
    calc(
      ws,
      `I${r}`,
      {
        f: `IF(OR(B${r}="",D${r}=""),"",MAX(1,(YEAR(D${r})-YEAR(TODAY()))*12+MONTH(D${r})-MONTH(TODAY())))`,
      },
      { align: "center" },
    );
    calc(
      ws,
      `J${r}`,
      { f: `IF(B${r}="","",IF(H${r}=0,0,IF(I${r}="","",H${r}/I${r})))` },
      { fmt: MONEY, font: { bold: true } },
    );
    calc(
      ws,
      `K${r}`,
      { f: bar(`IF(OR(B${r}="",N(C${r})=0),"",G${r}/C${r})`) },
      { font: { color: { argb: C.good } } },
    );
    calc(
      ws,
      `L${r}`,
      { f: `IF(OR(B${r}="",N(C${r})=0),"",MIN(1,G${r}/C${r}))` },
      { fmt: PCT, align: "right" },
    );
  }
}

function netWorth(wb) {
  const ws = sheet(wb, "Net Worth", {
    tab: C.good,
    widths: [24, ...Array(12).fill(10)],
  });
  title(
    ws,
    "Net Worth",
    "Update once a month: what you own minus what you owe.",
    13,
  );
  header(ws, 6, 2, ["", ...MONTHS.map((m) => m.slice(0, 3))]);
  const block = (r0, label, items, totalLabel) => {
    put(ws, `B${r0}`, label, {
      font: { bold: true, color: { argb: C.blue }, size: 9 },
    });
    items.forEach((name, i) => {
      const r = r0 + 1 + i;
      input(ws, `B${r}`, name);
      for (let m = 0; m < 12; m++)
        input(ws, `${colName(3 + m)}${r}`, null, { fmt: MONEY0 });
    });
    const t = r0 + 1 + items.length;
    calc(ws, `B${t}`, totalLabel, { font: { bold: true } });
    for (let m = 0; m < 12; m++) {
      const c = colName(3 + m);
      calc(
        ws,
        `${c}${t}`,
        { f: `SUM(${c}${r0 + 1}:${c}${t - 1})` },
        { fmt: MONEY0, font: { bold: true } },
      );
    }
    return t;
  };
  const ta = block(
    7,
    "WHAT YOU OWN",
    [
      "Cash & current account",
      "Savings",
      "Investments",
      "Retirement",
      "Home",
      "Car",
      "Other",
    ],
    "Total assets",
  );
  const td = block(
    ta + 2,
    "WHAT YOU OWE",
    ["Credit cards", "Car loan", "Student loans", "Mortgage", "Other"],
    "Total debts",
  );
  const nw = td + 2;
  calc(ws, `B${nw}`, "Net worth", { font: { bold: true, size: 12 } });
  calc(ws, `B${nw + 1}`, "Change", { font: { color: { argb: C.muted } } });
  for (let m = 0; m < 12; m++) {
    const c = colName(3 + m);
    calc(
      ws,
      `${c}${nw}`,
      { f: `IF(AND(${c}${ta}=0,${c}${td}=0),"",${c}${ta}-${c}${td})` },
      { fmt: MONEY0, font: { bold: true, size: 12 }, fill: C.sky },
    );
    calc(
      ws,
      `${c}${nw + 1}`,
      {
        f:
          m === 0
            ? '""'
            : `IF(OR(${c}${nw}="",${colName(2 + m)}${nw}=""),"",${c}${nw}-${colName(2 + m)}${nw})`,
      },
      { fmt: MONEY0 },
    );
  }
  ws.addConditionalFormatting({
    ref: `C${nw + 1}:N${nw + 1}`,
    rules: [
      {
        type: "expression",
        formulae: [`N(C${nw + 1})>0`],
        style: { font: { color: { argb: C.good } } },
      },
      {
        type: "expression",
        formulae: [`N(C${nw + 1})<0`],
        style: { font: { color: { argb: C.bad } } },
      },
    ],
  });
  return nw;
}

// ---- Demo data (tests + store screenshots only) ---------------------------

/** Fill a built workbook with a believable three months of use. */
export function fillDemo(wb) {
  wb.getWorksheet("Setup").getCell("C5").value = "Sara";
  const tx = wb.getWorksheet("Transactions");
  const rows = [];
  const add = (d, desc, cat, amt) => rows.push([date(d), desc, cat, amt]);
  for (const m of ["01", "02", "03"]) {
    add(`2027-${m}-01`, "Salary", "Salary", 3000);
    add(`2027-${m}-01`, "Rent", "Rent / mortgage", 1000);
    add(`2027-${m}-03`, "Weekly shop", "Groceries", 86.4);
    add(`2027-${m}-05`, "Car insurance", "Insurance", 100);
    add(`2027-${m}-08`, "Bus pass", "Transport", 64);
    add(`2027-${m}-09`, "Streaming", "Subscriptions", 15.99);
    add(`2027-${m}-10`, "Weekly shop", "Groceries", 92.15);
    add(`2027-${m}-12`, "Electricity", "Utilities", 70);
    add(`2027-${m}-14`, "Dinner with Maya", "Eating out", 46.5);
    add(`2027-${m}-15`, "To emergency fund", "Emergency fund", 150);
    add(`2027-${m}-15`, "To holiday fund", "Holiday fund", 100);
    add(`2027-${m}-17`, "Weekly shop", "Groceries", 78.3);
    add(`2027-${m}-18`, "Phone", "Phone & internet", 35);
    add(`2027-${m}-20`, "Water", "Utilities", 50);
    add(`2027-${m}-22`, "Internet", "Phone & internet", 25);
    add(`2027-${m}-23`, "Cinema", "Entertainment", 24);
    add(`2027-${m}-24`, "Weekly shop", "Groceries", 88.9);
    add(`2027-${m}-25`, "Credit card payment", "Credit card", 150);
    add(`2027-${m}-26`, "Haircut", "Personal care", 35);
    add(`2027-${m}-28`, "Student loan", "Student loan", 120);
  }
  add("2027-01-19", "Running shoes", "Shopping", 79.99);
  add("2027-02-11", "Freelance logo", "Side income", 350);
  add("2027-02-14", "Valentine's dinner", "Eating out", 92);
  add("2027-03-06", "Birthday gift", "Gifts", 45);
  rows.sort((a, b) => a[0] - b[0]);
  rows.forEach((row, i) =>
    row.forEach((v, j) => (tx.getCell(TX0 + i, 2 + j).value = v)),
  );

  const bills = wb.getWorksheet("Bills");
  for (let r = 11; r < 11 + BILLS.length; r++)
    for (const c of ["G", "H", "I"]) bills.getCell(`${c}${r}`).value = "✓";

  const nw = wb.getWorksheet("Net Worth");
  const vals = {
    8: [1850, 2100, 2320],
    9: [1350, 1600, 1850],
    10: [6400, 6650, 6900],
    11: [18200, 18400, 18650],
    13: [9500, 9400, 9300],
    18: [3110, 2860, 2590],
    19: [8350, 8180, 8010],
    20: [13950, 13900, 13850],
  };
  for (const [r, v] of Object.entries(vals))
    v.forEach((x, m) => (nw.getCell(+r, 3 + m).value = x));
  return rows;
}
