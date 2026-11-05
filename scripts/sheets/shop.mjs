/**
 * Small Business Sales Tracker: for Excel and Google Sheets.
 *
 *   Start Here · Dashboard · Orders · Products · Expenses
 *
 * Every order's fees (estimated for Etsy from the rates on the Dashboard,
 * or typed in), cost of goods and profit; products ranked by profit; and a
 * month-by-month profit and loss for the year.
 */
import { guideSheet } from "./blocks.mjs";
import {
  C,
  MONEY,
  MONEY0,
  PCT,
  calc,
  card,
  header,
  input,
  list,
  note,
  put,
  sheet,
  title,
  workbook,
} from "./lib.mjs";

const O0 = 6; // Orders rows
const O1 = 2005;
const P0 = 6; // Products rows
const P1 = 105;
const X0 = 6; // Expenses rows
const X1 = 1005;
const YEAR = "Dashboard!$C$5";
const OR = (col) => `Orders!$${col}$${O0}:$${col}$${O1}`;
const PR = (col) => `Products!$${col}$${P0}:$${col}$${P1}`;
const PRT = (col) => `Products!$${col}$1:$${col}$${P1}`;
const EX = (col) => `Expenses!$${col}$${X0}:$${col}$${X1}`;
export const PLATFORMS = [
  "Etsy",
  "Website",
  "Market / fair",
  "Wholesale",
  "Instagram",
  "Other",
];
export const EXPENSE_TYPES = [
  "Materials",
  "Packaging",
  "Postage",
  "Ads",
  "Software & apps",
  "Equipment",
  "Fees",
  "Other",
];
const MONTHS3 = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function buildShop() {
  const wb = workbook();
  guideSheet(
    wb,
    "Sales Tracker",
    "by Makeready · for Etsy and small shops · works in Google Sheets and Excel",
    [
      ["", "SET IT UP (5 MINUTES)", "h"],
      [
        "1",
        "Dashboard: type the year and your shop name. Check the Etsy fee estimate matches your country.",
      ],
      [
        "2",
        "Products: each product with its price and what one costs you to make (materials + packaging).",
      ],
      ["", ""],
      ["", "AS YOU SELL", "h"],
      [
        "→",
        "Orders: one row per order line: date, product, quantity, platform. Price fills in from Products if you leave it blank.",
      ],
      [
        "→",
        "Fees: for Etsy they're estimated for you. Know the exact fee? Type it in Fees (actual) and that's used instead.",
      ],
      [
        "→",
        "Expenses: anything you spend on the business that isn't a product's cost: ads, postage, software, equipment.",
      ],
      [
        "→",
        "Dashboard: revenue, fees, costs and profit for every month, and your best products.",
      ],
      ["", ""],
      ["", "PLEASE NOTE", "h"],
      [
        "•",
        "Fee estimates are a guide: Etsy's fees vary by country and change over time. Check your Etsy payment account for exact figures.",
      ],
      ["•", "This is a sales tracker, not accounting or tax advice."],
      ["", ""],
      ["", "COLOUR KEY", "h"],
      [
        "",
        "Yellow cells are yours to type in. Everything else updates itself, so don't type over it.",
        "key",
      ],
    ],
  );
  const dash = sheet(wb, "Dashboard", {
    tab: C.navy,
    widths: [16, 12, 12, 12, 12, 12, 3, 26, 12],
  }); // filled last
  orders(wb);
  products(wb);
  expenses(wb);
  dashboard(dash);
  return wb;
}

function dashboard(ws) {
  title(
    ws,
    "Dashboard",
    "Your year in sales, counted from Orders and Expenses.",
    10,
  );
  [
    [5, "Year", 2027, "0"],
    [6, "Etsy fee %", 0.095, "0.0%"],
    [7, "Etsy fee per order", 0.45, MONEY],
  ].forEach(([r, label, v, fmt]) => {
    put(ws, `B${r}`, label, { font: { bold: true } });
    input(ws, `C${r}`, v, { fmt, align: "center" });
  });
  put(ws, "B8", "Shop name", { font: { bold: true } });
  input(ws, "C8", "My shop", { align: "center" });
  ws.mergeCells("C8:D8");
  note(
    ws,
    "E6",
    "Estimate: 6.5% transaction + 3% payment processing, plus $0.25 processing and $0.20 listing per order. Change these to match your country.",
    { wrap: true },
  );
  ws.mergeCells("E6:J7");

  const inYear = (range) =>
    `${range},">="&DATE(${YEAR},1,1),${range},"<="&DATE(${YEAR},12,31)`;
  ws.getRow(10).height = 18;
  ws.getRow(11).height = 30;
  card(ws, "B10", "B11", "REVENUE", { f: "C27" }, { fmt: MONEY0, tone: C.sky });
  ws.mergeCells("B10:C10");
  ws.mergeCells("B11:C11");
  card(ws, "D10", "D11", "FEES", { f: "D27" }, { fmt: MONEY0 });
  card(ws, "E10", "E11", "COSTS + EXPENSES", { f: "E27+F27" }, { fmt: MONEY0 });
  ws.mergeCells("E10:F10");
  ws.mergeCells("E11:F11");
  card(
    ws,
    "G10",
    "G11",
    "PROFIT",
    { f: "G27" },
    { fmt: MONEY0, tone: C.goodBg },
  );
  card(
    ws,
    "I10",
    "I11",
    "SALES · AVG SALE",
    {
      f: `COUNTIFS(${OR("B")},"<>",${inYear(OR("B"))})&" · "&TEXT(IFERROR(C27/COUNTIFS(${inYear(OR("B"))}),0),"0.00")`,
    },
    { tone: C.warnBg },
  );
  ws.mergeCells("I10:J10");
  ws.mergeCells("I11:J11");

  header(ws, 13, 2, [
    "Month",
    "Revenue",
    "Fees",
    "Cost of goods",
    "Expenses",
    "Profit",
    "",
    "Best products (profit)",
    "",
  ]);
  for (let m = 0; m < 12; m++) {
    const r = 14 + m;
    const from = `DATE(${YEAR},${m + 1},1)`;
    const to = `EOMONTH(${from},0)`;
    const o = (col) =>
      `SUMIFS(${OR(col)},${OR("B")},">="&${from},${OR("B")},"<="&${to})`;
    put(ws, `B${r}`, MONTHS3[m], { font: { bold: true } });
    calc(ws, `C${r}`, { f: o("K") }, { fmt: MONEY0 });
    calc(ws, `D${r}`, { f: o("L") }, { fmt: MONEY0 });
    calc(ws, `E${r}`, { f: o("M") }, { fmt: MONEY0 });
    calc(
      ws,
      `F${r}`,
      { f: `SUMIFS(${EX("E")},${EX("B")},">="&${from},${EX("B")},"<="&${to})` },
      { fmt: MONEY0 },
    );
    calc(
      ws,
      `G${r}`,
      { f: `C${r}-D${r}-E${r}-F${r}` },
      { fmt: MONEY0, font: { bold: true } },
    );
  }
  put(ws, "B27", "Year", { font: { bold: true } });
  for (const c of ["C", "D", "E", "F", "G"])
    calc(
      ws,
      `${c}27`,
      { f: `SUM(${c}14:${c}25)` },
      { fmt: MONEY0, font: { bold: true } },
    );
  ws.addConditionalFormatting({
    ref: "G14:G27",
    rules: [
      {
        type: "expression",
        formulae: ["G14<0"],
        style: { font: { color: { argb: C.bad } } },
      },
    ],
  });

  for (let k = 1; k <= 5; k++) {
    const r = 13 + k;
    put(ws, `L${r}`, { f: `IFERROR(LARGE(${PR("K")},${k}),"")` }); // hidden key
    const row = `1000-MOD($L${r},1000)`;
    calc(
      ws,
      `I${r}`,
      { f: `IF($L${r}="","",INDEX(${PRT("B")},${row}))` },
      { font: { bold: true } },
    );
    calc(
      ws,
      `J${r}`,
      { f: `IF($L${r}="","",INDEX(${PRT("I")},${row}))` },
      { fmt: MONEY0, align: "right", font: { color: { argb: C.good } } },
    );
  }
  header(ws, 20, 9, ["Revenue by platform", ""]);
  PLATFORMS.forEach((p, i) => {
    const r = 21 + i;
    put(ws, `I${r}`, p);
    calc(
      ws,
      `J${r}`,
      { f: `SUMIFS(${OR("K")},${OR("H")},I${r},${inYear(OR("B"))})` },
      { fmt: MONEY0, align: "right" },
    );
  });
  ws.getColumn(12).hidden = true;
  note(
    ws,
    "B29",
    "Profit = revenue − fees − cost of goods − expenses. Not accounting or tax advice.",
  );
}

function orders(wb) {
  const ws = sheet(wb, "Orders", {
    tab: C.blue,
    widths: [12, 12, 26, 6, 10, 10, 13, 11, 11, 11, 11, 11],
    freeze: 5,
  });
  title(
    ws,
    "Orders",
    "One row per product sold. Leave Price blank to use the price from Products.",
    12,
  );
  header(ws, 5, 2, [
    "Date",
    "Order #",
    "Product",
    "Qty",
    "Price",
    "Shipping",
    "Platform",
    "Fees (actual)",
    "Price used",
    "Revenue",
    "Fees",
    "Cost of goods",
    "Profit",
  ]);
  for (let r = O0; r <= O1; r++) {
    input(ws, `B${r}`, null, { fmt: "d mmm yy", align: "center" });
    input(ws, `C${r}`, null, { font: { size: 9 } });
    input(ws, `D${r}`, null, { font: { bold: true } });
    list(ws, `D${r}`, PR("B"));
    input(ws, `E${r}`, null, { align: "center" });
    input(ws, `F${r}`, null, { fmt: MONEY });
    input(ws, `G${r}`, null, { fmt: MONEY });
    input(ws, `H${r}`, null, { align: "center", font: { size: 9 } });
    list(ws, `H${r}`, PLATFORMS);
    input(ws, `I${r}`, null, { fmt: MONEY });
    const qty = `IF(E${r}="",1,N(E${r}))`;
    calc(
      ws,
      `J${r}`,
      {
        f: `IF(D${r}="","",IF(F${r}<>"",N(F${r}),IFERROR(VLOOKUP(D${r},Products!$B$${P0}:$C$${P1},2,FALSE),0)))`,
      },
      { fmt: MONEY },
    );
    calc(
      ws,
      `K${r}`,
      { f: `IF(D${r}="",0,${qty}*N(J${r})+N(G${r}))` },
      { fmt: MONEY },
    );
    calc(
      ws,
      `L${r}`,
      {
        f: `IF(D${r}="",0,IF(I${r}<>"",N(I${r}),IF(H${r}="Etsy",ROUND(K${r}*Dashboard!$C$6+Dashboard!$C$7,2),0)))`,
      },
      { fmt: MONEY },
    );
    calc(
      ws,
      `M${r}`,
      {
        f: `IF(D${r}="",0,${qty}*IFERROR(VLOOKUP(D${r},Products!$B$${P0}:$D$${P1},3,FALSE),0))`,
      },
      { fmt: MONEY },
    );
    calc(
      ws,
      `N${r}`,
      { f: `IF(D${r}="","",K${r}-L${r}-M${r})` },
      { fmt: MONEY, font: { bold: true } },
    );
    put(ws, `O${r}`, { f: `IF(D${r}="",0,${qty})` }); // hidden: quantity for Products
  }
  ws.getColumn(15).hidden = true;
  ws.addConditionalFormatting({
    ref: `N${O0}:N${O1}`,
    rules: [
      {
        type: "expression",
        formulae: [`AND(N${O0}<>"",N${O0}<0)`],
        style: { font: { color: { argb: C.bad } } },
      },
    ],
  });
}

function products(wb) {
  const ws = sheet(wb, "Products", {
    tab: C.good,
    widths: [28, 11, 11, 10, 8, 12, 12, 12, 9],
    freeze: 5,
  });
  title(
    ws,
    "Products",
    "What you sell, what it costs you, and how each one is doing.",
    9,
  );
  header(ws, 5, 2, [
    "Product",
    "Price",
    "Cost to make",
    "Margin",
    "Sold",
    "Revenue",
    "Fees",
    "Profit",
    "Profit %",
  ]);
  const ex = [
    ["Digital planner", 9.99, 0],
    ["Hand-poured candle", 18, 5.2],
    ["Linen tote bag", 24, 8.5],
    ["Greeting card", 4.5, 0.9],
  ];
  for (let r = P0; r <= P1; r++) {
    const e = ex[r - P0];
    input(ws, `B${r}`, e?.[0] ?? null, { font: { bold: true } });
    input(ws, `C${r}`, e?.[1] ?? null, { fmt: MONEY });
    input(ws, `D${r}`, e?.[2] ?? null, { fmt: MONEY });
    calc(
      ws,
      `E${r}`,
      { f: `IF(OR(B${r}="",N(C${r})=0),"",(C${r}-N(D${r}))/C${r})` },
      { fmt: PCT, align: "center" },
    );
    calc(
      ws,
      `F${r}`,
      { f: `IF(B${r}="","",SUMIFS(${OR("O")},${OR("D")},B${r}))` },
      { fmt: "0", align: "center" },
    );
    calc(
      ws,
      `G${r}`,
      { f: `IF(B${r}="","",SUMIFS(${OR("K")},${OR("D")},B${r}))` },
      { fmt: MONEY0 },
    );
    calc(
      ws,
      `H${r}`,
      { f: `IF(B${r}="","",SUMIFS(${OR("L")},${OR("D")},B${r}))` },
      { fmt: MONEY0 },
    );
    calc(
      ws,
      `I${r}`,
      { f: `IF(B${r}="","",SUMIFS(${OR("N")},${OR("D")},B${r}))` },
      { fmt: MONEY0, font: { bold: true } },
    );
    calc(
      ws,
      `J${r}`,
      { f: `IF(OR(B${r}="",N(G${r})=0),"",I${r}/G${r})` },
      { fmt: PCT, align: "center" },
    );
    // Hidden rank key for the Dashboard's best products (profit > 0 only).
    put(ws, `K${r}`, {
      f: `IF(OR(B${r}="",N(I${r})<=0),"",ROUND(I${r},0)*1000+1000-ROW())`,
    });
  }
  ws.getColumn(11).hidden = true;
}

function expenses(wb) {
  const ws = sheet(wb, "Expenses", {
    tab: "FFD08726",
    widths: [13, 18, 40, 12],
    freeze: 5,
  });
  title(
    ws,
    "Expenses",
    "Business costs that aren't a product's own materials.",
    5,
  );
  header(ws, 5, 2, ["Date", "Type", "What", "Amount"]);
  for (let r = X0; r <= X1; r++) {
    input(ws, `B${r}`, null, { fmt: "d mmm yy", align: "center" });
    input(ws, `C${r}`, null, { font: { size: 9 } });
    list(ws, `C${r}`, EXPENSE_TYPES);
    input(ws, `D${r}`, null);
    input(ws, `E${r}`, null, { fmt: MONEY });
  }
  put(ws, "B1007", "Total", { font: { bold: true } });
  calc(
    ws,
    "E1007",
    { f: `SUM(E${X0}:E${X1})` },
    { fmt: MONEY, font: { bold: true } },
  );
}

// ---- Demo data -----------------------------------------------------------

/** date, order, product, qty, price (blank = product price), shipping, platform, actual fee */
export const DEMO_ORDERS = [
  ["2027-01-04", "1001", "Digital planner", 1, null, 0, "Etsy", null],
  ["2027-01-09", "1002", "Hand-poured candle", 2, null, 4.5, "Etsy", null],
  ["2027-01-15", "W-01", "Linen tote bag", 1, null, 3.95, "Website", 0.95],
  ["2027-01-22", "1003", "Digital planner", 3, null, 0, "Etsy", null],
  ["2027-02-02", "1004", "Greeting card", 5, null, 1.5, "Etsy", null],
  ["2027-02-14", "M-01", "Hand-poured candle", 6, 16, 0, "Market / fair", null],
  ["2027-02-20", "1005", "Linen tote bag", 1, null, 4.5, "Etsy", 3.2],
  ["2027-03-03", "1006", "Digital planner", 2, null, 0, "Etsy", null],
];
export const DEMO_EXPENSES = [
  ["2027-01-02", "Software & apps", "Canva Pro", 11.99],
  ["2027-01-10", "Ads", "Etsy Ads", 15],
  ["2027-02-01", "Packaging", "Boxes and tissue", 32.4],
  ["2027-02-10", "Fees", "Market stall", 25],
];

export function fillDemo(wb) {
  const d = (s) => new Date(`${s}T00:00:00Z`);
  const o = wb.getWorksheet("Orders");
  DEMO_ORDERS.forEach((row, i) =>
    row.forEach(
      (v, j) => (o.getCell(O0 + i, 2 + j).value = j === 0 ? d(v) : v),
    ),
  );
  const x = wb.getWorksheet("Expenses");
  DEMO_EXPENSES.forEach((row, i) =>
    row.forEach(
      (v, j) => (x.getCell(X0 + i, 2 + j).value = j === 0 ? d(v) : v),
    ),
  );
  wb.getWorksheet("Dashboard").getCell("C8").value = "Willow & Wick";
  return { orders: DEMO_ORDERS, expenses: DEMO_EXPENSES };
}
