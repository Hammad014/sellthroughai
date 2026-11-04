/**
 * ADHD Student Planner: assignment tracker for Excel and Google Sheets.
 *
 *   Start Here · Today · This Week · Assignments · Classes · Exams · Focus Log
 *
 * "Today" answers one question: what do I do next? Open assignments are
 * sorted by a hidden key (due date × 10000 + row), which SMALL() can walk
 * without array formulas, so it works the same in both apps.
 */
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
import { guideSheet } from "./blocks.mjs";

const A0 = 6; // Assignments rows
const A1 = 305;
const CL0 = 6; // Classes rows
const CL1 = 17;
const F0 = 9; // Focus log rows (cards sit above)
const F1 = 508;

const A = (col) => `Assignments!$${col}$${A0}:$${col}$${A1}`;
const AT = (col) => `Assignments!$${col}$1:$${col}$${A1}`; // for INDEX by row number
const KEY = A("L");
const CLASSES = `Classes!$B$${CL0}:$B$${CL1}`;
const TYPES = [
  "Homework",
  "Reading",
  "Essay",
  "Project",
  "Quiz",
  "Exam",
  "Lab",
  "Other",
];
const STATUS = ["Not started", "In progress", "Done"];

const fillBg = (argb) => ({
  type: "pattern",
  pattern: "solid",
  bgColor: { argb },
});

export function buildStudent() {
  const wb = workbook();
  startHere(wb);
  today(wb);
  week(wb);
  assignments(wb);
  classes(wb);
  exams(wb);
  focusLog(wb);
  return wb;
}

function startHere(wb) {
  guideSheet(
    wb,
    "Student Planner",
    "by Makeready · made for ADHD brains · works in Google Sheets and Excel",
    [
      ["", "SET IT UP (10 MINUTES, ONCE)", "h"],
      [
        "1",
        "Classes: type your classes (and teacher, room, office hours if you like).",
      ],
      [
        "2",
        "Assignments: add everything from your syllabus: class, task, type and due date. Don't sort anything; the planner does that.",
      ],
      ["3", "Exams: add your exam dates to get a countdown."],
      ["", ""],
      ["", "EVERY DAY (2 MINUTES)", "h"],
      [
        "→",
        "Open Today. It shows only what's next, most urgent first. Do the top one's tiny first step. That's it.",
      ],
      [
        "→",
        "Finished something? Set its Status to Done in Assignments and it disappears from Today.",
      ],
      [
        "→",
        "Studied? Log the minutes in Focus Log. Seeing the minutes add up is the point.",
      ],
      ["", ""],
      ["", "WHY IT WORKS FOR ADHD", "h"],
      ["•", "One screen, one question: what now? No long lists to scan."],
      [
        "•",
        "Every task gets a tiny first step (“open the doc and write the title”), so starting is easy.",
      ],
      [
        "•",
        "Overdue isn't hidden or shamed: it's just first in line, in red, until it's done.",
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
}

/** k-th open assignment by due date: key, then any column of that row. */
const nth = (k) => `IFERROR(SMALL(${KEY},${k}),"")`;
const pick = (keyCell, col) =>
  `IF(${keyCell}="","",INDEX(${AT(col)},MOD(${keyCell},10000)))`;

function today(wb) {
  const ws = sheet(wb, "Today", {
    tab: C.navy,
    widths: [5, 16, 36, 13, 14, 38],
  });
  title(
    ws,
    "Today",
    "What to do next, most urgent first. Just start the top one.",
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
  ws.mergeCells("B5:D5");

  ws.getRow(7).height = 18;
  ws.getRow(8).height = 30;
  card(
    ws,
    "B7",
    "B8",
    "OVERDUE",
    { f: `COUNTIF(${A("J")},"Overdue")` },
    { fmt: "0", tone: C.badBg },
  );
  ws.mergeCells("B7:C7");
  ws.mergeCells("B8:C8");
  card(
    ws,
    "D7",
    "D8",
    "DUE IN 7 DAYS",
    { f: `COUNTIF(${A("J")},"Due today")+COUNTIF(${A("J")},"This week")` },
    { fmt: "0", tone: C.warnBg },
  );
  card(
    ws,
    "E7",
    "E8",
    "DONE",
    { f: `COUNTIF(${A("F")},"Done")` },
    { fmt: "0", tone: C.goodBg },
  );
  ws.mergeCells("E7:F7");
  ws.mergeCells("E8:F8");
  card(
    ws,
    "G7",
    "G8",
    "TERM PROGRESS",
    {
      f: `IF(COUNTA(${A("C")})=0,"",COUNTIF(${A("F")},"Done")/COUNTA(${A("C")}))`,
    },
    { fmt: PCT },
  );

  header(ws, 10, 2, [
    "#",
    "Class",
    "Next up",
    "Due",
    "When",
    "Tiny first step",
  ]);
  for (let k = 1; k <= 12; k++) {
    const r = 10 + k;
    put(ws, `J${r}`, { f: nth(k) }); // hidden key
    calc(
      ws,
      `B${r}`,
      { f: `IF($J${r}="","",${k})` },
      { align: "center", font: { bold: true, color: { argb: C.blue } } },
    );
    calc(ws, `C${r}`, { f: pick(`$J${r}`, "B") }, { font: { bold: true } });
    calc(ws, `D${r}`, { f: pick(`$J${r}`, "C") });
    calc(
      ws,
      `E${r}`,
      { f: pick(`$J${r}`, "E") },
      { fmt: "ddd d mmm", align: "center" },
    );
    calc(
      ws,
      `F${r}`,
      {
        f: `IF($J${r}="","",IF(E${r}<TODAY(),IF(TODAY()-E${r}=1,"1 day late",TODAY()-E${r}&" days late"),IF(E${r}=TODAY(),"Today",IF(E${r}=TODAY()+1,"Tomorrow","In "&(E${r}-TODAY())&" days"))))`,
      },
      { align: "center" },
    );
    calc(
      ws,
      `G${r}`,
      {
        f: `IF($J${r}="","",IF(${pick(`$J${r}`, "G")}="","Decide the first 5-minute step",${pick(`$J${r}`, "G")}))`,
      },
      { font: { color: { argb: C.muted } } },
    );
  }
  ws.getColumn(10).hidden = true;
  ws.addConditionalFormatting({
    ref: "B11:G22",
    rules: [
      {
        type: "expression",
        formulae: ['AND($E11<>"",$E11<TODAY())'],
        style: { fill: fillBg(C.badBg), font: { color: { argb: C.bad } } },
      },
      {
        type: "expression",
        formulae: ['AND($E11<>"",$E11-TODAY()<=1)'],
        style: { fill: fillBg(C.warnBg) },
      },
    ],
  });
  ws.getRow(11).height = 24;
  note(
    ws,
    "B24",
    "Nothing here? Everything is done, or nothing has a due date yet. Add tasks in Assignments.",
  );
}

function week(wb) {
  const ws = sheet(wb, "This Week", { tab: C.blue, widths: Array(7).fill(22) });
  title(ws, "This Week", "Everything due each day that isn't done yet.", 7);
  put(ws, "B4", "Week", { font: { bold: true } });
  input(ws, "C4", 0, { align: "center" });
  list(ws, "C4", ["-1", "0", "1", "2", "3"]);
  note(ws, "D4", "0 = this week · 1 = next week · -1 = last week");
  ws.mergeCells("D4:F4");
  ws.getRow(6).height = 24;
  for (let d = 0; d < 7; d++) {
    const c = colName(2 + d);
    put(
      ws,
      `${c}6`,
      { f: `TODAY()-WEEKDAY(TODAY(),3)+7*IFERROR(VALUE($C$4&""),0)+${d}` },
      {
        fmt: "dddd d",
        font: { bold: true, color: { argb: C.white } },
        fill: C.navy,
        align: "center",
      },
    );
    for (let k = 1; k <= 8; k++) {
      const r = 6 + k;
      const lo = `${c}$6*10000`;
      const idx = `COUNTIF(${KEY},"<"&${lo})+${k}`;
      const key = `SMALL(${KEY},${idx})`;
      calc(
        ws,
        `${c}${r}`,
        {
          f: `IFERROR(IF(${key}<(${c}$6+1)*10000,INDEX(${AT("B")},MOD(${key},10000))&": "&INDEX(${AT("C")},MOD(${key},10000)),""),"")`,
        },
        { wrap: true, font: { size: 9 } },
      );
    }
  }
  for (let r = 7; r <= 14; r++) ws.getRow(r).height = 34;
  ws.addConditionalFormatting({
    ref: "B6:H6",
    rules: [
      {
        type: "expression",
        formulae: ["B6=TODAY()"],
        style: { fill: fillBg(C.blue) },
      },
    ],
  });
  ws.addConditionalFormatting({
    ref: "B7:H14",
    rules: [
      {
        type: "expression",
        formulae: ['AND(B7<>"",B$6<TODAY())'],
        style: { font: { color: { argb: C.bad } } },
      },
    ],
  });
}

function assignments(wb) {
  const ws = sheet(wb, "Assignments", {
    tab: C.blue,
    widths: [16, 34, 12, 13, 13, 34, 9, 10, 12, 8],
    freeze: 5,
  });
  title(
    ws,
    "Assignments",
    "Add everything from your syllabus. The planner sorts it; you just mark things Done.",
    10,
  );
  header(ws, 5, 2, [
    "Class",
    "Task",
    "Type",
    "Due date",
    "Status",
    "Tiny first step",
    "Minutes",
    "Days left",
    "Priority",
    "Grade",
  ]);
  for (let r = A0; r <= A1; r++) {
    input(ws, `B${r}`, null);
    list(ws, `B${r}`, CLASSES);
    input(ws, `C${r}`, null);
    input(ws, `D${r}`, null, { align: "center" });
    list(ws, `D${r}`, TYPES);
    input(ws, `E${r}`, null, { fmt: "ddd d mmm", align: "center" });
    input(ws, `F${r}`, null, { align: "center" });
    list(ws, `F${r}`, STATUS);
    input(ws, `G${r}`, null, { font: { color: { argb: C.muted } } });
    input(ws, `H${r}`, null, { align: "center" });
    calc(
      ws,
      `I${r}`,
      { f: `IF(OR(C${r}="",E${r}="",F${r}="Done"),"",E${r}-TODAY())` },
      { align: "center" },
    );
    calc(
      ws,
      `J${r}`,
      {
        f: `IF(C${r}="","",IF(F${r}="Done","Done",IF(E${r}="","No date",IF(E${r}<TODAY(),"Overdue",IF(E${r}=TODAY(),"Due today",IF(E${r}-TODAY()<=7,"This week","Later"))))))`,
      },
      { align: "center", font: { bold: true, size: 9 } },
    );
    input(ws, `K${r}`, null, { align: "center" });
    put(ws, `L${r}`, {
      f: `IF(OR(C${r}="",E${r}="",F${r}="Done"),"",E${r}*10000+ROW())`,
    });
    // 1 on each class's earliest open task (lets Classes find "next due" without MINIFS).
    put(ws, `M${r}`, {
      f: `IF(L${r}="","",IF(COUNTIFS($B$${A0}:$B$${A1},B${r},$L$${A0}:$L$${A1},"<"&L${r})=0,1,""))`,
    });
  }
  ws.getColumn(12).hidden = true;
  ws.getColumn(13).hidden = true;
  ws.addConditionalFormatting({
    ref: `J${A0}:J${A1}`,
    rules: [
      {
        type: "expression",
        formulae: [`J${A0}="Overdue"`],
        style: { fill: fillBg(C.badBg), font: { color: { argb: C.bad } } },
      },
      {
        type: "expression",
        formulae: [`J${A0}="Due today"`],
        style: {
          fill: fillBg(C.warnBg),
          font: { color: { argb: "FFB35C00" } },
        },
      },
      {
        type: "expression",
        formulae: [`J${A0}="This week"`],
        style: { font: { color: { argb: C.blue } } },
      },
      {
        type: "expression",
        formulae: [`J${A0}="Done"`],
        style: { fill: fillBg(C.goodBg), font: { color: { argb: C.good } } },
      },
    ],
  });
  ws.addConditionalFormatting({
    ref: `B${A0}:H${A1}`,
    rules: [
      {
        type: "expression",
        formulae: [`$F${A0}="Done"`],
        style: { font: { color: { argb: C.faint }, strike: true } },
      },
    ],
  });
}

function classes(wb) {
  const ws = sheet(wb, "Classes", {
    tab: C.good,
    widths: [18, 18, 16, 16, 8, 8, 22, 7, 13, 10, 11],
  });
  title(ws, "Classes", "Your classes and how each one is going.", 11);
  header(ws, 5, 2, [
    "Class",
    "Teacher",
    "Room / link",
    "Office hours",
    "Tasks",
    "Done",
    "Progress",
    "%",
    "Next due",
    "Avg grade",
    "Focus mins",
  ]);
  for (let r = CL0; r <= CL1; r++) {
    input(ws, `B${r}`, null, { font: { bold: true } });
    input(ws, `C${r}`, null);
    input(ws, `D${r}`, null);
    input(ws, `E${r}`, null);
    calc(
      ws,
      `F${r}`,
      { f: `IF(B${r}="","",COUNTIF(${A("B")},B${r}))` },
      { align: "center" },
    );
    calc(
      ws,
      `G${r}`,
      { f: `IF(B${r}="","",COUNTIFS(${A("B")},B${r},${A("F")},"Done"))` },
      { align: "center" },
    );
    calc(
      ws,
      `H${r}`,
      { f: bar(`IF(OR(B${r}="",N(F${r})=0),"",G${r}/F${r})`, 14) },
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
        f: `IF(B${r}="","",IF(COUNTIFS(${A("B")},B${r},${A("M")},1)=0,"",SUMIFS(${A("E")},${A("B")},B${r},${A("M")},1)))`,
      },
      { fmt: "ddd d mmm", align: "center" },
    );
    calc(
      ws,
      `K${r}`,
      {
        f: `IF(B${r}="","",IFERROR(AVERAGEIFS(${A("K")},${A("B")},B${r},${A("K")},"<>"),""))`,
      },
      { fmt: "0", align: "center" },
    );
    calc(
      ws,
      `L${r}`,
      {
        f: `IF(B${r}="","",SUMIF('Focus Log'!$C$${F0}:$C$${F1},B${r},'Focus Log'!$D$${F0}:$D$${F1}))`,
      },
      { fmt: "0", align: "center" },
    );
  }
}

function exams(wb) {
  const ws = sheet(wb, "Exams", {
    tab: "FFC0392B",
    widths: [18, 24, 14, 40, 10, 16],
  });
  title(
    ws,
    "Exams",
    "Countdown to every exam, and how ready you feel (1 = not at all, 5 = ready).",
    7,
  );
  header(ws, 5, 2, ["Class", "Exam", "Date", "Topics", "Ready?", "Countdown"]);
  for (let r = 6; r <= 25; r++) {
    input(ws, `B${r}`, null);
    list(ws, `B${r}`, CLASSES);
    input(ws, `C${r}`, null);
    input(ws, `D${r}`, null, { fmt: DATE, align: "center" });
    input(ws, `E${r}`, null, { wrap: true });
    input(ws, `F${r}`, null, { align: "center" });
    list(ws, `F${r}`, ["1", "2", "3", "4", "5"]);
    calc(
      ws,
      `G${r}`,
      {
        f: `IF(D${r}="","",IF(D${r}<TODAY(),"Done",IF(D${r}=TODAY(),"Today!",IF(D${r}-TODAY()=1,"Tomorrow",D${r}-TODAY()&" days"))))`,
      },
      { align: "center", font: { bold: true } },
    );
  }
  ws.addConditionalFormatting({
    ref: "G6:G25",
    rules: [
      {
        type: "expression",
        formulae: ['AND(D6<>"",D6>=TODAY(),D6-TODAY()<=7)'],
        style: { fill: fillBg(C.badBg), font: { color: { argb: C.bad } } },
      },
      {
        type: "expression",
        formulae: ['AND(D6<>"",D6-TODAY()>7,D6-TODAY()<=21)'],
        style: { fill: fillBg(C.warnBg) },
      },
    ],
  });
}

function focusLog(wb) {
  const ws = sheet(wb, "Focus Log", {
    tab: C.good,
    widths: [13, 18, 10, 46],
    freeze: 8,
  });
  title(
    ws,
    "Focus Log",
    "Every study session counts. Log the minutes and watch them add up.",
    5,
  );
  ws.getRow(5).height = 18;
  ws.getRow(6).height = 30;
  const wk = "TODAY()-WEEKDAY(TODAY(),3)";
  card(
    ws,
    "B5",
    "B6",
    "TODAY",
    { f: `SUMIFS($D$${F0}:$D$${F1},$B$${F0}:$B$${F1},TODAY())` },
    { fmt: '0" min"', tone: C.goodBg },
  );
  card(
    ws,
    "C5",
    "C6",
    "THIS WEEK",
    { f: `SUMIFS($D$${F0}:$D$${F1},$B$${F0}:$B$${F1},">="&${wk})` },
    { fmt: '0" min"' },
  );
  ws.mergeCells("C5:D5");
  ws.mergeCells("C6:D6");
  card(
    ws,
    "E5",
    "E6",
    "ALL TERM",
    { f: `SUM($D$${F0}:$D$${F1})/60` },
    { fmt: '0.0" hours"' },
  );
  header(ws, 8, 2, ["Date", "Class", "Minutes", "What I did"]);
  for (let r = F0; r <= F1; r++) {
    input(ws, `B${r}`, null, { fmt: DATE, align: "center" });
    input(ws, `C${r}`, null);
    list(ws, `C${r}`, CLASSES);
    input(ws, `D${r}`, null, { align: "center" });
    input(ws, `E${r}`, null);
  }
}

// ---- Demo data -----------------------------------------------------------

export function fillDemo(wb, now = new Date()) {
  const day = (n) => {
    const d = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
    );
    d.setUTCDate(d.getUTCDate() + n);
    return d;
  };
  const cls = wb.getWorksheet("Classes");
  const classList = [
    ["Biology 101", "Dr. Okafor", "Room 214", "Tue 2–3pm"],
    ["Intro Psychology", "Prof. Lane", "Zoom link", "Thu 11–12"],
    ["Calculus I", "Dr. Reyes", "Hall B", "Mon 4–5pm"],
    ["English Lit", "Ms. Patel", "Room 108", "Wed 1–2pm"],
    ["World History", "Mr. Chen", "Room 302", "Fri 10–11"],
  ];
  classList.forEach((row, i) =>
    row.forEach((v, j) => (cls.getCell(CL0 + i, 2 + j).value = v)),
  );

  const tasks = [
    [
      "Calculus I",
      "Problem set 4",
      "Homework",
      -2,
      "In progress",
      "Do question 1 only",
      45,
      null,
    ],
    [
      "English Lit",
      "Read chapters 5–6",
      "Reading",
      0,
      "Not started",
      "Read 5 pages, then decide",
      40,
      null,
    ],
    [
      "Biology 101",
      "Lab report: enzymes",
      "Lab",
      1,
      "In progress",
      "Paste the results table",
      60,
      null,
    ],
    [
      "Intro Psychology",
      "Quiz: memory",
      "Quiz",
      2,
      "Not started",
      "Skim the slide titles",
      20,
      null,
    ],
    [
      "World History",
      "Essay outline",
      "Essay",
      4,
      "Not started",
      "Write 3 bullet points",
      30,
      null,
    ],
    ["Calculus I", "Problem set 5", "Homework", 6, "Not started", "", 45, null],
    [
      "Biology 101",
      "Chapter 7 notes",
      "Reading",
      8,
      "Not started",
      "Copy the headings",
      30,
      null,
    ],
    [
      "English Lit",
      "Poetry analysis",
      "Essay",
      12,
      "Not started",
      "Pick the poem",
      90,
      null,
    ],
    [
      "Intro Psychology",
      "Research project proposal",
      "Project",
      16,
      "Not started",
      "Choose 2 topics",
      60,
      null,
    ],
    ["Calculus I", "Problem set 3", "Homework", -6, "Done", "", 45, 88],
    ["English Lit", "Reading response 2", "Essay", -5, "Done", "", 30, 92],
    ["Biology 101", "Quiz: cells", "Quiz", -4, "Done", "", 20, 85],
    ["World History", "Map quiz", "Quiz", -3, "Done", "", 15, 95],
    [
      "Intro Psychology",
      "Reading: chapter 3",
      "Reading",
      -1,
      "Done",
      "",
      30,
      null,
    ],
  ];
  const as = wb.getWorksheet("Assignments");
  tasks.forEach(([c, t, ty, due, st, step, min, grade], i) => {
    const r = A0 + i;
    as.getCell(`B${r}`).value = c;
    as.getCell(`C${r}`).value = t;
    as.getCell(`D${r}`).value = ty;
    as.getCell(`E${r}`).value = day(due);
    as.getCell(`F${r}`).value = st;
    as.getCell(`G${r}`).value = step || null;
    as.getCell(`H${r}`).value = min;
    as.getCell(`K${r}`).value = grade;
  });

  const ex = wb.getWorksheet("Exams");
  [
    ["Biology 101", "Midterm", 9, "Cells, enzymes, photosynthesis", "3"],
    ["Calculus I", "Midterm", 15, "Limits, derivatives", "2"],
    ["Intro Psychology", "Final", 40, "Everything", "1"],
  ].forEach(([c, e, d, topics, ready], i) => {
    const r = 6 + i;
    ex.getCell(`B${r}`).value = c;
    ex.getCell(`C${r}`).value = e;
    ex.getCell(`D${r}`).value = day(d);
    ex.getCell(`E${r}`).value = topics;
    ex.getCell(`F${r}`).value = ready;
  });

  const fl = wb.getWorksheet("Focus Log");
  [
    [-3, "Calculus I", 25, "Problem set 3, questions 1–4"],
    [-2, "English Lit", 40, "Reading response draft"],
    [-1, "Biology 101", 50, "Lab results table"],
    [-1, "Intro Psychology", 25, "Chapter 3"],
    [0, "Calculus I", 25, "Problem set 4, question 1"],
  ].forEach(([d, c, m, what], i) => {
    const r = F0 + i;
    fl.getCell(`B${r}`).value = day(d);
    fl.getCell(`C${r}`).value = c;
    fl.getCell(`D${r}`).value = m;
    fl.getCell(`E${r}`).value = what;
  });
  return { tasks, day };
}
