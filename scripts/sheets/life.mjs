/**
 * Life Planner: for Excel and Google Sheets.
 *
 *   Start Here · Dashboard · Weekly Plan · Goals · Milestones · Habits ·
 *   Dates · Monthly Review
 *
 * Goals get their progress and "next milestone" from the Milestones tab; the
 * Dashboard pulls this week's top 3, goals, upcoming dates and habits.
 */
import { guideSheet, habitLog } from "./blocks.mjs";
import {
  C,
  DATE,
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

const G0 = 6; // Goals rows
const G1 = 25;
const M0 = 6; // Milestones rows
const M1 = 205;
const D0 = 6; // Dates rows
const D1 = 105;
const AREAS = [
  "Health",
  "Career",
  "Money",
  "Relationships",
  "Personal growth",
  "Home",
  "Fun",
];
const DATE_TYPES = [
  "Birthday",
  "Anniversary",
  "Appointment",
  "Deadline",
  "Trip",
  "Other",
];
export const LIFE_HABITS = ["Exercise", "Read", "No phone in bed", "Water"];

const fillBg = (argb) => ({
  type: "pattern",
  pattern: "solid",
  bgColor: { argb },
});
const MS = (col) => `Milestones!$${col}$${M0}:$${col}$${M1}`;
const DT = (col) => `Dates!$${col}$${D0}:$${col}$${D1}`;
const DTT = (col) => `Dates!$${col}$1:$${col}$${D1}`;
const WEEK_DONE =
  "COUNTIF('Weekly Plan'!$C$13:$C$20,\"✓\")+COUNTIF('Weekly Plan'!$E$13:$E$20,\"✓\")+COUNTIF('Weekly Plan'!$G$13:$G$20,\"✓\")+COUNTIF('Weekly Plan'!$I$13:$I$20,\"✓\")+COUNTIF('Weekly Plan'!$K$13:$K$20,\"✓\")+COUNTIF('Weekly Plan'!$M$13:$M$20,\"✓\")+COUNTIF('Weekly Plan'!$O$13:$O$20,\"✓\")";
const WEEK_ALL =
  "COUNTA('Weekly Plan'!$B$13:$B$20,'Weekly Plan'!$D$13:$D$20,'Weekly Plan'!$F$13:$F$20,'Weekly Plan'!$H$13:$H$20,'Weekly Plan'!$J$13:$J$20,'Weekly Plan'!$L$13:$L$20,'Weekly Plan'!$N$13:$N$20)";

export function buildLife() {
  const wb = workbook();
  guideSheet(
    wb,
    "Life Planner",
    "by Makeready · works in Google Sheets and Excel",
    [
      ["", "SET IT UP (15 MINUTES, ONCE)", "h"],
      [
        "1",
        "Goals: write up to 20 goals, pick an area and a target date. Add why each one matters to you.",
      ],
      [
        "2",
        'Milestones: break each goal into small steps (pick the goal from the dropdown). Progress and "next step" update themselves.',
      ],
      [
        "3",
        "Dates: add birthdays, appointments and deadlines. Birthdays repeat every year automatically.",
      ],
      ["4", "Habits: type the day you start and name up to 8 habits."],
      ["", ""],
      ["", "EVERY WEEK (10 MINUTES)", "h"],
      [
        "→",
        "Weekly Plan: clear last week, pick your top 3, and spread tasks over the days. Tick ✓ as you go.",
      ],
      [
        "→",
        "Write three lines of reflection at the bottom. That's where the real progress comes from.",
      ],
      ["", ""],
      ["", "EVERY DAY AND EVERY MONTH", "h"],
      [
        "→",
        "Dashboard: your week, goals, coming dates and habits on one screen. Tick habits in today's row on Habits.",
      ],
      [
        "→",
        "At the end of each month, rate it 1–10 in Monthly Review and note one win and one lesson.",
      ],
      ["", ""],
      ["", "COLOUR KEY", "h"],
      [
        "",
        "Yellow cells are yours: type over the examples. Everything else updates itself, so don't type over it.",
        "key",
      ],
    ],
  );
  const dash = sheet(wb, "Dashboard", {
    tab: C.navy,
    widths: [30, 13, 22, 12, 30],
  }); // filled last
  weeklyPlan(wb);
  goals(wb);
  milestones(wb);
  const habits = habitLog(wb, {
    habits: LIFE_HABITS,
    start: new Date(Date.UTC(2027, 0, 1)),
    sub: "Small things, done most days. Streaks count themselves.",
  });
  dates(wb);
  monthlyReview(wb);
  dashboard(dash, habits);
  return wb;
}

function dashboard(ws, habits) {
  title(
    ws,
    "Dashboard",
    "Your week, your goals and what's coming up, on one screen.",
    6,
  );
  put(
    ws,
    "B5",
    { f: "TODAY()" },
    {
      fmt: "dddd d mmmm yyyy",
      font: { bold: true, size: 12, color: { argb: C.blue } },
    },
  );
  ws.mergeCells("B5:C5");
  ws.getRow(7).height = 18;
  ws.getRow(8).height = 30;
  card(
    ws,
    "B7",
    "B8",
    "GOALS PROGRESS",
    {
      f: `IF(COUNTA(${MS("C")})=0,"",COUNTIF(${MS("E")},"✓")/COUNTA(${MS("C")}))`,
    },
    { fmt: PCT, tone: C.goodBg },
  );
  card(
    ws,
    "C7",
    "C8",
    "THIS WEEK",
    { f: `IF((${WEEK_ALL})=0,"",(${WEEK_DONE})/(${WEEK_ALL}))` },
    { fmt: PCT },
  );
  ws.mergeCells("C7:D7");
  ws.mergeCells("C8:D8");
  const doneHabits = habits.refs
    .map((h) => `IF(AND(${h.name}<>"",${h.today}),1,0)`)
    .join("+");
  const allHabits = habits.refs.map((h) => `IF(${h.name}<>"",1,0)`).join("+");
  card(
    ws,
    "E7",
    "E8",
    "HABITS TODAY",
    { f: `(${doneHabits})&" / "&(${allHabits})` },
    { tone: C.goodBg },
  );
  card(
    ws,
    "F7",
    "F8",
    "NEXT DATE",
    { f: `IF($C$28="","–",$C$28)` },
    { tone: C.warnBg },
  );

  header(ws, 10, 2, ["This week's top 3", "", "", "Done", ""]);
  ws.mergeCells("B10:D10");
  for (let i = 0; i < 3; i++) {
    const r = 11 + i;
    put(
      ws,
      `B${r}`,
      { f: `IF('Weekly Plan'!$C$${7 + i}="","",'Weekly Plan'!$C$${7 + i})` },
      { font: { bold: true } },
    );
    ws.mergeCells(`B${r}:D${r}`);
    put(
      ws,
      `E${r}`,
      { f: `IF('Weekly Plan'!$N$${7 + i}="✓","✓","")` },
      { align: "center", font: { bold: true, color: { argb: C.good } } },
    );
  }

  header(ws, 15, 2, ["Goal", "Area", "Progress", "%", "Next step"]);
  for (let i = 0; i < 10; i++) {
    const r = 16 + i;
    const g = G0 + i;
    calc(
      ws,
      `B${r}`,
      { f: `IF(Goals!$B$${g}="","",Goals!$B$${g})` },
      { font: { bold: true } },
    );
    calc(
      ws,
      `C${r}`,
      { f: `IF($B${r}="","",Goals!$C$${g})` },
      { font: { size: 9, color: { argb: C.muted } } },
    );
    calc(
      ws,
      `D${r}`,
      { f: `IF($B${r}="","",Goals!$H$${g})` },
      { font: { color: { argb: C.good } } },
    );
    calc(
      ws,
      `E${r}`,
      { f: `IF($B${r}="","",Goals!$I$${g})` },
      { fmt: PCT, align: "right" },
    );
    calc(
      ws,
      `F${r}`,
      { f: `IF($B${r}="","",Goals!$J$${g})` },
      { font: { color: { argb: C.muted } } },
    );
  }

  header(ws, 27, 2, ["Coming up", "When", "Date", "", ""]);
  for (let k = 1; k <= 5; k++) {
    const r = 27 + k;
    put(ws, `H${r}`, { f: `IFERROR(SMALL(${DT("H")},${k}),"")` }); // hidden key
    const pick = (col) =>
      `IF($H${r}="","",INDEX(${DTT(col)},MOD($H${r},10000)))`;
    calc(ws, `B${r}`, { f: pick("C") });
    calc(
      ws,
      `C${r}`,
      { f: pick("F") },
      { font: { bold: true, color: { argb: C.blue } } },
    );
    calc(
      ws,
      `D${r}`,
      { f: pick("E") },
      { fmt: "ddd d mmm", font: { color: { argb: C.muted } } },
    );
  }
  ws.getColumn(8).hidden = true;

  header(ws, 34, 2, ["Habits", "Today", "Streak", "", ""]);
  habits.refs.forEach((h, i) => {
    const r = 35 + i;
    put(ws, `B${r}`, { f: `IF(${h.name}="","",${h.name})` });
    put(
      ws,
      `C${r}`,
      { f: `IF(${h.name}="","",IF(${h.today},"✓","–"))` },
      { align: "center", font: { bold: true, color: { argb: C.good } } },
    );
    put(
      ws,
      `D${r}`,
      { f: `IF(${h.name}="","",${h.streak})` },
      { fmt: '0" 🔥"' },
    );
  });
}

function weeklyPlan(wb) {
  const ws = sheet(wb, "Weekly Plan", {
    tab: C.blue,
    widths: Array(7).fill([17, 4]).flat(),
  });
  title(
    ws,
    "Weekly Plan",
    "Plan the week, tick as you go, reflect on Sunday. Clear the yellow cells to start a new week.",
    14,
  );
  put(ws, "B4", "Week starting", { font: { bold: true } });
  input(
    ws,
    "D4",
    { f: "TODAY()-WEEKDAY(TODAY(),3)" },
    { fmt: "ddd d mmm yyyy", align: "center" },
  );
  ws.mergeCells("D4:F4");
  header(ws, 6, 2, ["Top 3 this week", ...Array(11).fill(""), "Done", ""]);
  for (let i = 0; i < 3; i++) {
    const r = 7 + i;
    put(ws, `B${r}`, i + 1, {
      align: "center",
      font: { bold: true, color: { argb: C.blue } },
    });
    input(ws, `C${r}`, null, { font: { bold: true } });
    ws.mergeCells(`C${r}:M${r}`);
    input(ws, `N${r}`, null, { align: "center" });
    list(ws, `N${r}`, ["✓"]);
  }
  for (let d = 0; d < 7; d++) {
    const t = colName(2 + d * 2);
    const c = colName(3 + d * 2);
    put(
      ws,
      `${t}12`,
      { f: `$D$4+${d}` },
      {
        fmt: "ddd d mmm",
        font: { bold: true, color: { argb: C.white } },
        fill: C.navy,
        align: "center",
      },
    );
    put(ws, `${c}12`, "✓", {
      font: { bold: true, color: { argb: C.white } },
      fill: C.navy,
      align: "center",
    });
    for (let r = 13; r <= 20; r++) {
      input(ws, `${t}${r}`, null, { wrap: true, font: { size: 9 } });
      input(ws, `${c}${r}`, null, { align: "center" });
      list(ws, `${c}${r}`, ["✓"]);
    }
    put(
      ws,
      `${t}21`,
      {
        f: `IF(COUNTA(${t}13:${t}20)=0,"",COUNTIF(${c}13:${c}20,"✓")&" of "&COUNTA(${t}13:${t}20)&" done")`,
      },
      { font: { size: 9, color: { argb: C.muted } }, align: "center" },
    );
    ws.addConditionalFormatting({
      ref: `${t}13:${c}20`,
      rules: [
        {
          type: "expression",
          formulae: [`$${c}13="✓"`],
          style: {
            font: { strike: true, color: { argb: C.good } },
            fill: fillBg(C.goodBg),
          },
        },
      ],
    });
  }
  ws.addConditionalFormatting({
    ref: "B12:O12",
    rules: [
      {
        type: "expression",
        formulae: ["INT($D$4+INT((COLUMN()-2)/2))=TODAY()"],
        style: { fill: fillBg(C.blue) },
      },
    ],
  });
  for (let r = 13; r <= 20; r++) ws.getRow(r).height = 24;
  put(ws, "B22", "Week progress", { font: { bold: true } });
  put(
    ws,
    "D22",
    { f: bar(`IF((${WEEK_ALL})=0,"",(${WEEK_DONE})/(${WEEK_ALL}))`, 30) },
    { font: { color: { argb: C.good } } },
  );
  [
    [24, "What went well?"],
    [25, "What got in the way?"],
    [26, "Next week I'll…"],
  ].forEach(([r, label]) => {
    put(ws, `B${r}`, label, { font: { bold: true } });
    ws.mergeCells(`B${r}:C${r}`);
    input(ws, `D${r}`, null, { wrap: true });
    ws.mergeCells(`D${r}:O${r}`);
    ws.getRow(r).height = 30;
  });
}

function goals(wb) {
  const ws = sheet(wb, "Goals", {
    tab: C.good,
    widths: [28, 14, 30, 13, 9, 7, 20, 7, 30, 10],
    freeze: 5,
  });
  title(
    ws,
    "Goals",
    "What you want, why it matters, and how far along you are.",
    11,
  );
  header(ws, 5, 2, [
    "Goal",
    "Area",
    "Why it matters",
    "Target date",
    "Steps",
    "Done",
    "Progress",
    "%",
    "Next step",
    "Days left",
  ]);
  const ex = [
    ["Run a 10k", "Health", "Feel strong and sleep better", "2027-05-30"],
    [
      "Save a 3-month emergency fund",
      "Money",
      "So a surprise bill is never a crisis",
      "2027-12-31",
    ],
    [
      "Read 12 books",
      "Personal growth",
      "Less scrolling, more learning",
      "2027-12-31",
    ],
  ];
  for (let r = G0; r <= G1; r++) {
    const e = ex[r - G0];
    input(ws, `B${r}`, e?.[0] ?? null, { font: { bold: true } });
    input(ws, `C${r}`, e?.[1] ?? null, { align: "center", font: { size: 9 } });
    list(ws, `C${r}`, AREAS);
    input(ws, `D${r}`, e?.[2] ?? null, { font: { color: { argb: C.muted } } });
    input(ws, `E${r}`, e ? new Date(`${e[3]}T00:00:00Z`) : null, {
      fmt: DATE,
      align: "center",
    });
    calc(
      ws,
      `F${r}`,
      { f: `IF(B${r}="","",COUNTIF(${MS("B")},B${r}))` },
      { align: "center" },
    );
    calc(
      ws,
      `G${r}`,
      { f: `IF(B${r}="","",COUNTIFS(${MS("B")},B${r},${MS("E")},"✓"))` },
      { align: "center" },
    );
    calc(
      ws,
      `H${r}`,
      { f: bar(`IF(OR(B${r}="",N(F${r})=0),"",G${r}/F${r})`, 12) },
      { font: { color: { argb: C.good } } },
    );
    calc(
      ws,
      `I${r}`,
      { f: `IF(OR(B${r}="",N(F${r})=0),"",G${r}/F${r})` },
      { fmt: PCT, align: "right" },
    );
    calc(
      ws,
      `J${r}`,
      {
        f: `IF(B${r}="","",IF(N(F${r})=0,"Add steps in Milestones",IFERROR(INDEX(${MS("C")},MATCH(B${r},${MS("H")},0)),"All done 🎉")))`,
      },
      { font: { color: { argb: C.muted } } },
    );
    calc(
      ws,
      `K${r}`,
      { f: `IF(OR(B${r}="",E${r}=""),"",E${r}-TODAY())` },
      { fmt: "0", align: "center" },
    );
  }
}

function milestones(wb) {
  const ws = sheet(wb, "Milestones", {
    tab: C.good,
    widths: [28, 40, 13, 7],
    freeze: 5,
  });
  title(
    ws,
    "Milestones",
    "Small steps for each goal. Pick the goal, write the step, tick it when it's done.",
    5,
  );
  header(ws, 5, 2, ["Goal", "Step", "Due", "Done"]);
  const ex = [
    ["Run a 10k", "Run 3 km without stopping", "2027-02-15", "✓"],
    ["Run a 10k", "Sign up for a 10k race", "2027-03-01", null],
    ["Run a 10k", "Run 7 km", "2027-04-15", null],
    [
      "Save a 3-month emergency fund",
      "Open a separate savings account",
      "2027-01-31",
      "✓",
    ],
    [
      "Save a 3-month emergency fund",
      "Automate a monthly transfer",
      "2027-02-28",
      null,
    ],
    ["Read 12 books", "Pick the first 3 books", "2027-01-10", "✓"],
    ["Read 12 books", "Finish book 1", "2027-01-31", null],
  ];
  for (let r = M0; r <= M1; r++) {
    const e = ex[r - M0];
    input(ws, `B${r}`, e?.[0] ?? null);
    list(ws, `B${r}`, `Goals!$B$${G0}:$B$${G1}`);
    input(ws, `C${r}`, e?.[1] ?? null);
    input(ws, `D${r}`, e ? new Date(`${e[2]}T00:00:00Z`) : null, {
      fmt: "d mmm yyyy",
      align: "center",
    });
    input(ws, `E${r}`, e?.[3] ?? null, { align: "center" });
    list(ws, `E${r}`, ["✓"]);
    // Earliest open step per goal (no MINIFS): key → flag → goal name on that row only.
    put(ws, `F${r}`, {
      f: `IF(OR(B${r}="",C${r}="",E${r}="✓"),"",IF(D${r}="",99999,D${r})*10000+ROW())`,
    });
    put(ws, `G${r}`, {
      f: `IF(F${r}="","",IF(COUNTIFS($B$${M0}:$B$${M1},B${r},$F$${M0}:$F$${M1},"<"&F${r})=0,1,""))`,
    });
    put(ws, `H${r}`, { f: `IF(G${r}=1,B${r},"")` });
  }
  for (const c of [6, 7, 8]) ws.getColumn(c).hidden = true;
  ws.addConditionalFormatting({
    ref: `B${M0}:E${M1}`,
    rules: [
      {
        type: "expression",
        formulae: [`$E${M0}="✓"`],
        style: { font: { strike: true, color: { argb: C.faint } } },
      },
    ],
  });
}

function dates(wb) {
  const ws = sheet(wb, "Dates", {
    tab: "FFD08726",
    widths: [13, 34, 14, 13, 12],
    freeze: 5,
  });
  title(
    ws,
    "Dates",
    "Birthdays, appointments and deadlines. Birthdays and anniversaries roll over every year.",
    6,
  );
  header(ws, 5, 2, ["Date", "What", "Type", "Next", "When"]);
  for (let r = D0; r <= D1; r++) {
    input(ws, `B${r}`, null, { fmt: DATE, align: "center" });
    input(ws, `C${r}`, null);
    input(ws, `D${r}`, null, { align: "center" });
    list(ws, `D${r}`, DATE_TYPES);
    const yearly = `OR(D${r}="Birthday",D${r}="Anniversary")`;
    const thisYear = `DATE(YEAR(TODAY()),MONTH(B${r}),DAY(B${r}))`;
    calc(
      ws,
      `E${r}`,
      {
        f: `IF(B${r}="","",IF(${yearly},DATE(YEAR(TODAY())+IF(${thisYear}<TODAY(),1,0),MONTH(B${r}),DAY(B${r})),B${r}))`,
      },
      { fmt: "ddd d mmm", align: "center" },
    );
    calc(
      ws,
      `F${r}`,
      {
        f: `IF(E${r}="","",IF(E${r}<TODAY(),"Past",IF(E${r}=TODAY(),"Today!",IF(E${r}-TODAY()=1,"Tomorrow","In "&(E${r}-TODAY())&" days"))))`,
      },
      { align: "center", font: { bold: true } },
    );
    put(
      ws,
      `G${r}`,
      { f: `IF(OR(E${r}="",C${r}=""),"",IF(E${r}<TODAY(),"",E${r}))` },
      { fmt: "ddd d mmm", font: { color: { argb: C.white } } },
    );
    put(ws, `H${r}`, { f: `IF(G${r}="","",G${r}*10000+ROW())` });
  }
  ws.getColumn(7).hidden = true;
  ws.getColumn(8).hidden = true;
  ws.addConditionalFormatting({
    ref: `F${D0}:F${D1}`,
    rules: [
      {
        type: "expression",
        formulae: [`AND(E${D0}<>"",E${D0}>=TODAY(),E${D0}-TODAY()<=7)`],
        style: {
          fill: fillBg(C.warnBg),
          font: { color: { argb: "FFB35C00" } },
        },
      },
      {
        type: "expression",
        formulae: [`F${D0}="Past"`],
        style: { font: { color: { argb: C.faint } } },
      },
    ],
  });
}

function monthlyReview(wb) {
  const ws = sheet(wb, "Monthly Review", {
    tab: C.blue,
    widths: [13, 9, 22, 32, 32, 32],
  });
  title(
    ws,
    "Monthly Review",
    "Five minutes at the end of each month. Rate it, keep one win, learn one lesson.",
    7,
  );
  put(ws, "B4", "Year", { font: { bold: true } });
  input(ws, "C4", 2027, { align: "center" });
  header(ws, 6, 2, [
    "Month",
    "Rating",
    "",
    "Best thing that happened",
    "What I learned",
    "Next month I'll focus on",
  ]);
  for (let m = 0; m < 12; m++) {
    const r = 7 + m;
    put(
      ws,
      `B${r}`,
      { f: `DATE($C$4,${m + 1},1)` },
      { fmt: "mmmm", font: { bold: true } },
    );
    input(ws, `C${r}`, null, { align: "center" });
    list(ws, `C${r}`, ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    put(
      ws,
      `D${r}`,
      { f: bar(`IF(C${r}="","",IFERROR(VALUE(C${r}&""),0)/10)`, 10) },
      { font: { color: { argb: C.blue } } },
    );
    for (const c of ["E", "F", "G"])
      input(ws, `${c}${r}`, null, { wrap: true, font: { size: 9 } });
    put(ws, `H${r}`, { f: `IF(C${r}="","",VALUE(C${r}&""))` }); // hidden number for the average
    ws.getRow(r).height = 30;
  }
  put(ws, "B20", "Average", { font: { bold: true } });
  put(
    ws,
    "C20",
    { f: 'IFERROR(AVERAGE(H7:H18),"")' },
    { fmt: "0.0", align: "center", font: { bold: true } },
  );
  ws.getColumn(8).hidden = true;
  note(ws, "D20", "out of 10");
}

// ---- Demo data -----------------------------------------------------------

export function fillDemo(wb, now = new Date()) {
  const day = (n) =>
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + n));
  const wp = wb.getWorksheet("Weekly Plan");
  ["Finish the Q1 budget", "Three runs", "Call Gran"].forEach(
    (t, i) => (wp.getCell(`C${7 + i}`).value = t),
  );
  wp.getCell("N8").value = "✓";
  const tasks = [
    [
      "Gym 7am",
      "✓",
      "Budget draft",
      "✓",
      "Run 3 km",
      null,
      "Dentist 4pm",
      null,
    ],
    ["Team meeting", "✓", "Groceries", null],
    ["Run 3 km", "✓", "Read 20 pages", "✓", "Call Gran", null],
    ["Budget review", null],
    ["Run 5 km", null, "Cinema with Jo", null],
    ["Farmers market", null],
    ["Plan next week", null],
  ];
  tasks.forEach((list, d) => {
    for (let i = 0; i < list.length; i += 2) {
      wp.getCell(13 + i / 2, 2 + d * 2).value = list[i];
      wp.getCell(13 + i / 2, 3 + d * 2).value = list[i + 1];
    }
  });
  const dt = wb.getWorksheet("Dates");
  const items = [
    [day(3), "Dentist 4pm", "Appointment"],
    [
      new Date(
        Date.UTC(now.getFullYear() - 30, now.getMonth(), now.getDate() + 10),
      ),
      "Mum's birthday",
      "Birthday",
    ], // rolls over to 10 days from now
    [day(1), "Project deadline", "Deadline"],
    [day(-5), "Car service", "Appointment"], // past: not shown on the dashboard
    [day(25), "Weekend in Lisbon", "Trip"],
  ];
  items.forEach(([d, what, type], i) => {
    dt.getCell(`B${D0 + i}`).value = d;
    dt.getCell(`C${D0 + i}`).value = what;
    dt.getCell(`D${D0 + i}`).value = type;
  });
  const hab = wb.getWorksheet("Habits");
  hab.getCell("C4").value = day(-9);
  const pattern = ["x.xx.xx.xx", "xxxxxxxxxx", "xxxxx.....", ".x.x.x.x.x"];
  pattern.forEach((p, h) =>
    [...p].forEach(
      (ch, i) => (hab.getCell(12 + i, 3 + h).value = ch === "x" ? "✓" : null),
    ),
  );
  const mr = wb.getWorksheet("Monthly Review");
  ["7", "8", "6"].forEach((v, i) => (mr.getCell(`C${7 + i}`).value = v));
  mr.getCell("E7").value = "Ran 3 km without stopping";
  return { tasks, items, pattern };
}
