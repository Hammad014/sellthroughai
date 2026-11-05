/**
 * Wedding Planner & Budget: for Excel and Google Sheets.
 *
 *   Start Here · Dashboard · Checklist · Budget · Guests · Vendors
 *
 * The checklist's due dates count back from the wedding date; the budget
 * uses the actual cost once known (else the estimate); guest numbers and
 * meal counts come from the RSVPs.
 */
import { guideSheet } from "./blocks.mjs";
import {
  C,
  DATE,
  MONEY,
  MONEY0,
  PCT,
  bar,
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

const K0 = 6; // Checklist rows
const K1 = 105;
const B0 = 6; // Budget rows
const B1 = 105;
const G0 = 6; // Guests rows
const G1 = 405;
const WDATE = "Dashboard!$C$5";
const CK = (col) => `Checklist!$${col}$${K0}:$${col}$${K1}`;
const CKT = (col) => `Checklist!$${col}$1:$${col}$${K1}`;
const BG = (col) => `Budget!$${col}$${B0}:$${col}$${B1}`;
const GU = (col) => `Guests!$${col}$${G0}:$${col}$${G1}`;
export const CATEGORIES = [
  "Venue",
  "Catering",
  "Drinks",
  "Photography",
  "Video",
  "Attire",
  "Rings",
  "Flowers",
  "Music",
  "Cake",
  "Stationery",
  "Decor",
  "Hair & makeup",
  "Transport",
  "Favours",
  "Honeymoon",
  "Other",
];
const SIDES = ["Partner 1", "Partner 2", "Both"];
const GROUPS = ["Family", "Friends", "Work", "Plus-one", "Kids", "Other"];
const RSVP = ["Yes", "No", "Waiting"];
export const MEALS = ["Meat", "Fish", "Vegetarian", "Vegan", "Kids", "Other"];
const VENDOR_TYPES = [
  "Venue",
  "Caterer",
  "Photographer",
  "Videographer",
  "Florist",
  "Band / DJ",
  "Cake",
  "Hair & makeup",
  "Officiant",
  "Transport",
  "Planner",
  "Other",
];

/** [days before the wedding, when, task] */
export const CHECKLIST = [
  [365, "12+ months", "Set a budget together"],
  [365, "12+ months", "Draft the guest list"],
  [350, "12+ months", "Choose a date and book the venue"],
  [330, "12+ months", "Book the officiant / ceremony"],
  [300, "10 months", "Book the photographer"],
  [300, "10 months", "Book the caterer (if not the venue)"],
  [270, "9 months", "Send save-the-dates"],
  [270, "9 months", "Book band / DJ"],
  [240, "8 months", "Choose the dress / outfits"],
  [240, "8 months", "Choose the wedding party"],
  [210, "7 months", "Book the florist"],
  [180, "6 months", "Book hair and makeup"],
  [180, "6 months", "Plan the honeymoon"],
  [150, "5 months", "Order the cake"],
  [150, "5 months", "Book transport"],
  [120, "4 months", "Buy the rings"],
  [120, "4 months", "Order invitations"],
  [90, "3 months", "Send invitations"],
  [90, "3 months", "Menu tasting"],
  [75, "10 weeks", "Plan the order of the day"],
  [60, "2 months", "First dress fitting"],
  [45, "6 weeks", "Chase missing RSVPs"],
  [30, "1 month", "Give final numbers to the venue and caterer"],
  [30, "1 month", "Make the seating plan"],
  [28, "1 month", "Apply for the marriage licence (check local rules)"],
  [21, "3 weeks", "Write the vows / speeches"],
  [14, "2 weeks", "Final fitting"],
  [14, "2 weeks", "Confirm times with every vendor"],
  [7, "1 week", "Pay final balances"],
  [7, "1 week", "Pack for the honeymoon"],
  [2, "2 days", "Prepare tips and envelopes for vendors"],
  [1, "Day before", "Rehearsal, then an early night"],
];

const fillBg = (argb) => ({
  type: "pattern",
  pattern: "solid",
  bgColor: { argb },
});

export function buildWedding() {
  const wb = workbook();
  guideSheet(
    wb,
    "Wedding Planner",
    "by Makeready · works in Google Sheets and Excel",
    [
      ["", "SET IT UP (5 MINUTES)", "h"],
      [
        "1",
        "Dashboard: type your wedding date, your total budget and your names.",
      ],
      [
        "2",
        "Checklist: 32 tasks are already there, each due a set time before the wedding. Tick them off; add your own.",
      ],
      [
        "3",
        "Budget: list every cost with an estimate. When you book, add the actual price and what you've paid.",
      ],
      [
        "4",
        "Guests: everyone you invite, with their side, RSVP and meal choice.",
      ],
      ["", ""],
      ["", "AS YOU GO", "h"],
      [
        "→",
        "Dashboard: days to go, budget left, guests attending and what's next on the checklist.",
      ],
      [
        "→",
        "Vendors: every supplier's contact details, deposit and whether they're booked.",
      ],
      ["", ""],
      ["", "GOOD TO KNOW", "h"],
      [
        "•",
        "The budget counts the actual price once you've added it, otherwise the estimate.",
      ],
      [
        "•",
        "Party size: put 2 for a couple on one invitation, so the numbers stay right.",
      ],
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
    widths: [28, 14, 14, 14, 3, 32, 12],
  }); // filled last
  checklist(wb);
  budget(wb);
  guests(wb);
  vendors(wb);
  dashboard(dash);
  return wb;
}

function dashboard(ws) {
  title(
    ws,
    "Wedding Dashboard",
    "Everything at a glance, counted from the other tabs.",
    7,
  );
  put(ws, "B5", "Wedding date", { font: { bold: true } });
  input(ws, "C5", new Date(Date.UTC(2027, 8, 18)), {
    fmt: DATE,
    align: "center",
    font: { bold: true },
  });
  ws.mergeCells("C5:D5");
  put(ws, "B6", "Total budget", { font: { bold: true } });
  input(ws, "C6", 20000, { fmt: MONEY0, align: "center" });
  ws.mergeCells("C6:D6");
  put(ws, "B7", "Couple", { font: { bold: true } });
  input(ws, "C7", "Sam & Alex", { align: "center" });
  ws.mergeCells("C7:D7");

  const committed = `SUM(${BG("J")})`;
  ws.getRow(9).height = 18;
  ws.getRow(10).height = 30;
  card(
    ws,
    "B9",
    "B10",
    "DAYS TO GO",
    { f: `IF($C$5="","",MAX(0,$C$5-TODAY()))` },
    { fmt: "0", tone: C.goodBg },
  );
  card(
    ws,
    "C9",
    "C10",
    "BUDGET LEFT",
    { f: `N($C$6)-${committed}` },
    { fmt: MONEY0, tone: C.sky },
  );
  card(
    ws,
    "D9",
    "D10",
    "PAID SO FAR",
    { f: `SUM(${BG("F")})` },
    { fmt: MONEY0 },
  );
  card(
    ws,
    "F9",
    "F10",
    "GUESTS COMING",
    {
      f: `SUMIFS(${GU("E")},${GU("G")},"Yes")&" of "&SUMIFS(${GU("E")},${GU("F")},"✓")&" invited"`,
    },
    { tone: C.warnBg },
  );
  ws.mergeCells("F9:G9");
  ws.mergeCells("F10:G10");

  put(ws, "B12", "Checklist", { font: { bold: true } });
  const done = `IF(COUNTA(${CK("D")})=0,"",COUNTIF(${CK("F")},"✓")/COUNTA(${CK("D")}))`;
  put(ws, "C12", { f: bar(done, 30) }, { font: { color: { argb: C.good } } });
  ws.mergeCells("C12:E12");
  put(ws, "G12", { f: done }, { fmt: PCT, font: { bold: true } });
  put(ws, "B13", "Budget used", { font: { bold: true } });
  const used = `IF(N($C$6)=0,"",${committed}/$C$6)`;
  put(ws, "C13", { f: bar(used, 30) }, { font: { color: { argb: C.blue } } });
  ws.mergeCells("C13:E13");
  put(ws, "G13", { f: used }, { fmt: PCT, font: { bold: true } });

  header(ws, 15, 2, [
    "Next on the checklist",
    "Due",
    "When",
    "",
    "",
    "Budget by category",
    "",
  ]);
  for (let k = 1; k <= 8; k++) {
    const r = 15 + k;
    put(ws, `I${r}`, { f: `IFERROR(SMALL(${CK("H")},${k}),"")` }); // hidden key
    const pick = (col) =>
      `IF($I${r}="","",IF(INDEX(${CKT(col)},MOD($I${r},10000))="","",INDEX(${CKT(col)},MOD($I${r},10000))))`;
    calc(ws, `B${r}`, { f: pick("D") }, { font: { bold: true } });
    calc(ws, `C${r}`, { f: pick("E") }, { fmt: "d mmm yy", align: "center" });
    calc(ws, `D${r}`, { f: pick("G") }, { align: "center", font: { size: 9 } });
  }
  ws.getColumn(9).hidden = true;
  ws.addConditionalFormatting({
    ref: "B16:D23",
    rules: [
      {
        type: "expression",
        formulae: ['$D16="Overdue"'],
        style: { font: { color: { argb: C.bad } } },
      },
    ],
  });
  CATEGORIES.forEach((cat, i) => {
    const r = 16 + i;
    put(ws, `G${r}`, cat, { font: { size: 9 } });
    calc(
      ws,
      `H${r}`,
      { f: `SUMIFS(${BG("J")},${BG("B")},G${r})` },
      { fmt: MONEY0, align: "right", font: { size: 9 } },
    );
  });

  header(ws, 25, 2, ["Guests", "People", "", ""]);
  [
    ["Invited", `SUMIFS(${GU("E")},${GU("F")},"✓")`],
    ["Coming", `SUMIFS(${GU("E")},${GU("G")},"Yes")`],
    ["Not coming", `SUMIFS(${GU("E")},${GU("G")},"No")`],
    [
      "Waiting to hear",
      `SUMIFS(${GU("E")},${GU("F")},"✓",${GU("G")},"Waiting")+SUMIFS(${GU("E")},${GU("F")},"✓",${GU("G")},"")`,
    ],
  ].forEach(([label, f], i) => {
    put(ws, `B${26 + i}`, label);
    calc(
      ws,
      `C${26 + i}`,
      { f },
      { fmt: "0", align: "center", font: { bold: true } },
    );
  });
  header(ws, 31, 2, ["Meals (coming)", "People", "", ""]);
  MEALS.forEach((meal, i) => {
    put(ws, `B${32 + i}`, meal);
    calc(
      ws,
      `C${32 + i}`,
      { f: `SUMIFS(${GU("E")},${GU("G")},"Yes",${GU("H")},B${32 + i})` },
      { fmt: '0;-0;"–"', align: "center" },
    );
  });
}

function checklist(wb) {
  const ws = sheet(wb, "Checklist", {
    tab: C.blue,
    widths: [6, 13, 44, 13, 7, 12],
    freeze: 5,
  });
  title(
    ws,
    "Checklist",
    "Each task is due a set number of days before the wedding. Tick them off as you go.",
    7,
  );
  header(ws, 5, 2, ["Days", "When", "Task", "Due", "Done", "Status"]);
  for (let r = K0; r <= K1; r++) {
    const ex = CHECKLIST[r - K0];
    input(ws, `B${r}`, ex?.[0] ?? null, { align: "center", font: { size: 9 } });
    input(ws, `C${r}`, ex?.[1] ?? null, {
      font: { size: 9, color: { argb: C.muted } },
    });
    input(ws, `D${r}`, ex?.[2] ?? null, { font: { bold: true } });
    calc(
      ws,
      `E${r}`,
      { f: `IF(OR(D${r}="",B${r}="",${WDATE}=""),"",${WDATE}-B${r})` },
      { fmt: "d mmm yy", align: "center" },
    );
    input(ws, `F${r}`, null, { align: "center" });
    list(ws, `F${r}`, ["✓"]);
    calc(
      ws,
      `G${r}`,
      {
        f: `IF(D${r}="","",IF(F${r}="✓","Done",IF(E${r}="","",IF(E${r}<TODAY(),"Overdue",IF(E${r}-TODAY()<=30,"Soon","Later")))))`,
      },
      { align: "center", font: { bold: true, size: 9 } },
    );
    put(ws, `H${r}`, {
      f: `IF(OR(D${r}="",F${r}="✓",E${r}=""),"",E${r}*10000+ROW())`,
    });
  }
  ws.getColumn(8).hidden = true;
  note(
    ws,
    "B4",
    "Days = how many days before the wedding it's due. Change it to suit you.",
  );
  ws.addConditionalFormatting({
    ref: `G${K0}:G${K1}`,
    rules: [
      {
        type: "expression",
        formulae: [`G${K0}="Overdue"`],
        style: { fill: fillBg(C.badBg), font: { color: { argb: C.bad } } },
      },
      {
        type: "expression",
        formulae: [`G${K0}="Soon"`],
        style: { fill: fillBg(C.warnBg) },
      },
      {
        type: "expression",
        formulae: [`G${K0}="Done"`],
        style: { fill: fillBg(C.goodBg), font: { color: { argb: C.good } } },
      },
    ],
  });
  ws.addConditionalFormatting({
    ref: `B${K0}:E${K1}`,
    rules: [
      {
        type: "expression",
        formulae: [`$F${K0}="✓"`],
        style: { font: { strike: true, color: { argb: C.faint } } },
      },
    ],
  });
}

function budget(wb) {
  const ws = sheet(wb, "Budget", {
    tab: C.good,
    widths: [16, 30, 12, 12, 12, 12, 12, 22],
    freeze: 5,
  });
  title(
    ws,
    "Budget",
    "Estimate first; add the actual price when you book and what you've paid.",
    8,
  );
  header(ws, 5, 2, [
    "Category",
    "Item",
    "Estimate",
    "Actual",
    "Paid",
    "Still to pay",
    "Due date",
    "Vendor",
  ]);
  for (let r = B0; r <= B1; r++) {
    input(ws, `B${r}`, null, { font: { size: 9 } });
    list(ws, `B${r}`, CATEGORIES);
    input(ws, `C${r}`, null, { font: { bold: true } });
    input(ws, `D${r}`, null, { fmt: MONEY });
    input(ws, `E${r}`, null, { fmt: MONEY });
    input(ws, `F${r}`, null, { fmt: MONEY });
    calc(
      ws,
      `G${r}`,
      { f: `IF(C${r}="","",MAX(0,J${r}-N(F${r})))` },
      { fmt: MONEY, font: { bold: true } },
    );
    input(ws, `H${r}`, null, { fmt: "d mmm yy", align: "center" });
    input(ws, `I${r}`, null);
    // Hidden: what the row counts as (the actual price once known, else the estimate).
    put(ws, `J${r}`, { f: `IF(C${r}="",0,IF(E${r}<>"",N(E${r}),N(D${r})))` });
  }
  ws.getColumn(10).hidden = true;
  put(ws, "B107", "Total", { font: { bold: true } });
  for (const c of ["D", "E", "F", "G"])
    calc(
      ws,
      `${c}107`,
      { f: `SUM(${c}${B0}:${c}${B1})` },
      { fmt: MONEY, font: { bold: true } },
    );
}

function guests(wb) {
  const ws = sheet(wb, "Guests", {
    tab: "FFD46A8C",
    widths: [26, 11, 11, 8, 9, 10, 12, 8, 26],
    freeze: 5,
  });
  title(
    ws,
    "Guests",
    "Everyone you invite. Party size 2 for a couple on one invitation.",
    9,
  );
  header(ws, 5, 2, [
    "Name",
    "Side",
    "Group",
    "People",
    "Invited",
    "RSVP",
    "Meal",
    "Table",
    "Dietary / notes",
  ]);
  for (let r = G0; r <= G1; r++) {
    input(ws, `B${r}`, null, { font: { bold: true } });
    input(ws, `C${r}`, null, { align: "center", font: { size: 9 } });
    list(ws, `C${r}`, SIDES);
    input(ws, `D${r}`, null, { align: "center", font: { size: 9 } });
    list(ws, `D${r}`, GROUPS);
    input(ws, `E${r}`, null, { align: "center" });
    input(ws, `F${r}`, null, { align: "center" });
    list(ws, `F${r}`, ["✓"]);
    input(ws, `G${r}`, null, { align: "center" });
    list(ws, `G${r}`, RSVP);
    input(ws, `H${r}`, null, { align: "center", font: { size: 9 } });
    list(ws, `H${r}`, MEALS);
    input(ws, `I${r}`, null, { align: "center" });
    input(ws, `J${r}`, null, { font: { size: 9, color: { argb: C.muted } } });
  }
  ws.addConditionalFormatting({
    ref: `G${G0}:G${G1}`,
    rules: [
      {
        type: "expression",
        formulae: [`G${G0}="Yes"`],
        style: {
          fill: fillBg(C.goodBg),
          font: { color: { argb: C.good }, bold: true },
        },
      },
      {
        type: "expression",
        formulae: [`G${G0}="No"`],
        style: { font: { color: { argb: C.faint } } },
      },
    ],
  });
}

function vendors(wb) {
  const ws = sheet(wb, "Vendors", {
    tab: "FFD08726",
    widths: [16, 24, 18, 15, 26, 8, 12, 26],
  });
  title(ws, "Vendors", "Every supplier in one place.", 8);
  header(ws, 5, 2, [
    "Type",
    "Business",
    "Contact",
    "Phone",
    "Email",
    "Booked",
    "Deposit",
    "Notes",
  ]);
  for (let r = 6; r <= 45; r++) {
    input(ws, `B${r}`, null, { font: { size: 9 } });
    list(ws, `B${r}`, VENDOR_TYPES);
    input(ws, `C${r}`, null, { font: { bold: true } });
    input(ws, `D${r}`, null);
    input(ws, `E${r}`, null);
    input(ws, `F${r}`, null, { font: { size: 9 } });
    input(ws, `G${r}`, null, { align: "center" });
    list(ws, `G${r}`, ["✓"]);
    input(ws, `H${r}`, null, { fmt: MONEY });
    input(ws, `I${r}`, null, { font: { size: 9, color: { argb: C.muted } } });
  }
}

// ---- Demo data -----------------------------------------------------------

export const DEMO_BUDGET = [
  ["Venue", "Venue hire", 6000, 6500, 2000],
  ["Catering", "Dinner for 90", 5400, null, 0],
  ["Photography", "Photographer (full day)", 1800, 1650, 500],
  ["Attire", "Dress", 1200, 1350, 1350],
  ["Flowers", "Bouquets and table flowers", 900, null, 0],
  ["Music", "DJ", 700, 650, 200],
  ["Cake", "Three-tier cake", 450, null, 0],
];

export const DEMO_GUESTS = [
  ["Mum & Dad", "Partner 1", "Family", 2, "✓", "Yes", "Meat"],
  ["Gran", "Partner 1", "Family", 1, "✓", "Yes", "Fish"],
  ["Jo & Priya", "Partner 2", "Friends", 2, "✓", "Yes", "Vegetarian"],
  ["Uncle Tom", "Partner 2", "Family", 1, "✓", "No", null],
  ["Maya", "Both", "Friends", 1, "✓", "Waiting", null],
  ["Chris (work)", "Partner 1", "Work", 1, "✓", null, null],
  ["Kids table", "Both", "Kids", 3, "✓", "Yes", "Kids"],
  ["Ben", "Partner 2", "Friends", 1, null, null, null], // not invited yet
];

export function fillDemo(wb, now = new Date()) {
  const day = (n) =>
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + n));
  const wedding = day(200);
  wb.getWorksheet("Dashboard").getCell("C5").value = wedding;
  const ck = wb.getWorksheet("Checklist");
  // Everything due more than 200 days before the wedding is done, except one.
  CHECKLIST.forEach(([days], i) => {
    if (days > 200 && i !== 9) ck.getCell(`F${K0 + i}`).value = "✓";
  });
  const bg = wb.getWorksheet("Budget");
  DEMO_BUDGET.forEach((row, i) =>
    row.forEach((v, j) => (bg.getCell(B0 + i, 2 + j).value = v)),
  );
  const gu = wb.getWorksheet("Guests");
  DEMO_GUESTS.forEach((row, i) =>
    row.forEach((v, j) => (gu.getCell(G0 + i, 2 + j).value = v)),
  );
  return { wedding, day };
}
