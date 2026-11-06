/**
 * Reading Tracker: for Excel and Google Sheets.
 *
 *   Start Here · Dashboard · Books · Challenge · Quotes
 *
 * Every number on the Dashboard comes from the Books log: books and pages
 * this year, goal progress, average rating, by month and by genre, what
 * you're reading now and your top-rated books.
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

const B0 = 6; // Books rows
const B1 = 505;
const G0 = 29; // genre list rows on the Dashboard
const G1 = 40;
const BK = (col) => `Books!$${col}$${B0}:$${col}$${B1}`;
const BKT = (col) => `Books!$${col}$1:$${col}$${B1}`;
const YEAR = "Dashboard!$C$5";
const STATUS = ["Want to read", "Reading", "Finished", "Did not finish"];
const FORMATS = ["Print", "eBook", "Audiobook"];
const STARS = ["★", "★★", "★★★", "★★★★", "★★★★★"];
export const GENRES = [
  "Fiction",
  "Fantasy",
  "Romance",
  "Thriller",
  "Mystery",
  "Sci-fi",
  "Classics",
  "Non-fiction",
  "Self-help",
  "Biography",
  "History",
  "Other",
];
const CHALLENGE = [
  "A book published this year",
  "A debut novel",
  "A book over 500 pages",
  "A book under 200 pages",
  "A book by an author from another country",
  "A classic you've never read",
  "A book a friend recommended",
  "A book with a one-word title",
  "A memoir or biography",
  "A book set somewhere you want to visit",
  "A book you've owned for over a year",
  "An audiobook",
  "A book in a genre you never read",
  "A book that became a film or series",
  "A book of poems or short stories",
  "A non-fiction book about a new topic",
  "A book from the year you were born",
  "A reread of an old favourite",
  "A book by an author you've read before",
  "A book with a colour in the title",
  "A book under 5 hours as an audiobook",
  "A book bought from a local bookshop",
  "The first book in a series",
  "A book you picked for its cover",
];

const fillBg = (argb) => ({
  type: "pattern",
  pattern: "solid",
  bgColor: { argb },
});

export function buildReading() {
  const wb = workbook();
  guideSheet(
    wb,
    "Reading Tracker",
    "by Makeready · works in Google Sheets and Excel",
    [
      ["", "SET IT UP (2 MINUTES)", "h"],
      ["1", "Dashboard: type the year and your reading goal (how many books)."],
      [
        "2",
        "Books: add what you're reading now and what you want to read next. Pick a status from the dropdown.",
      ],
      ["", ""],
      ["", "AS YOU READ", "h"],
      [
        "→",
        "Reading: set Status to Reading and update Current page now and then. The progress bar fills in.",
      ],
      [
        "→",
        "Finished: set Status to Finished, add the date and your rating. The Dashboard counts it straight away.",
      ],
      [
        "→",
        "Challenge: write a finished book next to a prompt and it ticks itself off.",
      ],
      ["→", "Quotes: keep the lines you want to remember."],
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
    widths: [22, 10, 10, 18, 3, 34, 16],
  }); // filled last
  books(wb);
  challenge(wb);
  quotes(wb);
  dashboard(dash);
  return wb;
}

function dashboard(ws) {
  title(
    ws,
    "Reading Dashboard",
    "Everything below counts itself from your Books tab.",
    7,
  );
  put(ws, "B5", "Year", { font: { bold: true } });
  input(ws, "C5", 2027, { align: "center" });
  put(ws, "B6", "Reading goal (books)", { font: { bold: true } });
  input(ws, "C6", 24, { align: "center" });

  const read = `SUM(${BK("O")})`;
  ws.getRow(8).height = 18;
  ws.getRow(9).height = 30;
  card(ws, "B8", "B9", "BOOKS READ", { f: read }, { fmt: "0", tone: C.goodBg });
  card(
    ws,
    "C8",
    "C9",
    "OF YOUR GOAL",
    { f: `IF(N($C$6)=0,"",${read}/$C$6)` },
    { fmt: PCT },
  );
  ws.mergeCells("C8:D8");
  ws.mergeCells("C9:D9");
  card(
    ws,
    "E8",
    "E9",
    "PAGES READ",
    { f: `SUMIFS(${BK("F")},${BK("O")},1)` },
    { fmt: "#,##0" },
  );
  ws.mergeCells("E8:F8");
  ws.mergeCells("E9:F9");
  card(
    ws,
    "G8",
    "G9",
    "AVG RATING",
    { f: `IFERROR(AVERAGEIFS(${BK("N")},${BK("O")},1,${BK("N")},"<>"),"")` },
    { fmt: '0.0" ★"', tone: C.warnBg },
  );
  put(
    ws,
    "B11",
    { f: bar(`IF(N($C$6)=0,"",${read}/$C$6)`, 40) },
    { font: { color: { argb: C.good }, size: 12 } },
  );
  ws.mergeCells("B11:F11");
  put(
    ws,
    "G11",
    { f: `${read}&" of "&$C$6&" books"` },
    { font: { bold: true } },
  );

  header(ws, 13, 2, ["By month", "Books", "Pages", ""]);
  for (let m = 0; m < 12; m++) {
    const r = 14 + m;
    const from = `DATE(${YEAR},${m + 1},1)`;
    const to = `EOMONTH(${from},0)`;
    const finished = `${BK("G")},"Finished",${BK("I")},">="&${from},${BK("I")},"<="&${to}`;
    put(ws, `B${r}`, { f: from }, { fmt: "mmmm" });
    calc(
      ws,
      `C${r}`,
      { f: `COUNTIFS(${finished})` },
      { fmt: '0;-0;"–"', align: "center" },
    );
    calc(
      ws,
      `D${r}`,
      { f: `SUMIFS(${BK("F")},${finished})` },
      { fmt: '#,##0;-#,##0;"–"', align: "center" },
    );
    calc(ws, `E${r}`, { f: `REPT("📕",MIN(10,C${r}))` });
  }

  header(ws, 13, 7, ["Reading now", "Progress"]);
  for (let k = 1; k <= 5; k++) {
    const r = 13 + k;
    put(ws, `I${r}`, { f: `IFERROR(SMALL(${BK("P")},${k}),"")` });
    calc(
      ws,
      `G${r}`,
      { f: `IF($I${r}="","",INDEX(${BKT("B")},$I${r}))` },
      { font: { bold: true } },
    );
    calc(
      ws,
      `H${r}`,
      { f: `IF($I${r}="","",INDEX(${BKT("K")},$I${r}))` },
      { fmt: PCT, align: "center", font: { color: { argb: C.good } } },
    );
  }
  header(ws, 20, 7, ["Top rated this year", "Rating"]);
  for (let k = 1; k <= 5; k++) {
    const r = 20 + k;
    put(ws, `J${r}`, { f: `IFERROR(LARGE(${BK("Q")},${k}),"")` });
    const row = `100000-MOD($J${r},100000)`;
    calc(
      ws,
      `G${r}`,
      { f: `IF($J${r}="","",INDEX(${BKT("B")},${row}))` },
      { font: { bold: true } },
    );
    calc(
      ws,
      `H${r}`,
      { f: `IF($J${r}="","",INDEX(${BKT("L")},${row}))` },
      { align: "center", font: { color: { argb: "FFD08726" } } },
    );
  }
  ws.getColumn(9).hidden = true;
  ws.getColumn(10).hidden = true;

  header(ws, 28, 2, ["Genres (edit these)", "Read", "", ""]);
  for (let r = G0; r <= G1; r++) {
    input(ws, `B${r}`, GENRES[r - G0] ?? null);
    calc(
      ws,
      `C${r}`,
      { f: `IF(B${r}="","",COUNTIFS(${BK("D")},B${r},${BK("O")},1))` },
      { fmt: '0;-0;"–"', align: "center" },
    );
    calc(
      ws,
      `D${r}`,
      { f: `IF(B${r}="","",REPT("█",MIN(12,C${r})))` },
      { font: { color: { argb: C.blue } } },
    );
    ws.mergeCells(`D${r}:E${r}`);
  }
  note(
    ws,
    "G28",
    "Genres, formats and statuses come from dropdowns, so the counts always match.",
  );
}

function books(wb) {
  const ws = sheet(wb, "Books", {
    tab: C.blue,
    widths: [30, 20, 13, 11, 8, 14, 12, 12, 9, 14, 13, 34],
    freeze: 5,
  });
  title(ws, "Books", "Every book you read, are reading, or want to read.", 12);
  header(ws, 5, 2, [
    "Title",
    "Author",
    "Genre",
    "Format",
    "Pages",
    "Status",
    "Started",
    "Finished",
    "On page",
    "Progress",
    "Rating",
    "Notes",
  ]);
  for (let r = B0; r <= B1; r++) {
    input(ws, `B${r}`, null, { font: { bold: true } });
    input(ws, `C${r}`, null);
    input(ws, `D${r}`, null, { align: "center", font: { size: 9 } });
    list(ws, `D${r}`, `Dashboard!$B$${G0}:$B$${G1}`);
    input(ws, `E${r}`, null, { align: "center", font: { size: 9 } });
    list(ws, `E${r}`, FORMATS);
    input(ws, `F${r}`, null, { align: "center" });
    input(ws, `G${r}`, null, { align: "center", font: { size: 9 } });
    list(ws, `G${r}`, STATUS);
    input(ws, `H${r}`, null, { fmt: "d mmm yy", align: "center" });
    input(ws, `I${r}`, null, { fmt: "d mmm yy", align: "center" });
    input(ws, `J${r}`, null, { align: "center" });
    calc(
      ws,
      `K${r}`,
      {
        f: `IF(B${r}="","",IF(G${r}="Finished",1,IF(AND(G${r}="Reading",N(F${r})>0),MIN(1,N(J${r})/F${r}),"")))`,
      },
      {
        fmt: PCT,
        align: "center",
        font: { color: { argb: C.good }, bold: true },
      },
    );
    input(ws, `L${r}`, null, {
      align: "center",
      font: { color: { argb: "FFD08726" } },
    });
    list(ws, `L${r}`, STARS);
    input(ws, `M${r}`, null, { font: { size: 9, color: { argb: C.muted } } });
    // Hidden helpers: rating number, finished-this-year flag, keys for the Dashboard lists.
    put(ws, `N${r}`, { f: `IF(L${r}="","",LEN(L${r}))` });
    put(ws, `O${r}`, {
      f: `IF(AND(G${r}="Finished",ISNUMBER(I${r})),IF(YEAR(I${r})=${YEAR},1,0),0)`,
    });
    put(ws, `P${r}`, { f: `IF(AND(B${r}<>"",G${r}="Reading"),ROW(),"")` });
    put(ws, `Q${r}`, {
      f: `IF(AND(O${r}=1,N${r}<>""),N${r}*100000+100000-ROW(),"")`,
    });
  }
  for (const c of [14, 15, 16, 17]) ws.getColumn(c).hidden = true;
  ws.addConditionalFormatting({
    ref: `G${B0}:G${B1}`,
    rules: [
      {
        type: "expression",
        formulae: [`G${B0}="Finished"`],
        style: { fill: fillBg(C.goodBg), font: { color: { argb: C.good } } },
      },
      {
        type: "expression",
        formulae: [`G${B0}="Reading"`],
        style: {
          fill: fillBg(C.sky),
          font: { color: { argb: C.blue }, bold: true },
        },
      },
      {
        type: "expression",
        formulae: [`G${B0}="Did not finish"`],
        style: { font: { color: { argb: C.faint } } },
      },
    ],
  });
}

function challenge(wb) {
  const ws = sheet(wb, "Challenge", {
    tab: "FFD08726",
    widths: [4, 44, 34, 8],
  });
  title(
    ws,
    "Reading Challenge",
    "24 prompts for the year. Write a book next to a prompt; it ticks itself when you finish it.",
    5,
  );
  put(
    ws,
    "B4",
    { f: 'COUNTIF($E$7:$E$30,"✓")&" of 24 done"' },
    { font: { bold: true, color: { argb: C.good } } },
  );
  ws.mergeCells("B4:C4");
  header(ws, 6, 2, ["#", "Prompt", "Book", "Done"]);
  CHALLENGE.forEach((prompt, i) => {
    const r = 7 + i;
    put(ws, `B${r}`, i + 1, {
      align: "center",
      font: { color: { argb: C.blue }, bold: true },
    });
    input(ws, `C${r}`, prompt);
    input(ws, `D${r}`, null, { font: { bold: true } });
    list(ws, `D${r}`, BK("B"));
    calc(
      ws,
      `E${r}`,
      {
        f: `IF(D${r}="","",IF(COUNTIFS(${BK("B")},D${r},${BK("G")},"Finished")>0,"✓","…"))`,
      },
      { align: "center", font: { bold: true, color: { argb: C.good } } },
    );
  });
  ws.addConditionalFormatting({
    ref: "C7:E30",
    rules: [
      {
        type: "expression",
        formulae: ['$E7="✓"'],
        style: { fill: fillBg(C.goodBg) },
      },
    ],
  });
}

function quotes(wb) {
  const ws = sheet(wb, "Quotes", {
    tab: C.good,
    widths: [28, 60, 8, 30],
    freeze: 5,
  });
  title(ws, "Quotes", "The lines you want to remember.", 5);
  header(ws, 5, 2, ["Book", "Quote", "Page", "Why it stayed with me"]);
  for (let r = 6; r <= 205; r++) {
    input(ws, `B${r}`, null);
    list(ws, `B${r}`, BK("B"));
    input(ws, `C${r}`, null, { wrap: true, font: { italic: true } });
    input(ws, `D${r}`, null, { align: "center" });
    input(ws, `E${r}`, null, {
      wrap: true,
      font: { size: 9, color: { argb: C.muted } },
    });
  }
}

// ---- Demo data -----------------------------------------------------------

export const DEMO_BOOKS = [
  // title, author, genre, format, pages, status, started, finished, on page, rating
  [
    "The Quiet Orchard",
    "M. Hale",
    "Fiction",
    "Print",
    320,
    "Finished",
    "2027-01-02",
    "2027-01-12",
    null,
    "★★★★",
  ],
  [
    "Atomic Mornings",
    "J. Clear-Day",
    "Self-help",
    "eBook",
    240,
    "Finished",
    "2027-01-13",
    "2027-01-20",
    null,
    "★★★",
  ],
  [
    "Salt and Starlight",
    "R. Okoye",
    "Fantasy",
    "Print",
    512,
    "Finished",
    "2027-01-21",
    "2027-02-09",
    null,
    "★★★★★",
  ],
  [
    "The Last Lighthouse",
    "E. Varga",
    "Mystery",
    "Audiobook",
    380,
    "Finished",
    "2027-02-10",
    "2027-02-18",
    null,
    "★★★★",
  ],
  [
    "Small Kingdoms",
    "A. Devi",
    "Fiction",
    "Print",
    288,
    "Finished",
    "2027-02-19",
    "2027-03-01",
    null,
    "★★★★★",
  ],
  [
    "A Short History of Bread",
    "T. Marsh",
    "History",
    "eBook",
    210,
    "Did not finish",
    "2027-03-02",
    null,
    null,
    null,
  ],
  [
    "Northern Lines",
    "K. Berg",
    "Thriller",
    "Print",
    400,
    "Finished",
    "2027-03-03",
    "2027-03-14",
    null,
    "★★★",
  ],
  [
    "The Long Way Home",
    "S. Iyer",
    "Biography",
    "Audiobook",
    350,
    "Finished",
    "2027-03-15",
    "2027-03-26",
    null,
    "★★★★",
  ],
  [
    "Glass Garden",
    "L. Moreau",
    "Romance",
    "eBook",
    330,
    "Reading",
    "2027-03-27",
    null,
    140,
    null,
  ],
  [
    "Deep Work Days",
    "C. Newman",
    "Non-fiction",
    "Print",
    296,
    "Reading",
    "2027-03-20",
    null,
    210,
    null,
  ],
  [
    "The Midnight Atlas",
    "P. Quinn",
    "Fantasy",
    "Print",
    610,
    "Want to read",
    null,
    null,
    null,
    null,
  ],
  [
    "Old Friends",
    "B. Asante",
    "Fiction",
    "Print",
    260,
    "Finished",
    "2026-12-01",
    "2026-12-20",
    null,
    "★★★★★",
  ], // last year: not counted
];

export function fillDemo(wb) {
  const ws = wb.getWorksheet("Books");
  const d = (s) => (s ? new Date(`${s}T00:00:00Z`) : null);
  DEMO_BOOKS.forEach((b, i) => {
    const r = B0 + i;
    [
      b[0],
      b[1],
      b[2],
      b[3],
      b[4],
      b[5],
      d(b[6]),
      d(b[7]),
      b[8],
      null,
      b[9],
    ].forEach((v, j) => {
      if (j === 9) return; // K is a formula
      ws.getCell(r, 2 + j).value = v;
    });
  });
  const ch = wb.getWorksheet("Challenge");
  ch.getCell("D8").value = "Small Kingdoms"; // finished: ticks
  ch.getCell("D9").value = "Salt and Starlight"; // finished: ticks
  ch.getCell("D18").value = "The Last Lighthouse"; // finished: ticks
  ch.getCell("D20").value = "Glass Garden"; // still reading: not ticked
  const q = wb.getWorksheet("Quotes");
  q.getCell("B6").value = "Salt and Starlight";
  q.getCell("C6").value =
    "“Every door is a choice you make twice: once to open it, once to walk through.”";
  q.getCell("D6").value = 211;
  return DEMO_BOOKS;
}
