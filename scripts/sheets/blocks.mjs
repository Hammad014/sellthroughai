/**
 * Building blocks shared by several spreadsheet products:
 *   guideSheet()  a "Start Here" tab
 *   habitLog()    a day-by-day habit log with streaks
 *   focusLog()    a study / focus-session log with today / week / total cards
 */
import {
  C,
  DATE,
  PCT,
  card,
  colName,
  header,
  input,
  list,
  put,
  sheet,
  title,
} from "./lib.mjs";

const fillBg = (argb) => ({
  type: "pattern",
  pattern: "solid",
  bgColor: { argb },
});

/** A "Start Here" tab. rows: [marker, text, kind?] with kind "h" (heading) or "key". */
export function guideSheet(wb, heading, sub, rows) {
  const ws = sheet(wb, "Start Here", { tab: C.navy, widths: [4, 92] });
  title(ws, heading, sub, 2);
  rows = [
    ...rows,
    ["", ""],
    ["", "PRINTING", "h"],
    [
      "•",
      "File → Print: every tab is set up to print neatly. For a long list, select the rows you want first, then print just those (Excel: Print Selection · Google Sheets: Print → Selected cells).",
    ],
    [
      "•",
      "Prefer pen and paper? The printable PDF pages in your download are ready to print and write on (US Letter and A4).",
    ],
  ];
  rows.forEach(([n, text, kind], i) => {
    const r = 5 + i;
    ws.getRow(r).height = kind === "h" ? 24 : 28;
    put(ws, `B${r}`, n, {
      font: { bold: true, color: { argb: C.blue } },
      align: "center",
    });
    put(ws, `C${r}`, text, {
      wrap: true,
      font:
        kind === "h" ? { bold: true, size: 9, color: { argb: C.blue } } : {},
      fill: kind === "key" ? C.input : undefined,
    });
  });
  return ws;
}

/**
 * Habit log: up to 8 habits (names typed in the header), one row per day for
 * a year from a start date, ✓ to tick. Hidden helper columns hold the running
 * streak, so current and best streaks need no array formulas.
 *
 * Returns references other tabs can use: per habit { name, streak, today }.
 */
export function habitLog(wb, { habits, start, sub }) {
  const N = 8;
  const DAYS = 366;
  const D0 = 12; // first day row
  const D1 = D0 + DAYS - 1;
  const ws = sheet(wb, "Habits", {
    tab: C.good,
    widths: [16, ...Array(N).fill(13)],
    freeze: 11,
  });
  title(ws, "Habits", sub, 9);
  put(ws, "B4", "Start date", { font: { bold: true } });
  input(ws, "C4", start, { fmt: DATE, align: "center" });
  put(
    ws,
    "D4",
    "Type the day you start. Then tick ✓ each day in today's row (it's highlighted).",
    {
      font: { size: 9, color: { argb: C.muted } },
    },
  );

  header(ws, 6, 2, ["Your habits", ...Array(N).fill("")]);
  const statRows = [
    [7, "Current streak", "0"],
    [8, "Best streak", "0"],
    [9, "Last 30 days", PCT],
  ];
  statRows.forEach(([r, label]) =>
    put(ws, `B${r}`, label, { font: { bold: true, color: { argb: C.muted } } }),
  );
  header(ws, 11, 2, ["Date", ...Array(N).fill("")]);

  const today = `MATCH(TODAY(),$B$${D0}:$B$${D1},0)`;
  const refs = [];
  for (let h = 0; h < N; h++) {
    const c = colName(3 + h); // tick column
    const s = colName(3 + N + 1 + h); // hidden streak column (one gap column)
    const ticks = `$${c}$${D0}:$${c}$${D1}`;
    const streaks = `$${s}$${D0}:$${s}$${D1}`;
    input(ws, `${c}6`, habits[h] ?? null, {
      font: { bold: true },
      align: "center",
      wrap: true,
    });
    put(
      ws,
      `${c}7`,
      {
        f: `IF(${c}$6="","",IFERROR(MAX(INDEX(${streaks},${today}),IF(${today}>1,INDEX(${streaks},${today}-1),0)),0))`,
      },
      {
        fmt: '0" 🔥"',
        align: "center",
        font: { bold: true, color: { argb: C.good } },
      },
    );
    put(
      ws,
      `${c}8`,
      { f: `IF(${c}$6="","",MAX(${streaks}))` },
      { fmt: "0", align: "center" },
    );
    put(
      ws,
      `${c}9`,
      {
        f: `IF(${c}$6="","",COUNTIFS(${ticks},"✓",$B$${D0}:$B$${D1},">"&(TODAY()-30),$B$${D0}:$B$${D1},"<="&TODAY())/30)`,
      },
      {
        fmt: PCT,
        align: "center",
      },
    );
    put(
      ws,
      `${c}11`,
      { f: `IF(${c}$6="","",${c}$6)` },
      {
        font: { bold: true, color: { argb: C.white } },
        fill: C.navy,
        align: "center",
      },
    );
    for (let r = D0; r <= D1; r++) {
      input(ws, `${c}${r}`, null, { align: "center" });
      list(ws, `${c}${r}`, ["✓"]);
      put(ws, `${s}${r}`, { f: `IF(${c}${r}="✓",N(${s}${r - 1})+1,0)` });
    }
    ws.getColumn(3 + N + 1 + h).hidden = true;
    refs.push({
      name: `Habits!$${c}$6`,
      streak: `Habits!$${c}$7`,
      today: `IFERROR(INDEX(Habits!${ticks},MATCH(TODAY(),Habits!$B$${D0}:$B$${D1},0))="✓",FALSE)`,
    });
  }
  ws.getColumn(3 + N).width = 2;
  for (let r = D0; r <= D1; r++)
    put(
      ws,
      `B${r}`,
      { f: r === D0 ? "$C$4" : `B${r - 1}+1` },
      { fmt: "ddd d mmm", font: { color: { argb: C.muted } } },
    );
  ws.addConditionalFormatting({
    ref: `B${D0}:${colName(2 + N)}${D1}`,
    rules: [
      {
        type: "expression",
        formulae: [`$B${D0}=TODAY()`],
        style: { fill: fillBg(C.sky), font: { bold: true } },
      },
    ],
  });
  ws.addConditionalFormatting({
    ref: `C${D0}:${colName(2 + N)}${D1}`,
    rules: [
      {
        type: "expression",
        formulae: [`C${D0}="✓"`],
        style: {
          fill: fillBg(C.goodBg),
          font: { color: { argb: C.good }, bold: true },
        },
      },
    ],
  });
  ws.getRow(6).height = 30;
  return { ws, refs, firstDay: D0, lastDay: D1 };
}

/** Focus / study log with Today, This week and All-time cards. */
export function focusLog(
  wb,
  { name = "Focus Log", sub, cols, widths, total = "ALL TIME" },
) {
  const F0 = 9;
  const F1 = 508;
  const ws = sheet(wb, name, { tab: C.good, widths, freeze: 8 });
  title(ws, name, sub, cols.length);
  ws.getRow(5).height = 18;
  ws.getRow(6).height = 30;
  const mins = `$D$${F0}:$D$${F1}`;
  const dates = `$B$${F0}:$B$${F1}`;
  card(
    ws,
    "B5",
    "B6",
    "TODAY",
    { f: `SUMIFS(${mins},${dates},TODAY())` },
    { fmt: '0" min"', tone: C.goodBg },
  );
  card(
    ws,
    "C5",
    "C6",
    "THIS WEEK",
    { f: `SUMIFS(${mins},${dates},">="&(TODAY()-WEEKDAY(TODAY(),3)))` },
    { fmt: '0" min"' },
  );
  ws.mergeCells("C5:D5");
  ws.mergeCells("C6:D6");
  card(ws, "E5", "E6", total, { f: `SUM(${mins})/60` }, { fmt: '0.0" hours"' });
  header(
    ws,
    8,
    2,
    cols.map((c) => c.label),
  );
  for (let r = F0; r <= F1; r++)
    cols.forEach((c, i) => {
      const ref = `${colName(2 + i)}${r}`;
      input(ws, ref, null, c.style ?? {});
      if (c.list) list(ws, ref, c.list);
    });
  return { ws, first: F0, last: F1, mins, dates };
}
