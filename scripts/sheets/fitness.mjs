/**
 * Workout & Weight Tracker: for Excel and Google Sheets.
 *
 *   Start Here · Dashboard · Weight · Workouts · Strength · Exercises
 *
 * Personal bests use a hidden "is this the heaviest lift for this exercise?"
 * flag per row (COUNTIFS), so no MAXIFS or array formulas are needed.
 */
import { guideSheet } from "./blocks.mjs";
import {
  C,
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

const W0 = 6; // Weight rows
const W1 = 505;
const K0 = 6; // Workouts rows
const K1 = 1005;
const S0 = 6; // Strength rows
const S1 = 1505;
const E0 = 6; // Exercises rows
const E1 = 45;
const WT = (col) => `Weight!$${col}$${W0}:$${col}$${W1}`;
const WK = (col) => `Workouts!$${col}$${K0}:$${col}$${K1}`;
const ST = (col) => `Strength!$${col}$${S0}:$${col}$${S1}`;
const TYPES = [
  "Strength",
  "Cardio",
  "Walk",
  "Run",
  "Cycle",
  "Swim",
  "Yoga",
  "Sport",
  "Class",
  "Other",
];
const INTENSITY = ["Easy", "Medium", "Hard"];
export const EXERCISES = [
  "Squat",
  "Deadlift",
  "Bench press",
  "Overhead press",
  "Barbell row",
  "Lat pulldown",
  "Leg press",
  "Hip thrust",
  "Dumbbell curl",
  "Plank (seconds)",
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

export function buildFitness() {
  const wb = workbook();
  guideSheet(
    wb,
    "Workout & Weight Tracker",
    "by Makeready · works in Google Sheets and Excel",
    [
      ["", "SET IT UP (2 MINUTES)", "h"],
      [
        "1",
        "Dashboard: type your starting weight, your goal, your unit (kg or lb) and the year.",
      ],
      [
        "2",
        "Exercises: the lifts you do (10 common ones are there). Add or rename your own.",
      ],
      ["", ""],
      ["", "AS YOU GO", "h"],
      [
        "→",
        "Weight: weigh in once a week, same day and time. Type the date and the number.",
      ],
      [
        "→",
        "Workouts: every session, any kind: date, type, minutes and how hard it felt.",
      ],
      [
        "→",
        "Strength: for lifting days, each exercise with sets, reps and weight. Personal bests update themselves.",
      ],
      [
        "→",
        "Dashboard: your progress to goal, this week, and every month of the year.",
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
    widths: [24, 13, 13, 13, 13, 22],
  }); // filled last
  weight(wb);
  workouts(wb);
  strength(wb);
  exercises(wb);
  dashboard(dash);
  return wb;
}

function dashboard(ws) {
  title(ws, "Dashboard", "Your progress, counted from your logs.", 6);
  [
    [5, "Starting weight", 82],
    [6, "Goal weight", 74],
    [7, "Unit", "kg"],
    [8, "Year", 2027],
  ].forEach(([r, label, v]) => {
    put(ws, `B${r}`, label, { font: { bold: true } });
    input(ws, `C${r}`, v, { align: "center" });
  });
  list(ws, "C7", ["kg", "lb"]);
  const current = `IFERROR(INDEX(${WT("C")},MATCH(9.99E+307,${WT("C")})),"")`;
  ws.getRow(10).height = 18;
  ws.getRow(11).height = 30;
  card(
    ws,
    "B10",
    "B11",
    "CURRENT",
    { f: `IF(${current}="","",${current})` },
    { fmt: "0.0", tone: C.sky },
  );
  card(
    ws,
    "C10",
    "C11",
    "LOST SO FAR",
    { f: `IF(${current}="","",$C$5-${current})` },
    { fmt: '0.0;"+"0.0;0', tone: C.goodBg },
  );
  card(
    ws,
    "D10",
    "D11",
    "TO GO",
    { f: `IF(${current}="","",MAX(0,${current}-$C$6))` },
    { fmt: "0.0" },
  );
  card(
    ws,
    "E10",
    "E11",
    "WORKOUTS THIS WEEK",
    {
      f: `COUNTIFS(${WK("B")},">="&(TODAY()-WEEKDAY(TODAY(),3)),${WK("B")},"<="&TODAY())`,
    },
    { fmt: "0", tone: C.warnBg },
  );
  ws.mergeCells("E10:F10");
  ws.mergeCells("E11:F11");
  const progress = `IF(OR(${current}="",N($C$5)=N($C$6)),"",MAX(0,MIN(1,($C$5-${current})/($C$5-$C$6))))`;
  put(ws, "B13", "Progress to goal", { font: { bold: true } });
  put(
    ws,
    "C13",
    { f: bar(progress, 30) },
    { font: { color: { argb: C.good } } },
  );
  ws.mergeCells("C13:E13");
  put(ws, "F13", { f: progress }, { fmt: PCT, font: { bold: true } });
  put(
    ws,
    "B14",
    {
      f: `IF(${current}="","Add your first weigh-in on the Weight tab.",COUNT(${WT("C")})&" weigh-ins, in "&$C$7)`,
    },
    { font: { size: 9, color: { argb: C.muted } } },
  );

  header(ws, 16, 2, [
    "Month",
    "Workouts",
    "Minutes",
    "Hours",
    "Avg weight",
    "",
  ]);
  for (let m = 0; m < 12; m++) {
    const r = 17 + m;
    const from = `DATE($C$8,${m + 1},1)`;
    const to = `EOMONTH(${from},0)`;
    put(ws, `B${r}`, MONTHS3[m], { font: { bold: true } });
    calc(
      ws,
      `C${r}`,
      { f: `COUNTIFS(${WK("B")},">="&${from},${WK("B")},"<="&${to})` },
      { fmt: '0;-0;"–"', align: "center" },
    );
    calc(
      ws,
      `D${r}`,
      { f: `SUMIFS(${WK("D")},${WK("B")},">="&${from},${WK("B")},"<="&${to})` },
      { fmt: '0;-0;"–"', align: "center" },
    );
    calc(
      ws,
      `E${r}`,
      { f: `IF(N(D${r})=0,"",D${r}/60)` },
      { fmt: "0.0", align: "center" },
    );
    calc(
      ws,
      `F${r}`,
      {
        f: `IFERROR(AVERAGEIFS(${WT("C")},${WT("B")},">="&${from},${WT("B")},"<="&${to}),"")`,
      },
      { fmt: "0.0", align: "center" },
    );
    calc(
      ws,
      `G${r}`,
      { f: `REPT("█",MIN(20,C${r}))` },
      { font: { color: { argb: C.blue } } },
    );
  }
  put(ws, "B29", "Year", { font: { bold: true } });
  calc(
    ws,
    "C29",
    { f: "SUM(C17:C28)" },
    { fmt: "0", align: "center", font: { bold: true } },
  );
  calc(
    ws,
    "D29",
    { f: "SUM(D17:D28)" },
    { fmt: "#,##0", align: "center", font: { bold: true } },
  );
  calc(
    ws,
    "E29",
    { f: "D29/60" },
    { fmt: "0.0", align: "center", font: { bold: true } },
  );
}

function weight(wb) {
  const ws = sheet(wb, "Weight", {
    tab: C.good,
    widths: [14, 11, 11, 12, 14, 34],
    freeze: 5,
  });
  title(
    ws,
    "Weight",
    "Once a week is plenty: same day, same time, same scales.",
    6,
  );
  header(ws, 5, 2, [
    "Date",
    "Weight",
    "Waist",
    "Change",
    "Since start",
    "Notes",
  ]);
  for (let r = W0; r <= W1; r++) {
    input(ws, `B${r}`, null, { fmt: "d mmm yyyy", align: "center" });
    input(ws, `C${r}`, null, {
      fmt: "0.0",
      align: "center",
      font: { bold: true },
    });
    input(ws, `D${r}`, null, { fmt: "0.0", align: "center" });
    calc(
      ws,
      `E${r}`,
      {
        f: r === W0 ? '""' : `IF(OR(C${r}="",C${r - 1}=""),"",C${r}-C${r - 1})`,
      },
      { fmt: '"+"0.0;-0.0;0.0', align: "center" },
    );
    calc(
      ws,
      `F${r}`,
      { f: `IF(C${r}="","",C${r}-Dashboard!$C$5)` },
      { fmt: '"+"0.0;-0.0;0.0', align: "center" },
    );
    input(ws, `G${r}`, null, { font: { size: 9, color: { argb: C.muted } } });
  }
  ws.addConditionalFormatting({
    ref: `E${W0}:F${W1}`,
    rules: [
      {
        type: "expression",
        formulae: [`AND(E${W0}<>"",E${W0}<0)`],
        style: { font: { color: { argb: C.good }, bold: true } },
      },
    ],
  });
}

function workouts(wb) {
  const ws = sheet(wb, "Workouts", {
    tab: C.blue,
    widths: [14, 14, 10, 11, 40],
    freeze: 5,
  });
  title(
    ws,
    "Workouts",
    "Every session counts: a walk, a class, a run, a lift.",
    5,
  );
  header(ws, 5, 2, ["Date", "Type", "Minutes", "How hard", "Notes"]);
  for (let r = K0; r <= K1; r++) {
    input(ws, `B${r}`, null, { fmt: "ddd d mmm yy", align: "center" });
    input(ws, `C${r}`, null, { align: "center" });
    list(ws, `C${r}`, TYPES);
    input(ws, `D${r}`, null, { align: "center" });
    input(ws, `E${r}`, null, { align: "center", font: { size: 9 } });
    list(ws, `E${r}`, INTENSITY);
    input(ws, `F${r}`, null, { font: { size: 9, color: { argb: C.muted } } });
  }
}

function strength(wb) {
  const ws = sheet(wb, "Strength", {
    tab: C.blue,
    widths: [14, 22, 8, 8, 10, 12, 30],
    freeze: 5,
  });
  title(
    ws,
    "Strength",
    "One row per exercise per session. Personal bests update on the Exercises tab.",
    7,
  );
  header(ws, 5, 2, [
    "Date",
    "Exercise",
    "Sets",
    "Reps",
    "Weight",
    "Volume",
    "Notes",
  ]);
  for (let r = S0; r <= S1; r++) {
    input(ws, `B${r}`, null, { fmt: "d mmm yy", align: "center" });
    input(ws, `C${r}`, null, { font: { bold: true } });
    list(ws, `C${r}`, `Exercises!$B$${E0}:$B$${E1}`);
    input(ws, `D${r}`, null, { align: "center" });
    input(ws, `E${r}`, null, { align: "center" });
    input(ws, `F${r}`, null, { align: "center" });
    calc(
      ws,
      `G${r}`,
      { f: `IF(C${r}="","",N(D${r})*N(E${r})*N(F${r}))` },
      { fmt: '#,##0;-#,##0;"–"', align: "center" },
    );
    input(ws, `H${r}`, null, { font: { size: 9, color: { argb: C.muted } } });
    // Hidden: heaviest lift of its exercise? / latest session of its exercise?
    put(ws, `I${r}`, {
      f: `IF(OR(C${r}="",F${r}=""),"",IF(COUNTIFS($C$${S0}:$C$${S1},C${r},$F$${S0}:$F$${S1},">"&F${r})=0,1,""))`,
    });
    put(ws, `J${r}`, {
      f: `IF(OR(C${r}="",B${r}=""),"",IF(COUNTIFS($C$${S0}:$C$${S1},C${r},$B$${S0}:$B$${S1},">"&B${r})=0,1,""))`,
    });
    put(ws, `K${r}`, {
      f: `IF(OR(C${r}="",G${r}=""),"",IF(COUNTIFS($C$${S0}:$C$${S1},C${r},$G$${S0}:$G$${S1},">"&G${r})=0,1,""))`,
    });
  }
  for (const c of [9, 10, 11]) ws.getColumn(c).hidden = true;
  ws.addConditionalFormatting({
    ref: `F${S0}:F${S1}`,
    rules: [
      {
        type: "expression",
        formulae: [`$I${S0}=1`],
        style: { font: { color: { argb: C.good }, bold: true } },
      },
    ],
  });
}

function exercises(wb) {
  const ws = sheet(wb, "Exercises", {
    tab: C.good,
    widths: [24, 14, 14, 10, 14],
  });
  title(
    ws,
    "Exercises",
    "Your lifts, your personal bests, and when you last did each one.",
    5,
  );
  header(ws, 5, 2, [
    "Exercise",
    "Best weight",
    "Last done",
    "Sessions",
    "Best volume",
  ]);
  for (let r = E0; r <= E1; r++) {
    input(ws, `B${r}`, EXERCISES[r - E0] ?? null, { font: { bold: true } });
    calc(
      ws,
      `C${r}`,
      {
        f: `IF(B${r}="","",IF(COUNTIFS(${ST("C")},B${r},${ST("I")},1)=0,"",AVERAGEIFS(${ST("F")},${ST("C")},B${r},${ST("I")},1)))`,
      },
      {
        fmt: "0.0",
        align: "center",
        font: { bold: true, color: { argb: C.good } },
      },
    );
    calc(
      ws,
      `D${r}`,
      {
        f: `IF(B${r}="","",IF(COUNTIFS(${ST("C")},B${r},${ST("J")},1)=0,"",AVERAGEIFS(${ST("B")},${ST("C")},B${r},${ST("J")},1)))`,
      },
      { fmt: "d mmm yy", align: "center" },
    );
    calc(
      ws,
      `E${r}`,
      { f: `IF(B${r}="","",COUNTIF(${ST("C")},B${r}))` },
      { fmt: '0;-0;"–"', align: "center" },
    );
    calc(
      ws,
      `F${r}`,
      {
        f: `IF(B${r}="","",IF(COUNTIFS(${ST("C")},B${r},${ST("K")},1)=0,"",AVERAGEIFS(${ST("G")},${ST("C")},B${r},${ST("K")},1)))`,
      },
      { fmt: "#,##0", align: "center" },
    );
  }
  note(
    ws,
    "B47",
    "Best weight counts the heaviest weight you've logged for each exercise.",
  );
}

// ---- Demo data -----------------------------------------------------------

export function fillDemo(wb, now = new Date()) {
  const day = (n) =>
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + n));
  wb.getWorksheet("Dashboard").getCell("C8").value = now.getFullYear();
  const weights = [82.0, 81.4, 81.1, 80.6, 80.8, 80.1, 79.5, 79.2];
  const wt = wb.getWorksheet("Weight");
  weights.forEach((w, i) => {
    wt.getCell(`B${W0 + i}`).value = day(-7 * (weights.length - 1 - i));
    wt.getCell(`C${W0 + i}`).value = w;
  });
  const sessions = [
    [-13, "Strength", 50, "Hard"],
    [-11, "Run", 30, "Medium"],
    [-9, "Strength", 45, "Hard"],
    [-7, "Yoga", 40, "Easy"],
    [-6, "Strength", 55, "Hard"],
    [-4, "Walk", 60, "Easy"],
    [-2, "Strength", 50, "Medium"],
    [-1, "Run", 25, "Medium"],
    [0, "Class", 45, "Hard"],
  ];
  const wk = wb.getWorksheet("Workouts");
  sessions.forEach(([d, type, min, how], i) => {
    wk.getCell(`B${K0 + i}`).value = day(d);
    wk.getCell(`C${K0 + i}`).value = type;
    wk.getCell(`D${K0 + i}`).value = min;
    wk.getCell(`E${K0 + i}`).value = how;
  });
  const lifts = [
    [-13, "Squat", 3, 8, 60],
    [-13, "Bench press", 3, 8, 45],
    [-9, "Deadlift", 3, 5, 90],
    [-9, "Squat", 3, 8, 62.5],
    [-6, "Bench press", 3, 8, 47.5],
    [-6, "Squat", 3, 6, 65],
    [-2, "Deadlift", 3, 5, 95],
    [-2, "Bench press", 3, 6, 47.5],
  ];
  const st = wb.getWorksheet("Strength");
  lifts.forEach(([d, ex, sets, reps, w], i) => {
    st.getCell(`B${S0 + i}`).value = day(d);
    st.getCell(`C${S0 + i}`).value = ex;
    st.getCell(`D${S0 + i}`).value = sets;
    st.getCell(`E${S0 + i}`).value = reps;
    st.getCell(`F${S0 + i}`).value = w;
  });
  return { weights, sessions, lifts, day };
}
