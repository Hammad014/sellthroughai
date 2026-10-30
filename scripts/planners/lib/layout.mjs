/**
 * Layout shared by the hyperlinked planners: the page grid, header + pill
 * buttons, the month tab strip and small calendar helpers. Drawing goes
 * through a Ctx (lib/pdf.mjs); `S` is a planner's render state
 * ({ c, t, go, weekStart, dayNames, ... }).
 */
import { W, H } from "./pdf.mjs";
import { MONTHS_SHORT, monthGrid, isoKey } from "./calendar.mjs";

// ---------- Layout grid ----------
export const CX = 64; // content left
export const TAB_X = 1290; // month tab strip
export const CR = TAB_X - 48; // content right
export const CW = CR - CX; // 1178
export const CY = 104; // header top
export const BODY_Y = CY + 92; // body top (196)
export const BODY_B = H - 48; // body bottom (976)
export const BODY_H = BODY_B - BODY_Y; // 780
export const GAP = 18;

export const pad2 = (n) => String(n).padStart(2, "0");

/** Month tabs down the right edge; the active month is highlighted. */
export function monthTabs(c, go, activeMonth) {
  const { t } = c;
  const top = 24;
  const gap = 6;
  const th = (H - top * 2 - gap * 11) / 12;
  for (let m = 0; m < 12; m++) {
    const y = top + m * (th + gap);
    const active = activeMonth === m;
    c.rect(TAB_X, y, W - TAB_X + 16, th, {
      r: 12,
      fill: active ? t.accent : t.surface,
    });
    const label = MONTHS_SHORT[m].toUpperCase();
    const lw = c.width(label, "monoMedium", 12.5, 1.6);
    c.text(label, TAB_X + (W - TAB_X - lw) / 2, y + th / 2 - 7, {
      font: "monoMedium",
      size: 12.5,
      spacing: 1.6,
      color: active ? t.onAccent : t.muted,
    });
    c.link(TAB_X, y, W - TAB_X, th, go(`month-${m}`));
  }
}

/** Right-aligned row of pills ending at `right`. Items: {label|chevron, active, target}. */
export function pillRow(c, right, y, items, { h = 34, size = 13.5 } = {}) {
  const { t } = c;
  const pad = 16;
  const gap = 8;
  const widths = items.map((it) =>
    it.chevron ? h : c.width(it.label, "bodyMedium", size) + pad * 2,
  );
  let x = right - widths.reduce((a, b) => a + b, 0) - gap * (items.length - 1);
  items.forEach((it, i) => {
    const w = widths[i];
    const disabled = it.target == null;
    c.rect(x, y, w, h, {
      r: h / 2,
      fill: it.active ? t.accent : t.surface,
    });
    const color = it.active ? t.onAccent : disabled ? t.faint : t.ink;
    if (it.chevron) c.chevron(x + w / 2, y + h / 2, it.chevron, 6, color);
    else
      c.text(it.label, x + pad, y + h / 2 - size * 0.62, {
        font: "bodyMedium",
        size,
        color,
      });
    if (!disabled) c.link(x, y, w, h, it.target);
    x += w + gap;
  });
}

export function header(S, eyebrow, title, actions = []) {
  const { c, t } = S;
  c.label(eyebrow, CX, CY);
  c.text(title, CX - 2, CY + 20, { font: "display", size: 40, color: t.ink });
  if (actions.length) pillRow(c, CR, CY + 28, actions);
}

export function ratingRow(c, box, n) {
  const step = Math.min(44, box.w / n);
  for (let i = 0; i < n; i++) {
    const cx = box.x + 16 + i * step;
    c.circle(cx, box.y + 22, 15, { stroke: c.t.faint });
    c.text(String(i + 1), cx - 15, box.y + 16, {
      font: "mono",
      size: 11,
      color: c.t.muted,
      width: 30,
      align: "center",
    });
  }
}

/** Mini month calendar; optional per-date links to daily pages. */
export function miniMonth(S, x, y, w, h, year, m, { links, size }) {
  const { c, t, go, weekStart, dayNames } = S;
  const rows = monthGrid(year, m, weekStart);
  const cw = w / 7;
  const rh = h / 7;
  dayNames.forEach((n, i) =>
    c.text(n[0], x + i * cw, y, {
      font: "mono",
      size: size - 1,
      color: t.faint,
      width: cw,
      align: "center",
    }),
  );
  rows.forEach((row, r) => {
    row.forEach((d, i) => {
      if (d.getUTCMonth() !== m) return;
      const cx = x + i * cw;
      const cy = y + (r + 1) * rh;
      c.text(String(d.getUTCDate()), cx, cy, {
        font: "mono",
        size,
        color: t.ink,
        width: cw,
        align: "center",
      });
      if (links) c.link(cx, cy - rh / 3, cw, rh, go(`day-${isoKey(d)}`));
    });
  });
}

export function blankMini(S, x, y, w, h) {
  const { c, t, dayNames } = S;
  const cw = w / 7;
  const rh = (h - 18) / 6;
  dayNames.forEach((n, i) =>
    c.text(n[0], x + i * cw, y, {
      font: "mono",
      size: 10.5,
      color: t.faint,
      width: cw,
      align: "center",
    }),
  );
  for (let r = 0; r < 6; r++)
    for (let i = 0; i < 7; i++)
      c.rect(x + i * cw + cw / 2 - 9, y + 22 + r * rh, 18, rh - 8, {
        r: 4,
        stroke: t.line,
        lw: 0.8,
      });
}
