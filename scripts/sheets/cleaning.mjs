/**
 * Cleaning Schedule: for Excel and Google Sheets.
 *
 *   Start Here · Today · Next 7 Days · Tasks · Rooms · Declutter 30
 *
 * Each task has a frequency and a "last done" date; the next due date and
 * status follow. Today lists what's due or overdue, most overdue first.
 */
import { guideSheet } from "./blocks.mjs";
import {
  C,
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

const T0 = 6; // Tasks rows
const T1 = 205;
const R0 = 6; // Rooms rows
const R1 = 20;
const TK = (col) => `Tasks!$${col}$${T0}:$${col}$${T1}`;
const TKT = (col) => `Tasks!$${col}$1:$${col}$${T1}`;
export const FREQ = [
  ["Daily", 1],
  ["Every 2 days", 2],
  ["Weekly", 7],
  ["Every 2 weeks", 14],
  ["Monthly", 30],
  ["Every 3 months", 91],
  ["Every 6 months", 182],
  ["Yearly", 365],
];
export const ROOMS = [
  "Kitchen",
  "Bathroom",
  "Bedroom",
  "Living room",
  "Hallway",
  "Laundry",
  "Outside",
  "Whole house",
];
export const TASKS = [
  ["Kitchen", "Wipe counters and hob", "Daily"],
  ["Kitchen", "Wash up / load dishwasher", "Daily"],
  ["Kitchen", "Take out the rubbish", "Every 2 days"],
  ["Kitchen", "Clean the sink", "Weekly"],
  ["Kitchen", "Mop the floor", "Weekly"],
  ["Kitchen", "Clear out the fridge", "Weekly"],
  ["Kitchen", "Clean the microwave", "Every 2 weeks"],
  ["Kitchen", "Clean the oven", "Every 3 months"],
  ["Bathroom", "Wipe sink and mirror", "Every 2 days"],
  ["Bathroom", "Clean the toilet", "Weekly"],
  ["Bathroom", "Clean shower / bath", "Weekly"],
  ["Bathroom", "Wash towels and bath mat", "Weekly"],
  ["Bathroom", "Mop the floor", "Weekly"],
  ["Bathroom", "Descale taps and shower head", "Monthly"],
  ["Bedroom", "Make the bed", "Daily"],
  ["Bedroom", "Change the bed sheets", "Weekly"],
  ["Bedroom", "Vacuum", "Weekly"],
  ["Bedroom", "Dust surfaces", "Every 2 weeks"],
  ["Bedroom", "Flip / rotate the mattress", "Every 6 months"],
  ["Living room", "Tidy away (10 minutes)", "Daily"],
  ["Living room", "Vacuum", "Weekly"],
  ["Living room", "Dust surfaces and TV", "Every 2 weeks"],
  ["Living room", "Wash cushion covers and throws", "Every 3 months"],
  ["Hallway", "Sort shoes and coats", "Weekly"],
  ["Hallway", "Vacuum / mop", "Weekly"],
  ["Laundry", "Do a load of washing", "Every 2 days"],
  ["Laundry", "Clean the washing machine filter", "Monthly"],
  ["Outside", "Sweep the doorstep", "Every 2 weeks"],
  ["Outside", "Clean the windows", "Every 3 months"],
  ["Whole house", "Wipe light switches and door handles", "Monthly"],
  ["Whole house", "Dust skirting boards", "Every 3 months"],
  ["Whole house", "Test smoke alarms", "Monthly"],
  ["Whole house", "Declutter one drawer", "Monthly"],
  ["Whole house", "Deep clean carpets", "Yearly"],
];
const DECLUTTER = [
  "Bathroom cabinet",
  "Junk drawer",
  "Fridge",
  "Shoes",
  "Coats and bags",
  "Phone photos",
  "Email inbox",
  "Spice rack",
  "Under the sink",
  "Makeup / toiletries",
  "Socks and underwear",
  "T-shirts",
  "Books",
  "Kitchen utensils",
  "Tupperware",
  "Bedside table",
  "Handbag / backpack",
  "Car",
  "Cables and chargers",
  "Paperwork",
  "Medicine cabinet",
  "Towels and bedding",
  "Kids' toys (or one shelf)",
  "Freezer",
  "Desk",
  "Apps on your phone",
  "Mugs and glasses",
  "Jewellery",
  "Cleaning products",
  "One thing you've been avoiding",
];

const fillBg = (argb) => ({
  type: "pattern",
  pattern: "solid",
  bgColor: { argb },
});

export function buildCleaning() {
  const wb = workbook();
  guideSheet(
    wb,
    "Cleaning Schedule",
    "by Makeready · works in Google Sheets and Excel",
    [
      ["", "SET IT UP (5 MINUTES)", "h"],
      [
        "1",
        "Tasks: 34 common tasks are already there. Change how often, delete what you don't need, add your own.",
      ],
      ["2", "Add who does each one, if you share the house."],
      ["", ""],
      ["", "EVERY DAY", "h"],
      [
        "→",
        "Open Today: it shows what's due and overdue, most overdue first. Do one, or a few.",
      ],
      [
        "→",
        "Done a task? In Tasks, type today's date in Last done (shortcut: Ctrl + ; on Windows, ⌘ + ; on Mac). It moves to its next date.",
      ],
      ["→", "Next 7 Days shows what's coming, so you can spread it out."],
      ["", ""],
      ["", "GOOD TO KNOW", "h"],
      [
        "•",
        "A task with no Last done date counts as due today. Fill in roughly when you last did it.",
      ],
      [
        "•",
        "Rooms gives each room a clean score: the share of its tasks that aren't overdue.",
      ],
      ["•", "Declutter 30: one small spot a day for 30 days. Tick it off."],
      ["", ""],
      ["", "COLOUR KEY", "h"],
      [
        "",
        "Yellow cells are yours to type in. Everything else updates itself, so don't type over it.",
        "key",
      ],
    ],
  );
  const today = sheet(wb, "Today", { tab: C.navy, widths: [16, 34, 12, 16] }); // filled last
  const week = sheet(wb, "Next 7 Days", {
    tab: C.blue,
    widths: Array(7).fill(22),
  });
  tasks(wb);
  rooms(wb);
  declutter(wb);
  todaySheet(today);
  weekSheet(week);
  return wb;
}

function todaySheet(ws) {
  title(ws, "Today", "What's due, most overdue first. Pick one and start.", 5);
  put(
    ws,
    "B5",
    { f: "TODAY()" },
    {
      fmt: "dddd d mmmm",
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
    "OVERDUE",
    { f: `COUNTIF(${TK("H")},"Overdue")` },
    { fmt: "0", tone: C.badBg },
  );
  card(
    ws,
    "C7",
    "C8",
    "DUE TODAY",
    { f: `COUNTIF(${TK("H")},"Due today")` },
    { fmt: "0", tone: C.warnBg },
  );
  card(
    ws,
    "D7",
    "D8",
    "THIS WEEK",
    { f: `COUNTIF(${TK("H")},"This week")` },
    { fmt: "0" },
  );
  card(
    ws,
    "E7",
    "E8",
    "HOUSE SCORE",
    {
      f: `IF(COUNTA(${TK("C")})=0,"",1-COUNTIF(${TK("H")},"Overdue")/COUNTA(${TK("C")}))`,
    },
    { fmt: PCT, tone: C.goodBg },
  );
  header(ws, 10, 2, ["Room", "Task", "Who", "When"]);
  const end = "(TODAY()+1)*10000";
  for (let k = 1; k <= 20; k++) {
    const r = 10 + k;
    put(ws, `G${r}`, {
      f: `IFERROR(IF(SMALL(${TK("I")},${k})<${end},SMALL(${TK("I")},${k}),""),"")`,
    }); // hidden key
    const pick = (col) =>
      `IF($G${r}="","",IF(INDEX(${TKT(col)},MOD($G${r},10000))="","",INDEX(${TKT(col)},MOD($G${r},10000))))`;
    calc(
      ws,
      `B${r}`,
      { f: pick("B") },
      { font: { size: 9, color: { argb: C.muted } } },
    );
    calc(ws, `C${r}`, { f: pick("C") }, { font: { bold: true } });
    calc(ws, `D${r}`, { f: pick("E") }, { align: "center" });
    const due = `INT($G${r}/10000)`;
    calc(
      ws,
      `E${r}`,
      {
        f: `IF($G${r}="","",IF(${due}<TODAY(),IF(TODAY()-${due}=1,"1 day overdue",TODAY()-${due}&" days overdue"),"Today"))`,
      },
      { align: "center" },
    );
  }
  ws.getColumn(7).hidden = true;
  ws.addConditionalFormatting({
    ref: "B11:E30",
    rules: [
      {
        type: "expression",
        formulae: ['AND($G11<>"",INT($G11/10000)<TODAY())'],
        style: { font: { color: { argb: C.bad } } },
      },
    ],
  });
  note(
    ws,
    "B32",
    "Done one? In Tasks, type today's date in its Last done cell (Ctrl + ;).",
  );
}

function weekSheet(ws) {
  title(
    ws,
    "Next 7 Days",
    "What's coming up, so you can spread it out. Overdue tasks are on Today.",
    7,
  );
  for (let d = 0; d < 7; d++) {
    const c = colName(2 + d);
    put(
      ws,
      `${c}5`,
      { f: `TODAY()+${d}` },
      {
        fmt: "dddd d",
        font: { bold: true, color: { argb: C.white } },
        fill: d === 0 ? C.blue : C.navy,
        align: "center",
      },
    );
    for (let k = 1; k <= 12; k++) {
      const r = 5 + k;
      const key = `SMALL(${TK("I")},COUNTIF(${TK("I")},"<"&${c}$5*10000)+${k})`;
      calc(
        ws,
        `${c}${r}`,
        {
          f: `IFERROR(IF(${key}<(${c}$5+1)*10000,INDEX(${TKT("C")},MOD(${key},10000))&" ("&INDEX(${TKT("B")},MOD(${key},10000))&")",""),"")`,
        },
        { wrap: true, font: { size: 9 } },
      );
    }
  }
  for (let r = 6; r <= 17; r++) ws.getRow(r).height = 30;
}

function tasks(wb) {
  const ws = sheet(wb, "Tasks", {
    tab: C.blue,
    widths: [14, 34, 15, 12, 13, 13, 12],
    freeze: 5,
  });
  title(
    ws,
    "Tasks",
    "Every chore, how often, and when you last did it. The next date works itself out.",
    7,
  );
  header(ws, 5, 2, [
    "Room",
    "Task",
    "How often",
    "Who",
    "Last done",
    "Next due",
    "Status",
  ]);
  const names = `{${FREQ.map(([n]) => `"${n}"`).join(",")}}`;
  const days = `{${FREQ.map(([, d]) => d).join(",")}}`;
  for (let r = T0; r <= T1; r++) {
    const ex = TASKS[r - T0];
    input(ws, `B${r}`, ex?.[0] ?? null, { font: { size: 9 } });
    list(ws, `B${r}`, `Rooms!$B$${R0}:$B$${R1}`);
    input(ws, `C${r}`, ex?.[1] ?? null, { font: { bold: true } });
    input(ws, `D${r}`, ex?.[2] ?? null, { align: "center", font: { size: 9 } });
    list(
      ws,
      `D${r}`,
      FREQ.map(([n]) => n),
    );
    input(ws, `E${r}`, null, { align: "center" });
    input(ws, `F${r}`, null, { fmt: "ddd d mmm", align: "center" });
    calc(
      ws,
      `G${r}`,
      {
        f: `IF(OR(C${r}="",D${r}=""),"",IF(F${r}="",TODAY(),F${r}+IFERROR(INDEX(${days},MATCH(D${r},${names},0)),7)))`,
      },
      { fmt: "ddd d mmm", align: "center" },
    );
    calc(
      ws,
      `H${r}`,
      {
        f: `IF(G${r}="","",IF(G${r}<TODAY(),"Overdue",IF(G${r}=TODAY(),"Due today",IF(G${r}-TODAY()<=7,"This week","Later"))))`,
      },
      { align: "center", font: { bold: true, size: 9 } },
    );
    put(ws, `I${r}`, { f: `IF(G${r}="","",G${r}*10000+ROW())` });
  }
  ws.getColumn(9).hidden = true;
  ws.addConditionalFormatting({
    ref: `H${T0}:H${T1}`,
    rules: [
      {
        type: "expression",
        formulae: [`H${T0}="Overdue"`],
        style: { fill: fillBg(C.badBg), font: { color: { argb: C.bad } } },
      },
      {
        type: "expression",
        formulae: [`H${T0}="Due today"`],
        style: {
          fill: fillBg(C.warnBg),
          font: { color: { argb: "FFB35C00" } },
        },
      },
      {
        type: "expression",
        formulae: [`H${T0}="This week"`],
        style: { font: { color: { argb: C.blue } } },
      },
    ],
  });
}

function rooms(wb) {
  const ws = sheet(wb, "Rooms", { tab: C.good, widths: [20, 9, 10, 22, 8] });
  title(
    ws,
    "Rooms",
    "How each room is doing: the share of its tasks that aren't overdue.",
    5,
  );
  header(ws, 5, 2, ["Room", "Tasks", "Overdue", "Clean score", "%"]);
  for (let r = R0; r <= R1; r++) {
    input(ws, `B${r}`, ROOMS[r - R0] ?? null, { font: { bold: true } });
    calc(
      ws,
      `C${r}`,
      { f: `IF(B${r}="","",COUNTIF(${TK("B")},B${r}))` },
      { align: "center" },
    );
    calc(
      ws,
      `D${r}`,
      { f: `IF(B${r}="","",COUNTIFS(${TK("B")},B${r},${TK("H")},"Overdue"))` },
      { align: "center" },
    );
    const score = `IF(OR(B${r}="",N(C${r})=0),"",1-D${r}/C${r})`;
    calc(
      ws,
      `E${r}`,
      { f: bar(score, 16) },
      { font: { color: { argb: C.good } } },
    );
    calc(ws, `F${r}`, { f: score }, { fmt: PCT, align: "right" });
  }
}

function declutter(wb) {
  const ws = sheet(wb, "Declutter 30", { tab: "FFD08726", widths: [6, 40, 8] });
  title(
    ws,
    "Declutter 30",
    "One small spot a day for 30 days. Keep, donate or bin: ten minutes is enough.",
    4,
  );
  put(
    ws,
    "B4",
    { f: 'COUNTIF($D$7:$D$36,"✓")&" of 30 done"' },
    { font: { bold: true, color: { argb: C.good } } },
  );
  ws.mergeCells("B4:C4");
  header(ws, 6, 2, ["Day", "Spot", "Done"]);
  DECLUTTER.forEach((spot, i) => {
    const r = 7 + i;
    put(ws, `B${r}`, i + 1, {
      align: "center",
      font: { bold: true, color: { argb: C.blue } },
    });
    input(ws, `C${r}`, spot);
    input(ws, `D${r}`, null, { align: "center" });
    list(ws, `D${r}`, ["✓"]);
  });
  ws.addConditionalFormatting({
    ref: "C7:D36",
    rules: [
      {
        type: "expression",
        formulae: ['$D7="✓"'],
        style: {
          fill: fillBg(C.goodBg),
          font: { strike: true, color: { argb: C.good } },
        },
      },
    ],
  });
}

// ---- Demo data -----------------------------------------------------------

/** Days ago each starter task was last done (null = never). */
export const DEMO_AGO = [
  0,
  1,
  3,
  2,
  9,
  7,
  5,
  100,
  1,
  8,
  6,
  3,
  10,
  12,
  0,
  6,
  9,
  20,
  30,
  0,
  2,
  16,
  40,
  7,
  4,
  1,
  35,
  10,
  95,
  5,
  60,
  31,
  25,
  null,
];

export function fillDemo(wb, now = new Date()) {
  const day = (n) =>
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + n));
  const ws = wb.getWorksheet("Tasks");
  DEMO_AGO.forEach(
    (ago, i) =>
      (ws.getCell(`F${T0 + i}`).value = ago === null ? null : day(-ago)),
  );
  ["Sam", "Alex"].forEach((who, i) => {
    for (let r = T0 + i; r < T0 + TASKS.length; r += 3)
      ws.getCell(`E${r}`).value = who;
  });
  const dc = wb.getWorksheet("Declutter 30");
  for (let r = 7; r < 13; r++) dc.getCell(`D${r}`).value = "✓";
  return { ago: DEMO_AGO, day };
}
