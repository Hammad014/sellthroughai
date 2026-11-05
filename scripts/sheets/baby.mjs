/**
 * Pregnancy & Baby Tracker: for Excel and Google Sheets.
 *
 *   Start Here · Dashboard · Week by Week · Appointments · Bump Log ·
 *   Hospital Bag · Baby Log
 *
 * From the due date: how far along you are (week + day, trimester, days to
 * go, baby's size), the next appointment, hospital-bag progress, and, once
 * the baby's here, today's feeds, nappies and sleep.
 */
import { guideSheet } from "./blocks.mjs";
import {
  C,
  DATE,
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

const A0 = 6; // Appointments rows
const A1 = 55;
const L0 = 9; // Baby Log rows (cards above)
const L1 = 1508;
const DUE = "Dashboard!$C$5";
const AP = (col) => `Appointments!$${col}$${A0}:$${col}$${A1}`;
const APT = (col) => `Appointments!$${col}$1:$${col}$${A1}`;
const BL = (col) => `'Baby Log'!$${col}$${L0}:$${col}$${L1}`;
const APPT_TYPES = [
  "Midwife",
  "Doctor",
  "Scan",
  "Blood test",
  "Antenatal class",
  "Hospital tour",
  "Other",
];
const LOG_TYPES = [
  "Feed",
  "Wet nappy",
  "Dirty nappy",
  "Sleep",
  "Medicine",
  "Other",
];
const FEED = ["Left", "Right", "Both", "Bottle", "Pumped"];
const MOODS = ["Great", "Good", "OK", "Tired", "Rough"];

/** Common "about the size of" comparisons, weeks 4–40. */
export const SIZES = [
  "a poppy seed",
  "a sesame seed",
  "a lentil",
  "a blueberry",
  "a raspberry",
  "a grape",
  "a kumquat",
  "a fig",
  "a lime",
  "a lemon",
  "a nectarine",
  "an apple",
  "an avocado",
  "a pear",
  "a bell pepper",
  "a mango",
  "a banana",
  "a carrot",
  "a papaya",
  "a grapefruit",
  "an ear of corn",
  "a cauliflower",
  "a lettuce",
  "an aubergine",
  "a butternut squash",
  "a cabbage",
  "a coconut",
  "a squash",
  "a pineapple",
  "a cantaloupe melon",
  "a honeydew melon",
  "a romaine lettuce",
  "a bunch of Swiss chard",
  "a leek",
  "a mini watermelon",
  "a small pumpkin",
  "a watermelon",
];

const BAG = {
  "For you": [
    "Maternity notes and birth plan",
    "Comfy nightdress or big T-shirt",
    "Dressing gown and slippers",
    "Maternity pads",
    "Big comfy knickers",
    "Nursing bras",
    "Toiletries and lip balm",
    "Phone charger (long cable)",
    "Snacks and drinks",
    "Hair ties",
    "Going-home clothes",
    "Glasses / contact lenses",
  ],
  "For baby": [
    "Newborn nappies",
    "Cotton wool or water wipes",
    "Vests (newborn + 0–3m)",
    "Sleepsuits",
    "Hat and socks",
    "Muslins",
    "Blanket",
    "Car seat (fitted!)",
    "Going-home outfit",
    "Formula and bottles (if using)",
  ],
  "For your partner": [
    "Change of clothes",
    "Snacks and drinks",
    "Phone charger",
    "Change for parking",
    "Pillow",
    "Something to read",
  ],
};

const fillBg = (argb) => ({
  type: "pattern",
  pattern: "solid",
  bgColor: { argb },
});

export function buildBaby() {
  const wb = workbook();
  guideSheet(
    wb,
    "Pregnancy & Baby Tracker",
    "by Makeready · works in Google Sheets and Excel",
    [
      ["", "SET IT UP (1 MINUTE)", "h"],
      [
        "1",
        "Dashboard: type your due date. Everything else (week, trimester, days to go, baby's size) works itself out.",
      ],
      ["", ""],
      ["", "DURING PREGNANCY", "h"],
      [
        "→",
        "Appointments: every midwife visit, scan and class, with questions to ask. The next one shows on the Dashboard.",
      ],
      [
        "→",
        "Bump Log: weight, bump, symptoms and mood now and then. Your week fills in from the date.",
      ],
      [
        "→",
        "Hospital Bag: a checklist for you, baby and your partner. Tick as you pack.",
      ],
      [
        "→",
        "Week by Week: baby's size every week, with room for your own notes and photos.",
      ],
      ["", ""],
      ["", "ONCE BABY'S HERE", "h"],
      [
        "→",
        "Baby Log: feeds, nappies and sleep. Today's totals show at the top and on the Dashboard.",
      ],
      ["", ""],
      ["", "PLEASE NOTE", "h"],
      [
        "•",
        "This is a planner, not medical advice. Always follow your midwife or doctor.",
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
    widths: [32, 14, 14, 14, 3, 30, 14],
  }); // filled last
  weeks(wb);
  appointments(wb);
  bumpLog(wb);
  hospitalBag(wb);
  babyLog(wb);
  dashboard(dash);
  return wb;
}

/** Days pregnant on a date (standard 280-day count from the due date). */
const daysOn = (d) => `(280-(${DUE}-${d}))`;

function dashboard(ws) {
  title(ws, "Dashboard", "Type your due date. The rest works itself out.", 7);
  put(ws, "B5", "Due date", { font: { bold: true } });
  input(ws, "C5", new Date(Date.UTC(2027, 4, 1)), {
    fmt: DATE,
    align: "center",
    font: { bold: true },
  });
  ws.mergeCells("C5:D5");
  put(ws, "B6", "Baby's name (if you know it)", { font: { bold: true } });
  input(ws, "C6", null, { align: "center" });
  ws.mergeCells("C6:D6");
  const days = daysOn("TODAY()");
  put(ws, "J5", { f: `IF($C$5="","",${days})` }); // hidden: days pregnant today
  ws.getColumn(10).hidden = true;
  const ok = `AND($J$5<>"",$J$5>=0,$J$5<=294)`;
  ws.getRow(8).height = 18;
  ws.getRow(9).height = 30;
  card(
    ws,
    "B8",
    "B9",
    "HOW FAR ALONG",
    {
      f: `IF(${ok},INT($J$5/7)&" weeks "&MOD($J$5,7)&" days",IF($J$5>294,"Baby's here?","–"))`,
    },
    { tone: C.goodBg },
  );
  card(ws, "C8", "C9", "TRIMESTER", {
    f: `IF(${ok},IF(INT($J$5/7)<13,"1st",IF(INT($J$5/7)<27,"2nd","3rd")),"–")`,
  });
  card(
    ws,
    "D8",
    "D9",
    "DAYS TO GO",
    { f: `IF(${ok},MAX(0,$C$5-TODAY()),"–")` },
    { fmt: "0", tone: C.warnBg },
  );
  card(
    ws,
    "F8",
    "F9",
    "BABY IS ABOUT THE SIZE OF",
    {
      f: `IF(AND(${ok},INT($J$5/7)>=4),INDEX('Week by Week'!$C$6:$C$42,MIN(40,INT($J$5/7))-3),"–")`,
    },
    { tone: C.sky },
  );
  ws.mergeCells("F8:G8");
  ws.mergeCells("F9:G9");
  put(
    ws,
    "B11",
    { f: bar(`IF(${ok},MIN(1,$J$5/280),"")`, 40) },
    { font: { color: { argb: "FFD46A8C" }, size: 12 } },
  );
  ws.mergeCells("B11:F11");
  put(
    ws,
    "G11",
    { f: `IF(${ok},TEXT(MIN(1,$J$5/280),"0%")&" of the way","")` },
    { font: { bold: true } },
  );

  header(ws, 13, 2, [
    "Next appointments",
    "Date",
    "Time",
    "When",
    "",
    "Hospital bag",
    "",
  ]);
  for (let k = 1; k <= 4; k++) {
    const r = 13 + k;
    put(ws, `I${r}`, { f: `IFERROR(SMALL(${AP("I")},${k}),"")` }); // hidden key
    const pick = (col) =>
      `IF($I${r}="","",IF(INDEX(${APT(col)},MOD($I${r},10000))="","",INDEX(${APT(col)},MOD($I${r},10000))))`;
    calc(
      ws,
      `B${r}`,
      {
        f: `IF($I${r}="","",${pick("D")}&IF(${pick("E")}="",""," · "&${pick("E")}))`,
      },
      { font: { bold: true } },
    );
    calc(ws, `C${r}`, { f: pick("B") }, { fmt: "ddd d mmm", align: "center" });
    calc(ws, `D${r}`, { f: pick("C") }, { align: "center" });
    calc(
      ws,
      `E${r}`,
      { f: pick("H") },
      { align: "center", font: { color: { argb: C.blue }, bold: true } },
    );
  }
  ws.getColumn(9).hidden = true;
  Object.keys(BAG).forEach((who, i) => {
    const r = 14 + i;
    put(ws, `G${r}`, who);
    calc(
      ws,
      `H${r}`,
      { f: `'Hospital Bag'!$D$${bagTotalRow(who)}` },
      { fmt: PCT, align: "center" },
    );
  });

  header(ws, 20, 2, ["Baby today", "Feeds", "Nappies", "Sleep", "", "", ""]);
  put(ws, "B21", "Today", { font: { bold: true } });
  calc(
    ws,
    "C21",
    { f: `COUNTIFS(${BL("D")},"Feed",${BL("B")},TODAY())` },
    { fmt: "0", align: "center" },
  );
  calc(
    ws,
    "D21",
    {
      f: `COUNTIFS(${BL("D")},"Wet nappy",${BL("B")},TODAY())+COUNTIFS(${BL("D")},"Dirty nappy",${BL("B")},TODAY())`,
    },
    { fmt: "0", align: "center" },
  );
  calc(
    ws,
    "E21",
    { f: `SUMIFS(${BL("G")},${BL("D")},"Sleep",${BL("B")},TODAY())/60` },
    { fmt: '0.0" h"', align: "center" },
  );
  put(ws, "B22", "Yesterday", {
    font: { bold: true, color: { argb: C.muted } },
  });
  calc(
    ws,
    "C22",
    { f: `COUNTIFS(${BL("D")},"Feed",${BL("B")},TODAY()-1)` },
    { fmt: "0", align: "center", font: { color: { argb: C.muted } } },
  );
  calc(
    ws,
    "D22",
    {
      f: `COUNTIFS(${BL("D")},"Wet nappy",${BL("B")},TODAY()-1)+COUNTIFS(${BL("D")},"Dirty nappy",${BL("B")},TODAY()-1)`,
    },
    { fmt: "0", align: "center", font: { color: { argb: C.muted } } },
  );
  calc(
    ws,
    "E22",
    { f: `SUMIFS(${BL("G")},${BL("D")},"Sleep",${BL("B")},TODAY()-1)/60` },
    { fmt: '0.0" h"', align: "center", font: { color: { argb: C.muted } } },
  );
  note(
    ws,
    "B24",
    "This is a planner, not medical advice. Always follow your midwife or doctor.",
  );
}

function weeks(wb) {
  const ws = sheet(wb, "Week by Week", {
    tab: "FFD46A8C",
    widths: [8, 28, 46, 13],
  });
  title(
    ws,
    "Week by Week",
    "Roughly how big baby is each week, and room for your own notes.",
    5,
  );
  header(ws, 5, 2, [
    "Week",
    "About the size of",
    "My notes (cravings, kicks, photos…)",
    "Week starts",
  ]);
  SIZES.forEach((size, i) => {
    const r = 6 + i;
    const wk = 4 + i;
    put(ws, `B${r}`, wk, {
      align: "center",
      font: { bold: true, color: { argb: C.blue } },
    });
    put(ws, `C${r}`, size);
    input(ws, `D${r}`, null, { wrap: true, font: { size: 9 } });
    put(
      ws,
      `E${r}`,
      { f: `IF(${DUE}="","",${DUE}-280+${wk * 7})` },
      { fmt: "d mmm", align: "center", font: { color: { argb: C.muted } } },
    );
  });
  ws.addConditionalFormatting({
    ref: "B6:E42",
    rules: [
      {
        type: "expression",
        formulae: [`AND(${DUE}<>"",$B6=INT((280-(${DUE}-TODAY()))/7))`],
        style: { fill: fillBg(C.goodBg), font: { bold: true } },
      },
    ],
  });
}

function appointments(wb) {
  const ws = sheet(wb, "Appointments", {
    tab: C.blue,
    widths: [13, 9, 15, 18, 36, 30, 13],
    freeze: 5,
  });
  title(
    ws,
    "Appointments",
    "Every check-up, scan and class, with the questions you want to ask.",
    7,
  );
  header(ws, 5, 2, [
    "Date",
    "Time",
    "Type",
    "With / where",
    "Questions to ask",
    "Notes",
    "When",
  ]);
  for (let r = A0; r <= A1; r++) {
    input(ws, `B${r}`, null, { fmt: "ddd d mmm", align: "center" });
    input(ws, `C${r}`, null, { align: "center" });
    input(ws, `D${r}`, null, { align: "center" });
    list(ws, `D${r}`, APPT_TYPES);
    input(ws, `E${r}`, null);
    input(ws, `F${r}`, null, { wrap: true, font: { size: 9 } });
    input(ws, `G${r}`, null, {
      wrap: true,
      font: { size: 9, color: { argb: C.muted } },
    });
    calc(
      ws,
      `H${r}`,
      {
        f: `IF(B${r}="","",IF(B${r}<TODAY(),"Done",IF(B${r}=TODAY(),"Today!",IF(B${r}-TODAY()=1,"Tomorrow","In "&(B${r}-TODAY())&" days"))))`,
      },
      { align: "center", font: { bold: true } },
    );
    put(ws, `I${r}`, {
      f: `IF(OR(B${r}="",B${r}<TODAY()),"",B${r}*10000+ROW())`,
    });
  }
  ws.getColumn(9).hidden = true;
  ws.addConditionalFormatting({
    ref: `H${A0}:H${A1}`,
    rules: [
      {
        type: "expression",
        formulae: [`H${A0}="Done"`],
        style: { font: { color: { argb: C.faint } } },
      },
    ],
  });
}

function bumpLog(wb) {
  const ws = sheet(wb, "Bump Log", {
    tab: C.good,
    widths: [13, 8, 10, 10, 12, 36, 10],
    freeze: 5,
  });
  title(
    ws,
    "Bump Log",
    "Now and then: weight, bump, how you're feeling. The week fills in from the date.",
    7,
  );
  header(ws, 5, 2, [
    "Date",
    "Week",
    "Weight",
    "Bump (cm)",
    "Change",
    "Symptoms / notes",
    "Mood",
  ]);
  for (let r = 6; r <= 205; r++) {
    input(ws, `B${r}`, null, { fmt: "d mmm yy", align: "center" });
    calc(
      ws,
      `C${r}`,
      { f: `IF(OR(B${r}="",${DUE}=""),"",INT(${daysOn(`B${r}`)}/7))` },
      { align: "center", font: { bold: true, color: { argb: C.blue } } },
    );
    input(ws, `D${r}`, null, { fmt: "0.0", align: "center" });
    input(ws, `E${r}`, null, { align: "center" });
    calc(
      ws,
      `F${r}`,
      { f: `IF(OR(D${r}="",$D$6=""),"",D${r}-$D$6)` },
      { fmt: '"+"0.0;-0.0;0.0', align: "center" },
    );
    input(ws, `G${r}`, null, { wrap: true, font: { size: 9 } });
    input(ws, `H${r}`, null, { align: "center", font: { size: 9 } });
    list(ws, `H${r}`, MOODS);
  }
}

const bagRows = () => {
  let r = 5;
  const out = {};
  for (const [who, items] of Object.entries(BAG)) {
    out[who] = {
      head: r,
      first: r + 1,
      last: r + items.length + 3,
      total: r + items.length + 4,
    };
    r = out[who].total + 2;
  }
  return out;
};
const bagTotalRow = (who) => bagRows()[who].total;

function hospitalBag(wb) {
  const ws = sheet(wb, "Hospital Bag", {
    tab: "FFD08726",
    widths: [40, 8, 10],
  });
  title(
    ws,
    "Hospital Bag",
    "Pack it from about week 35. Tick as you go; add your own at the bottom of each list.",
    4,
  );
  const rows = bagRows();
  for (const [who, items] of Object.entries(BAG)) {
    const { head, first, last, total } = rows[who];
    header(ws, head, 2, [who, "Packed", ""]);
    for (let r = first; r <= last; r++) {
      input(ws, `B${r}`, items[r - first] ?? null);
      input(ws, `C${r}`, null, { align: "center" });
      list(ws, `C${r}`, ["✓"]);
    }
    put(ws, `B${total}`, "Packed", {
      font: { bold: true, color: { argb: C.muted } },
    });
    put(
      ws,
      `D${total}`,
      {
        f: `IF(COUNTA(B${first}:B${last})=0,"",COUNTIF(C${first}:C${last},"✓")/COUNTA(B${first}:B${last}))`,
      },
      { fmt: PCT, font: { bold: true, color: { argb: C.good } } },
    );
    put(
      ws,
      `C${total}`,
      { f: `COUNTIF(C${first}:C${last},"✓")&"/"&COUNTA(B${first}:B${last})` },
      { align: "center", font: { color: { argb: C.muted } } },
    );
    ws.addConditionalFormatting({
      ref: `B${first}:C${last}`,
      rules: [
        {
          type: "expression",
          formulae: [`$C${first}="✓"`],
          style: {
            fill: fillBg(C.goodBg),
            font: { strike: true, color: { argb: C.good } },
          },
        },
      ],
    });
  }
}

function babyLog(wb) {
  const ws = sheet(wb, "Baby Log", {
    tab: C.blue,
    widths: [13, 9, 14, 11, 10, 10, 30],
    freeze: 8,
  });
  title(
    ws,
    "Baby Log",
    "Feeds, nappies and sleep. One row each time; today's totals add up at the top.",
    7,
  );
  ws.getRow(5).height = 18;
  ws.getRow(6).height = 30;
  card(
    ws,
    "B5",
    "B6",
    "FEEDS TODAY",
    { f: `COUNTIFS($D$${L0}:$D$${L1},"Feed",$B$${L0}:$B$${L1},TODAY())` },
    { fmt: "0", tone: C.goodBg },
  );
  card(
    ws,
    "C5",
    "C6",
    "NAPPIES",
    {
      f: `COUNTIFS($D$${L0}:$D$${L1},"Wet nappy",$B$${L0}:$B$${L1},TODAY())+COUNTIFS($D$${L0}:$D$${L1},"Dirty nappy",$B$${L0}:$B$${L1},TODAY())`,
    },
    { fmt: "0" },
  );
  card(
    ws,
    "D5",
    "D6",
    "SLEEP",
    {
      f: `SUMIFS($G$${L0}:$G$${L1},$D$${L0}:$D$${L1},"Sleep",$B$${L0}:$B$${L1},TODAY())/60`,
    },
    { fmt: '0.0" h"', tone: C.sky },
  );
  ws.mergeCells("D5:E5");
  ws.mergeCells("D6:E6");
  card(
    ws,
    "F5",
    "F6",
    "BOTTLE ML",
    {
      f: `SUMIFS($F$${L0}:$F$${L1},$D$${L0}:$D$${L1},"Feed",$B$${L0}:$B$${L1},TODAY())`,
    },
    { fmt: "0", tone: C.warnBg },
  );
  ws.mergeCells("F5:G5");
  ws.mergeCells("F6:G6");
  header(ws, 8, 2, [
    "Date",
    "Time",
    "What",
    "Side / bottle",
    "ml",
    "Minutes",
    "Notes",
  ]);
  for (let r = L0; r <= L1; r++) {
    input(ws, `B${r}`, null, { fmt: "ddd d mmm", align: "center" });
    input(ws, `C${r}`, null, { align: "center" });
    input(ws, `D${r}`, null, { align: "center" });
    list(ws, `D${r}`, LOG_TYPES);
    input(ws, `E${r}`, null, { align: "center", font: { size: 9 } });
    list(ws, `E${r}`, FEED);
    input(ws, `F${r}`, null, { align: "center" });
    input(ws, `G${r}`, null, { align: "center" });
    input(ws, `H${r}`, null, { font: { size: 9, color: { argb: C.muted } } });
  }
}

// ---- Demo data -----------------------------------------------------------

export function fillDemo(wb, now = new Date()) {
  const day = (n) =>
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + n));
  // 24 weeks 3 days along today: due in 280 - 171 = 109 days.
  wb.getWorksheet("Dashboard").getCell("C5").value = day(109);
  const ap = wb.getWorksheet("Appointments");
  [
    [-30, "10:30", "Scan", "Hospital", "Is everything measuring OK?"],
    [4, "09:15", "Midwife", "GP surgery", "Ask about the glucose test"],
    [18, "14:00", "Antenatal class", "Community centre", ""],
    [32, "11:00", "Midwife", "GP surgery", "Birth plan questions"],
  ].forEach(([d, time, type, where, q], i) => {
    const r = A0 + i;
    ap.getCell(`B${r}`).value = day(d);
    ap.getCell(`C${r}`).value = time;
    ap.getCell(`D${r}`).value = type;
    ap.getCell(`E${r}`).value = where;
    ap.getCell(`F${r}`).value = q || null;
  });
  const bl = wb.getWorksheet("Bump Log");
  [
    [-56, 68.0, 82, "Tired, a bit sick in the mornings", "OK"],
    [-28, 69.4, 87, "Energy back!", "Great"],
    [0, 70.6, 92, "First proper kicks", "Good"],
  ].forEach(([d, w, cm, notes, mood], i) => {
    const r = 6 + i;
    bl.getCell(`B${r}`).value = day(d);
    bl.getCell(`D${r}`).value = w;
    bl.getCell(`E${r}`).value = cm;
    bl.getCell(`G${r}`).value = notes;
    bl.getCell(`H${r}`).value = mood;
  });
  const hb = wb.getWorksheet("Hospital Bag");
  const rows = bagRows();
  for (let r = rows["For you"].first; r < rows["For you"].first + 6; r++)
    hb.getCell(`C${r}`).value = "✓";
  for (let r = rows["For baby"].first; r < rows["For baby"].first + 3; r++)
    hb.getCell(`C${r}`).value = "✓";
  const log = wb.getWorksheet("Baby Log");
  [
    [-1, "22:10", "Feed", "Left", null, 20],
    [0, "01:30", "Feed", "Right", null, 15],
    [0, "01:50", "Wet nappy", null, null, null],
    [0, "02:00", "Sleep", null, null, 150],
    [0, "05:00", "Feed", "Bottle", 90, 15],
    [0, "05:20", "Dirty nappy", null, null, null],
    [0, "06:00", "Sleep", null, null, 90],
  ].forEach(([d, t, what, side, ml, min], i) => {
    const r = L0 + i;
    log.getCell(`B${r}`).value = day(d);
    log.getCell(`C${r}`).value = t;
    log.getCell(`D${r}`).value = what;
    log.getCell(`E${r}`).value = side;
    log.getCell(`F${r}`).value = ml;
    log.getCell(`G${r}`).value = min;
  });
  return { day, bag: rows };
}
