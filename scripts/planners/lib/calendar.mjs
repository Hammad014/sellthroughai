/** Date helpers for planner generation. Everything is UTC to dodge DST/TZ drift. */

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
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Weekday names in display order for a given week start. */
export function weekdayNames(weekStart) {
  const start = weekStart === "sun" ? 0 : 1;
  return Array.from({ length: 7 }, (_, i) => DAYS[(start + i) % 7]);
}

export const utc = (y, m, d) => new Date(Date.UTC(y, m, d));
export const addDays = (date, n) => new Date(date.getTime() + n * 86_400_000);
export const isoKey = (date) => date.toISOString().slice(0, 10);
export const daysInMonth = (y, m) => utc(y, m + 1, 0).getUTCDate();

/** Column (0–6) of a date in a week starting on `weekStart`. */
export function weekdayIndex(date, weekStart) {
  const dow = date.getUTCDay();
  return weekStart === "sun" ? dow : (dow + 6) % 7;
}

export function startOfWeek(date, weekStart) {
  return addDays(date, -weekdayIndex(date, weekStart));
}

/** Every week (as its start date) that touches `year`. Week 1 holds Jan 1. */
export function weeksOfYear(year, weekStart) {
  const weeks = [];
  const end = utc(year, 11, 31);
  for (let cur = startOfWeek(utc(year, 0, 1), weekStart); cur <= end; ) {
    weeks.push(cur);
    cur = addDays(cur, 7);
  }
  return weeks;
}

/** Calendar grid rows for a month: arrays of 7 dates (may spill into neighbours). */
export function monthGrid(year, month, weekStart) {
  const rows = [];
  let cur = startOfWeek(utc(year, month, 1), weekStart);
  const last = utc(year, month, daysInMonth(year, month));
  while (cur <= last) {
    rows.push(Array.from({ length: 7 }, (_, i) => addDays(cur, i)));
    cur = addDays(cur, 7);
  }
  return rows;
}

/** Day of year, 1-based. */
export function dayOfYear(date) {
  return Math.round((date - utc(date.getUTCFullYear(), 0, 1)) / 86_400_000) + 1;
}

export function fmtShort(date) {
  return `${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCDate()}`;
}
