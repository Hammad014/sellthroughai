/**
 * ADHD Daily Planner: for Excel and Google Sheets.
 *
 *   Start Here · Today · Brain Dump · Habits · Routines · Dopamine Menu · Focus Log
 *
 * Today pulls everything marked "Today" in the Brain Dump (not yet done) via a
 * hidden row-number key, so it works without array formulas in both apps.
 */
import { focusLog, guideSheet, habitLog } from "./blocks.mjs";
import {
  C,
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

const B0 = 6; // Brain Dump rows
const B1 = 305;
const BD = (col) => `'Brain Dump'!$${col}$${B0}:$${col}$${B1}`;
const BDT = (col) => `'Brain Dump'!$${col}$1:$${col}$${B1}`;
const WHEN = ["Today", "Tomorrow", "This week", "Someday", "Let it go"];
const SIZE = ["Tiny (5 min)", "Small (15 min)", "Big (1 hr+)"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const HABITS = ["Meds", "Water", "Move 10 min", "Outside", "Bed by 11"];

const fillBg = (argb) => ({
  type: "pattern",
  pattern: "solid",
  bgColor: { argb },
});

export function buildAdhd() {
  const wb = workbook();
  guideSheet(
    wb,
    "ADHD Daily Planner",
    "by Makeready · works in Google Sheets and Excel",
    [
      ["", "START IN 3 MINUTES", "h"],
      [
        "1",
        "Brain Dump: type everything on your mind, one per row. Don't sort while you type.",
      ],
      [
        "2",
        "Then give each one a When: Today, Tomorrow, This week, Someday, or Let it go.",
      ],
      ["3", "Habits: type the date you start, rename the habits if you like."],
      ["", ""],
      ["", "EVERY DAY", "h"],
      ["→", "Open Today. Tap your energy (1–5) and follow the suggestion."],
      [
        "→",
        "Fill in Just 3 things. Everything you marked Today in the Brain Dump shows up underneath.",
      ],
      [
        "→",
        "Done? Tick ✓ in the Brain Dump and it leaves Today. Tick your habits in today's row.",
      ],
      [
        "→",
        "Each morning, switch yesterday's Tomorrow items to Today (one dropdown each).",
      ],
      ["", ""],
      ["", "WHEN IT'S HARD TO START", "h"],
      [
        "•",
        "Do the Tiny first step only. Starting is the hard part; it's allowed to be small.",
      ],
      [
        "•",
        "Low battery? Pick something from your Dopamine Menu first, then a Tiny task.",
      ],
      [
        "•",
        "Missed a day? Nothing is lost and nothing turns red here. Just open Today.",
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
  // Today reads the tabs after it, so create it now (tab order) and fill it last.
  const today = sheet(wb, "Today", { tab: C.navy, widths: [5, 40, 14, 2, 34] });
  brainDump(wb);
  const habits = habitLog(wb, {
    habits: HABITS,
    start: new Date(Date.UTC(2027, 0, 1)),
    sub: "Small daily wins. Streaks count themselves.",
  });
  routines(wb);
  dopamineMenu(wb);
  const focus = focusLog(wb, {
    sub: "Every focused minute counts. Log it and watch it add up.",
    cols: [
      { label: "Date", style: { fmt: "d mmm yyyy", align: "center" } },
      { label: "What I worked on" },
      { label: "Minutes", style: { align: "center" } },
      {
        label: "How it went",
        list: ["Great", "OK", "Hard", "Didn't start"],
        style: { align: "center" },
      },
    ],
    widths: [13, 40, 10, 14],
  });
  todaySheet(wb, today, habits, focus);
  return wb;
}

function todaySheet(wb, ws, habits, focus) {
  title(ws, "Today", "One screen. Start with the smallest thing.", 5);
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

  put(ws, "B7", "Energy right now (1 = empty, 5 = full)", {
    font: { bold: true },
  });
  ws.mergeCells("B7:C7");
  input(ws, "D7", null, { align: "center", font: { bold: true } });
  list(ws, "D7", ["1", "2", "3", "4", "5"]);
  const energy = 'IFERROR(VALUE($D$7&""),0)';
  put(
    ws,
    "F7",
    {
      f: `IF(${energy}=0,"← pick a number",IF(${energy}<=2,"Low battery: something from your Dopamine Menu, then one Tiny task.",IF(${energy}=3,"Steady: one Small task, then a 5-minute break.","Good energy: start your Big task now, while it lasts.")))`,
    },
    { wrap: true, font: { color: { argb: C.blue }, bold: true } },
  );
  ws.getRow(7).height = 32;

  ws.getRow(9).height = 18;
  ws.getRow(10).height = 30;
  const todayOpen = `COUNTIFS(${BD("C")},"Today",${BD("F")},"<>✓")`;
  card(
    ws,
    "B9",
    "B10",
    "TO DO TODAY",
    { f: `COUNTIFS($C$13:$C$15,"<>",$D$13:$D$15,"<>✓")+${todayOpen}` },
    { fmt: "0", tone: C.warnBg },
  );
  ws.mergeCells("B9:C9");
  ws.mergeCells("B10:C10");
  const doneHabits = habits.refs
    .map((h) => `IF(AND(${h.name}<>"",${h.today}),1,0)`)
    .join("+");
  const allHabits = habits.refs.map((h) => `IF(${h.name}<>"",1,0)`).join("+");
  card(
    ws,
    "D9",
    "D10",
    "HABITS",
    { f: `(${doneHabits})&" / "&(${allHabits})` },
    { tone: C.goodBg },
  );
  card(
    ws,
    "F9",
    "F10",
    "FOCUS TODAY",
    {
      f: `SUMIFS('Focus Log'!${focus.mins},'Focus Log'!${focus.dates},TODAY())`,
    },
    { fmt: '0" min"' },
  );

  header(ws, 12, 2, ["", "Just 3 things", "Done", "", ""]);
  ws.mergeCells("E12:F12");
  for (let i = 0; i < 3; i++) {
    const r = 13 + i;
    put(ws, `B${r}`, i + 1, {
      align: "center",
      font: { bold: true, color: { argb: C.blue } },
    });
    input(ws, `C${r}`, null, { font: { bold: true } });
    input(ws, `D${r}`, null, { align: "center" });
    list(ws, `D${r}`, ["✓"]);
    ws.getRow(r).height = 22;
  }
  ws.addConditionalFormatting({
    ref: "C13:D15",
    rules: [
      {
        type: "expression",
        formulae: ['$D13="✓"'],
        style: {
          font: { strike: true, color: { argb: C.good } },
          fill: fillBg(C.goodBg),
        },
      },
    ],
  });

  header(ws, 17, 2, [
    "#",
    "Also today (from your Brain Dump)",
    "Size",
    "",
    "Tiny first step",
  ]);
  for (let k = 1; k <= 10; k++) {
    const r = 17 + k;
    put(ws, `H${r}`, { f: `IFERROR(SMALL(${BD("G")},${k}),"")` }); // hidden key = row number
    const pick = (col) => `IF($H${r}="","",INDEX(${BDT(col)},$H${r}))`;
    put(
      ws,
      `B${r}`,
      { f: `IF($H${r}="","",${k})` },
      { align: "center", font: { color: { argb: C.blue }, bold: true } },
    );
    put(
      ws,
      `C${r}`,
      { f: pick("B") },
      { border: { bottom: { style: "thin", color: { argb: C.line } } } },
    );
    put(
      ws,
      `D${r}`,
      { f: pick("D") },
      { font: { size: 9, color: { argb: C.muted } }, align: "center" },
    );
    put(
      ws,
      `F${r}`,
      {
        f: `IF($H${r}="","",IF(${pick("E")}="","Pick a 5-minute first step",${pick("E")}))`,
      },
      { font: { color: { argb: C.muted } } },
    );
  }
  ws.getColumn(8).hidden = true;
  note(
    ws,
    "B29",
    "Want something here? In Brain Dump, set When to Today. Tick ✓ there when it's done.",
  );

  header(ws, 31, 2, ["", "Habits today", "Done", "", "Streak"]);
  habits.refs.forEach((h, i) => {
    const r = 32 + i;
    put(ws, `C${r}`, { f: `IF(${h.name}="","",${h.name})` });
    put(
      ws,
      `D${r}`,
      { f: `IF(${h.name}="","",IF(${h.today},"✓","–"))` },
      { align: "center", font: { bold: true, color: { argb: C.good } } },
    );
    put(
      ws,
      `F${r}`,
      { f: `IF(${h.name}="","",${h.streak})` },
      { fmt: '0" 🔥"', align: "left" },
    );
  });
  note(
    ws,
    "B41",
    "Tick habits on the Habits tab, in today's (highlighted) row.",
  );
}

function brainDump(wb) {
  const ws = sheet(wb, "Brain Dump", {
    tab: C.blue,
    widths: [44, 13, 15, 34, 8],
    freeze: 5,
  });
  title(
    ws,
    "Brain Dump",
    "Empty your head here, one thing per row. Then give each a When.",
    5,
  );
  header(ws, 5, 2, [
    "Thought or task",
    "When",
    "Size",
    "Tiny first step",
    "Done",
  ]);
  for (let r = B0; r <= B1; r++) {
    input(ws, `B${r}`, null);
    input(ws, `C${r}`, null, { align: "center" });
    list(ws, `C${r}`, WHEN);
    input(ws, `D${r}`, null, { align: "center", font: { size: 9 } });
    list(ws, `D${r}`, SIZE);
    input(ws, `E${r}`, null, { font: { color: { argb: C.muted } } });
    input(ws, `F${r}`, null, { align: "center" });
    list(ws, `F${r}`, ["✓"]);
    put(ws, `G${r}`, {
      f: `IF(AND(B${r}<>"",C${r}="Today",F${r}<>"✓"),ROW(),"")`,
    });
  }
  ws.getColumn(7).hidden = true;
  ws.addConditionalFormatting({
    ref: `B${B0}:F${B1}`,
    rules: [
      {
        type: "expression",
        formulae: [`$F${B0}="✓"`],
        style: { font: { strike: true, color: { argb: C.faint } } },
      },
      {
        type: "expression",
        formulae: [`$C${B0}="Let it go"`],
        style: { font: { italic: true, color: { argb: C.faint } } },
      },
      {
        type: "expression",
        formulae: [`$C${B0}="Today"`],
        style: { fill: fillBg(C.warnBg) },
      },
    ],
  });
}

const ROUTINES = [
  [
    "Morning",
    [
      ["Water + meds", 2],
      ["Shower", 10],
      ["Get dressed", 5],
      ["Breakfast", 10],
      ["Check Today", 2],
    ],
  ],
  [
    "After work / school",
    [
      ["Bag and keys in their place", 2],
      ["Snack + water", 5],
      ["10-minute reset (tidy one area)", 10],
    ],
  ],
  [
    "Evening",
    [
      ["Clothes out for tomorrow", 5],
      ["Phone on charge outside the bedroom", 1],
      ["Brain dump anything on my mind", 5],
      ["Lights out", 1],
    ],
  ],
];

function routines(wb) {
  const ws = sheet(wb, "Routines", {
    tab: C.blue,
    widths: [36, 9, ...Array(7).fill(6)],
  });
  title(
    ws,
    "Routines",
    "The same steps in the same order, so you don't have to decide. Tick each day; clear the ticks on Monday.",
    9,
  );
  let r = 5;
  for (const [name, steps] of ROUTINES) {
    header(ws, r, 2, [name, "Minutes", ...DAYS]);
    const first = r + 1;
    const last = r + 8;
    for (let i = 0; i < 8; i++) {
      const row = first + i;
      input(ws, `B${row}`, steps[i]?.[0] ?? null);
      input(ws, `C${row}`, steps[i]?.[1] ?? null, { align: "center" });
      for (let d = 0; d < 7; d++) {
        const c = colName(4 + d);
        input(ws, `${c}${row}`, null, { align: "center" });
        list(ws, `${c}${row}`, ["✓"]);
      }
    }
    const t = last + 1;
    put(ws, `B${t}`, "Total time · steps done", {
      font: { bold: true, color: { argb: C.muted } },
    });
    put(
      ws,
      `C${t}`,
      { f: `SUM(C${first}:C${last})` },
      { fmt: '0" min"', align: "center", font: { bold: true } },
    );
    for (let d = 0; d < 7; d++) {
      const c = colName(4 + d);
      put(
        ws,
        `${c}${t}`,
        {
          f: `IF(COUNTA($B$${first}:$B$${last})=0,"",COUNTIF(${c}${first}:${c}${last},"✓")&"/"&COUNTA($B$${first}:$B$${last}))`,
        },
        {
          align: "center",
          font: { size: 9, color: { argb: C.muted } },
        },
      );
    }
    ws.addConditionalFormatting({
      ref: `D${first}:J${last}`,
      rules: [
        {
          type: "expression",
          formulae: [`D${first}="✓"`],
          style: {
            fill: fillBg(C.goodBg),
            font: { color: { argb: C.good }, bold: true },
          },
        },
      ],
    });
    r = t + 2;
  }
}

const MENU = [
  [
    "STARTERS: quick boosts (1–5 min)",
    [
      "Favourite song, loud",
      "Cold water on your face",
      "Step outside for 2 minutes",
      "Stretch with your arms up",
    ],
  ],
  [
    "MAINS: bigger energy (20+ min)",
    [
      "A walk or a run",
      "Cook something simple",
      "Call a friend",
      "A hobby you actually enjoy",
    ],
  ],
  [
    "SIDES: make boring tasks better",
    [
      "Podcast or playlist",
      "Body double (a friend or a video call)",
      "Timer race: beat 15 minutes",
      "Work somewhere new",
    ],
  ],
  [
    "DESSERTS: nice, but easy to overdo",
    [
      "Scrolling (set a 10-minute timer)",
      "One episode, not three",
      "Video games with an alarm",
    ],
  ],
  [
    "SPECIALS: once in a while",
    ["Day trip", "Concert or a match", "A new book or game"],
  ],
];

function dopamineMenu(wb) {
  const ws = sheet(wb, "Dopamine Menu", {
    tab: "FFD08726",
    widths: [42, 3, 42],
  });
  title(
    ws,
    "Dopamine Menu",
    "Your own list of things that give you energy. Pick from it when you're stuck.",
    3,
  );
  // Two columns: starters, mains, sides on the left; desserts, specials right.
  MENU.forEach(([section, items], i) => {
    const col = i < 3 ? "B" : "D";
    const r = 5 + (i % 3) * 8;
    header(ws, r, col === "B" ? 2 : 4, [section]);
    for (let k = 0; k < 6; k++)
      input(ws, `${col}${r + 1 + k}`, items[k] ?? null);
  });
}

// ---- Demo data -----------------------------------------------------------

export function fillDemo(wb, now = new Date()) {
  const day = (n) =>
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + n));
  const items = [
    [
      "Reply to Sam about Saturday",
      "Today",
      "Tiny (5 min)",
      "Open the chat",
      null,
    ],
    [
      "Pay the electricity bill",
      "Today",
      "Tiny (5 min)",
      "Log in to the app",
      "✓",
    ],
    [
      "Finish the report draft",
      "Today",
      "Big (1 hr+)",
      "Write the headings only",
      null,
    ],
    [
      "Book a dentist appointment",
      "Today",
      "Small (15 min)",
      "Find the number",
      null,
    ],
    ["Buy a birthday present for Mum", "Tomorrow", "Small (15 min)", "", null],
    [
      "Clean out the fridge",
      "This week",
      "Small (15 min)",
      "Bin bag next to the fridge",
      null,
    ],
    ["Learn Spanish", "Someday", "", "", null],
    ["Reorganise the whole garage", "Let it go", "", "", null],
    [
      "Return the library books",
      "Today",
      "Tiny (5 min)",
      "Put them by the door",
      null,
    ],
    ["Email the landlord about the tap", "This week", "Tiny (5 min)", "", null],
  ];
  const bd = wb.getWorksheet("Brain Dump");
  items.forEach((row, i) =>
    row.forEach((v, j) => (bd.getCell(B0 + i, 2 + j).value = v)),
  );

  const today = wb.getWorksheet("Today");
  today.getCell("D7").value = "3";
  ["Finish the report draft", "30-minute walk", "Call Gran"].forEach(
    (t, i) => (today.getCell(`C${13 + i}`).value = t),
  );
  today.getCell("D14").value = "✓";

  const hab = wb.getWorksheet("Habits");
  hab.getCell("C4").value = day(-20);
  // Ticks for days -20..0 (row 12 = day -20). Pattern per habit, "x" = ticked.
  const pattern = [
    "xxxxxxxxxxxxxxxxxxxxx", // meds: every day → streak 21
    "xxxx.xxxxxxx.xxxxxxx.", // water: today not yet ticked, yesterday ticked → streak 7
    "xx..xxx.x.xxxx..xxxxx", // move → 5
    "x.x.x.x.x.x.x.x.x.x.x", // outside → 1
    "...xxxxxxxxx........", // bed by 11 → 0 (best 9)
  ];
  pattern.forEach((p, h) =>
    [...p].forEach(
      (ch, i) => (hab.getCell(12 + i, 3 + h).value = ch === "x" ? "✓" : null),
    ),
  );

  const rt = wb.getWorksheet("Routines");
  for (const r of [6, 7, 8])
    for (const c of ["D", "E"]) rt.getCell(`${c}${r}`).value = "✓";

  const fl = wb.getWorksheet("Focus Log");
  [
    [-2, "Report outline", 25, "OK"],
    [-1, "Report section 1", 50, "Great"],
    [0, "Emails", 15, "OK"],
    [0, "Report section 2", 25, "Hard"],
  ].forEach((row, i) => {
    fl.getCell(`B${9 + i}`).value = day(row[0]);
    fl.getCell(`C${9 + i}`).value = row[1];
    fl.getCell(`D${9 + i}`).value = row[2];
    fl.getCell(`E${9 + i}`).value = row[3];
  });
  return { items, pattern };
}
