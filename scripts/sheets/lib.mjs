/**
 * Shared styling for the spreadsheet products. Everything here sticks to
 * features that survive both Excel and a Google Sheets import: plain cell
 * styles, list validation, same-sheet conditional formatting and formulas
 * both apps support (SUMIFS, COUNTIF, EDATE, EOMONTH, REPT, IFERROR…).
 */
import ExcelJS from "exceljs";

export const C = {
  navy: "FF0D1B2E",
  blue: "FF2B78C9",
  sky: "FFEEF5FC",
  input: "FFFFF8E1",
  inputLine: "FFE9D9A6",
  line: "FFDBE3EC",
  ink: "FF1D2430",
  muted: "FF5D6878",
  faint: "FF9AA5B4",
  good: "FF2E7D5B",
  goodBg: "FFE6F4EC",
  bad: "FFC0392B",
  badBg: "FFFBEAEA",
  warnBg: "FFFFF1DC",
  white: "FFFFFFFF",
};

export const FONT = "Arial";
export const MONEY = '#,##0.00;[Red]-#,##0.00;"–"';
export const MONEY0 = '#,##0;[Red]-#,##0;"–"';
export const PCT = "0%";
export const DATE = "d mmm yyyy";
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function workbook() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Makeready";
  wb.calcProperties.fullCalcOnLoad = true;
  return wb;
}

/** A sheet with the house layout: gridlines off, narrow margin column A. */
export function sheet(wb, name, { tab, widths = [], freeze } = {}) {
  const ws = wb.addWorksheet(name, {
    properties: { tabColor: tab ? { argb: tab } : undefined },
    views: [
      {
        showGridLines: false,
        ...(freeze ? { state: "frozen", ySplit: freeze, xSplit: 0 } : {}),
      },
    ],
  });
  ws.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.4,
      right: 0.4,
      top: 0.5,
      bottom: 0.5,
      header: 0.2,
      footer: 0.2,
    },
  };
  ws.getColumn(1).width = 2.5;
  widths.forEach((w, i) => (ws.getColumn(i + 2).width = w));
  return ws;
}

const font = (extra = {}) => ({
  name: FONT,
  size: 10,
  color: { argb: C.ink },
  ...extra,
});
const fill = (argb) => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb },
});
const thin = (argb = C.line) => ({ style: "thin", color: { argb } });

/** Set a cell: plain value, or { f: "FORMULA" }; with optional style bits. */
export function put(ws, ref, v, s = {}) {
  const cell = ws.getCell(ref);
  cell.value = v && typeof v === "object" && "f" in v ? { formula: v.f } : v;
  cell.font = font(s.font);
  if (s.fill) cell.fill = fill(s.fill);
  if (s.fmt) cell.numFmt = s.fmt;
  cell.alignment = {
    vertical: "middle",
    wrapText: !!s.wrap,
    horizontal: s.align,
  };
  if (s.border) cell.border = s.border;
  return cell;
}

export function title(ws, text, sub, width = 8) {
  ws.getRow(1).height = 10;
  ws.getRow(2).height = 32;
  put(ws, "B2", text, {
    font: { size: 20, bold: true, color: { argb: C.navy } },
  });
  if (sub) {
    put(ws, "B3", sub, { font: { color: { argb: C.muted } } });
    ws.mergeCells(2 + 1, 2, 3, 1 + width);
  }
}

/** Header row cells across columns [startCol..] with labels (strings or {f}). */
export function header(ws, row, startCol, labels) {
  ws.getRow(row).height = 22;
  labels.forEach((label, i) =>
    put(ws, cellRef(row, startCol + i), label, {
      font: { bold: true, color: { argb: C.white } },
      fill: C.navy,
      align: i === 0 ? "left" : "center",
    }),
  );
}

/** Style an input cell (yellow: "type here"). */
export function input(ws, ref, v, s = {}) {
  return put(ws, ref, v, {
    ...s,
    fill: C.input,
    border: {
      top: thin(C.inputLine),
      bottom: thin(C.inputLine),
      left: thin(C.inputLine),
      right: thin(C.inputLine),
    },
  });
}

/** Style a calculated cell (white, light row line). */
export function calc(ws, ref, v, s = {}) {
  return put(ws, ref, v, { ...s, border: { bottom: thin() } });
}

/** A labelled number card: label above, big value below. */
export function card(
  ws,
  labelRef,
  valueRef,
  label,
  f,
  { tone = C.sky, fmt = MONEY } = {},
) {
  put(ws, labelRef, label, {
    font: { size: 8, bold: true, color: { argb: C.muted } },
    fill: tone,
    align: "center",
  });
  put(ws, valueRef, f, {
    font: { size: 16, bold: true, color: { argb: C.navy } },
    fill: tone,
    fmt,
    align: "center",
  });
}

export function list(ws, ref, values, prompt) {
  ws.getCell(ref).dataValidation = {
    type: "list",
    allowBlank: true,
    formulae: [Array.isArray(values) ? `"${values.join(",")}"` : values],
    showErrorMessage: false,
    ...(prompt ? { showInputMessage: true, promptTitle: "", prompt } : {}),
  };
}

export function listRange(ws, col, from, to, values) {
  for (let r = from; r <= to; r++) list(ws, `${col}${r}`, values);
}

export function note(ws, ref, text, s = {}) {
  return put(ws, ref, text, {
    font: { size: 9, color: { argb: C.muted }, ...s.font },
    wrap: s.wrap,
  });
}

export const colName = (n) => {
  let s = "";
  for (; n > 0; n = Math.floor((n - 1) / 26))
    s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};
export const cellRef = (row, col) => `${colName(col)}${row}`;

/** A text progress bar both apps render: ██████░░░░ */
export const bar = (ratio, n = 20) =>
  `IF(${ratio}="","",REPT("█",MAX(0,MIN(${n},ROUND(${ratio}*${n},0))))&REPT("░",${n}-MAX(0,MIN(${n},ROUND(${ratio}*${n},0)))))`;
