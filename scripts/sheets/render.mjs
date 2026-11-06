/**
 * Renders sheets of a demo workbook to PNG through LibreOffice → PDF → MuPDF,
 * so store images show the real spreadsheet with real (example) numbers.
 * Each sheet prints at full width; we keep the top of page 1, cropped to
 * `aspect` (width / height), like a screenshot of the open sheet.
 *
 *   const pngs = await renderSheets(file, [{ sheet: "Dashboard" }], { aspect: 1.6 })
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import ExcelJS from "exceljs";
import * as mupdf from "mupdf";
import sharp from "sharp";

export async function renderSheets(
  file,
  shots,
  { scale = 3, aspect = 1.6 } = {},
) {
  const dir = mkdtempSync(path.join(tmpdir(), "sheet-render-"));
  const files = [];
  for (const [i, { sheet }] of shots.entries()) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(file);
    // Hide every other sheet: formulas keep working, only this one prints.
    for (const ws of wb.worksheets)
      ws.state = ws.name === sheet ? "visible" : "hidden";
    const target = wb.getWorksheet(sheet);
    wb.views = [{ activeTab: wb.worksheets.indexOf(target) }];
    target.pageSetup = {
      ...target.pageSetup,
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.2,
        right: 0.2,
        top: 0.2,
        bottom: 0.2,
        header: 0,
        footer: 0,
      },
    };
    const out = path.join(dir, `shot-${i}.xlsx`);
    await wb.xlsx.writeFile(out);
    files.push(out);
  }
  execFileSync(
    "soffice",
    ["--headless", "--convert-to", "pdf", "--outdir", dir, ...files],
    { stdio: "ignore", timeout: 300000 },
  );
  return Promise.all(
    files.map(async (f, i) => {
      const doc = mupdf.Document.openDocument(
        readFileSync(f.replace(/\.xlsx$/, ".pdf")),
        "application/pdf",
      );
      const pix = doc
        .loadPage(0)
        .toPixmap(
          mupdf.Matrix.scale(scale, scale),
          mupdf.ColorSpace.DeviceRGB,
          false,
          true,
        );
      const trimmed = await sharp(Buffer.from(pix.asPNG()))
        .trim({ threshold: 4 })
        .toBuffer({ resolveWithObject: true });
      const { width, height } = trimmed.info;
      const pad = Math.round(width * 0.02);
      const a = shots[i].aspect ?? aspect;
      const h = Math.min(height, Math.round((width + pad * 2) / a) - pad);
      return sharp(trimmed.data)
        .extract({ left: 0, top: 0, width, height: h })
        .extend({
          top: pad,
          left: pad,
          right: pad,
          bottom: 0,
          background: "#ffffff",
        })
        .png()
        .toBuffer();
    }),
  );
}
