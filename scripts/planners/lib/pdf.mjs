/**
 * Shared drawing primitives for Promptory's hyperlinked digital planners.
 *
 * Every planner is an iPad-landscape PDF (4:3) where tabs, nav pills and
 * calendar dates are internal links. Links use explicit page references with
 * a /Fit destination (the most widely supported form across GoodNotes,
 * Notability, Xodo, Samsung Notes, Noteshelf and desktop readers), so the
 * builder first lays out a page plan, creates every page up front
 * (bufferPages), then draws each page knowing every target's index.
 */
import { createRequire } from "node:module";
import PDFDocument from "pdfkit";

const require = createRequire(import.meta.url);

// iPad landscape, 4:3. 1366 × 1024pt keeps lines crisp at full-screen zoom.
export const W = 1366;
export const H = 1024;

const font = (pkg, file) =>
  require.resolve(`@fontsource/${pkg}/files/${pkg}-latin-${file}-normal.woff`);

const FONTS = {
  display: font("space-grotesk", 500),
  displayBold: font("space-grotesk", 600),
  body: font("hanken-grotesk", 400),
  bodyMedium: font("hanken-grotesk", 500),
  bodySemi: font("hanken-grotesk", 600),
  mono: font("jetbrains-mono", 400),
  monoMedium: font("jetbrains-mono", 500),
};

export const THEMES = {
  light: {
    id: "light",
    name: "Paper",
    bg: "#F6F3EC",
    surface: "#EDE8DE",
    surface2: "#E5DFD2",
    ink: "#23211D",
    muted: "#7F786C",
    faint: "#B3AB9C",
    line: "#DCD5C7",
    dot: "#BCB3A2",
    accent: "#2B78C9",
    accentSoft: "#DCE7F2",
    onAccent: "#FFFFFF",
  },
  dark: {
    id: "dark",
    name: "Midnight",
    bg: "#15171C",
    surface: "#1D2027",
    surface2: "#252932",
    ink: "#ECE9E2",
    muted: "#8E929C",
    faint: "#5B606C",
    line: "#2C3039",
    dot: "#4C5363",
    accent: "#5DA9F2",
    accentSoft: "#1D3045",
    onAccent: "#0D1117",
  },
};

export function createDoc({ title, subject }) {
  const doc = new PDFDocument({
    size: [W, H],
    margin: 0,
    autoFirstPage: false,
    bufferPages: true,
    compress: true,
    info: {
      Title: title,
      Author: "Promptory",
      Subject: subject,
      Creator: "Promptory",
    },
  });
  for (const [name, path] of Object.entries(FONTS))
    doc.registerFont(name, path);
  return doc;
}

/**
 * Thin drawing context bound to a document + theme. Coordinates are PDFKit's
 * (origin top-left, y down).
 */
export class Ctx {
  constructor(doc, theme) {
    this.doc = doc;
    this.t = theme;
  }

  /** Invisible link from a rectangle to page `pageIndex` (fit to screen). */
  link(x, y, w, h, pageIndex) {
    if (pageIndex == null || pageIndex < 0) return;
    const kids = this.doc._root.data.Pages.data.Kids;
    const A = this.doc.ref({ S: "GoTo", D: [kids[pageIndex], "Fit"] });
    A.end();
    this.doc.annotate(x, y, w, h, { Subtype: "Link", A });
  }

  background() {
    this.doc.rect(0, 0, W, H).fill(this.t.bg);
  }

  text(str, x, y, opts = {}) {
    const {
      font = "body",
      size = 14,
      color = this.t.ink,
      width,
      align = "left",
      spacing = 0,
      lineGap = 0,
      wrap = false,
    } = opts;
    this.doc.font(font).fontSize(size).fillColor(color).text(str, x, y, {
      width,
      align,
      characterSpacing: spacing,
      lineGap,
      lineBreak: wrap,
    });
  }

  /** Small uppercase mono label — the planner's "eyebrow" style. */
  label(str, x, y, opts = {}) {
    this.text(str.toUpperCase(), x, y, {
      font: "monoMedium",
      size: 10.5,
      color: this.t.muted,
      spacing: 1.4,
      ...opts,
    });
  }

  width(str, font, size, spacing = 0) {
    this.doc.font(font).fontSize(size);
    return this.doc.widthOfString(str, { characterSpacing: spacing });
  }

  line(x1, y1, x2, y2, color = this.t.line, w = 1) {
    this.doc
      .moveTo(x1, y1)
      .lineTo(x2, y2)
      .lineWidth(w)
      .lineCap("butt")
      .stroke(color);
  }

  rect(x, y, w, h, { r = 0, fill, stroke, lw = 1 } = {}) {
    const d = this.doc;
    if (r) d.roundedRect(x, y, w, h, r);
    else d.rect(x, y, w, h);
    if (fill && stroke) d.lineWidth(lw).fillAndStroke(fill, stroke);
    else if (fill) d.fill(fill);
    else if (stroke) d.lineWidth(lw).stroke(stroke);
  }

  circle(x, y, r, { fill, stroke, lw = 1 } = {}) {
    const d = this.doc;
    d.circle(x, y, r);
    if (fill && stroke) d.lineWidth(lw).fillAndStroke(fill, stroke);
    else if (fill) d.fill(fill);
    else d.lineWidth(lw).stroke(stroke ?? this.t.line);
  }

  /** Ruled writing lines filling a box. */
  ruled(x, y, w, h, step = 34, color = this.t.line) {
    for (let ly = y + step; ly <= y + h + 0.5; ly += step) {
      this.line(x, ly, x + w, ly, color, 0.8);
    }
  }

  /**
   * Dot grid via round-capped dashes — one stroke per row keeps 500-page
   * files small (a dot per circle would be ~10× the size).
   */
  dots(x, y, w, h, step = 24, color = this.t.dot) {
    const cols = Math.floor(w / step);
    const ox = x + (w - cols * step) / 2;
    const d = this.doc;
    d.save();
    d.lineWidth(1.7).lineCap("round").dash(0.01, { space: step });
    for (let ly = y + step / 2; ly <= y + h; ly += step) {
      d.moveTo(ox, ly)
        .lineTo(ox + cols * step + 0.02, ly)
        .stroke(color);
    }
    d.undash();
    d.restore();
  }

  checkbox(x, y, s = 14, color = this.t.faint) {
    this.rect(x, y, s, s, { r: 3.5, stroke: color, lw: 1.1 });
  }

  /** Checklist rows: box + writing line. */
  checklist(x, y, w, rows, step = 34) {
    for (let i = 0; i < rows; i++) {
      const ry = y + i * step;
      this.checkbox(x, ry + step - 22);
      this.line(x + 26, ry + step - 6, x + w, ry + step - 6, this.t.line, 0.8);
    }
  }

  /** Rounded card with an eyebrow title; returns the inner content box. */
  card(x, y, w, h, title, { fill = this.t.surface, pad = 20 } = {}) {
    this.rect(x, y, w, h, { r: 14, fill });
    if (title) this.label(title, x + pad, y + pad - 2);
    const top = title ? 44 : pad;
    return { x: x + pad, y: y + top, w: w - pad * 2, h: h - top - pad + 4 };
  }

  /** Chevron glyph drawn as a path (fonts' arrow glyphs aren't subset). */
  chevron(cx, cy, dir = "right", size = 7, color = this.t.ink) {
    const s = dir === "right" ? 1 : -1;
    this.doc
      .moveTo(cx - (s * size) / 2, cy - size)
      .lineTo(cx + (s * size) / 2, cy)
      .lineTo(cx - (s * size) / 2, cy + size)
      .lineWidth(1.8)
      .lineCap("round")
      .lineJoin("round")
      .stroke(color);
  }

  check(x, y, s = 12, color = this.t.accent) {
    this.doc
      .moveTo(x, y + s * 0.55)
      .lineTo(x + s * 0.38, y + s * 0.9)
      .lineTo(x + s, y + s * 0.1)
      .lineWidth(2)
      .lineCap("round")
      .lineJoin("round")
      .stroke(color);
  }
}
