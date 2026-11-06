/**
 * Print settings for every tab, applied after a workbook is built.
 *
 *   - Summary tabs print their whole area on as few pages as fit the width.
 *   - Log tabs (the ones with a frozen header) print the header plus the
 *     first 40 rows, with the header repeated on every page; the guides
 *     explain how to print more (select rows → Print selection).
 *
 * exceljs prefixes each corner of a print area with "$", so areas are
 * written as "A$1:H$40" to come out as the valid "$A$1:$H$40".
 */
import { colName } from "./lib.mjs";

const LOG_ROWS = 40;

export function applyPrint(wb) {
  for (const ws of wb.worksheets) {
    if (ws.state === "hidden") continue;
    const view = ws.views?.[0] ?? {};
    const lastCol = lastUsedColumn(ws);
    const widths = Array.from({ length: lastCol }, (_, i) =>
      ws.getColumn(i + 1).hidden ? 0 : (ws.getColumn(i + 1).width ?? 9),
    );
    const wide = widths.reduce((a, b) => a + b, 0) > 110;
    const header = view.state === "frozen" ? view.ySplit : 0;
    const lastRow = header ? header + LOG_ROWS : ws.rowCount;
    ws.pageSetup = {
      ...ws.pageSetup,
      orientation: wide ? "landscape" : "portrait",
      paperSize: undefined,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      horizontalCentered: true,
      margins: {
        left: 0.4,
        right: 0.4,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      },
      printArea: `A$1:${colName(lastCol)}$${lastRow}`,
      ...(header ? { printTitlesRow: `${header}:${header}` } : {}),
    };
    ws.headerFooter = {
      oddFooter: `&L&8Makeready · ${ws.name}&R&8Page &P of &N`,
    };
  }
}

/** Last column that holds something visible (helper columns are hidden). */
function lastUsedColumn(ws) {
  let last = 2;
  ws.eachRow((row) =>
    row.eachCell((cell, col) => {
      if (!ws.getColumn(col).hidden && col > last) last = col;
    }),
  );
  return last;
}
