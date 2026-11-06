/**
 * End-to-end test of the built planner in a real browser: every screen,
 * saving, reload, backup / erase / restore, dark mode and phone widths.
 *
 *   node scripts/webapps/test.mjs   (run build.mjs first)
 */
import { mkdtempSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { APPS, outDir } from "./build.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const file = path.join(outDir, APPS.planner.file);
const shots = mkdtempSync(path.join(tmpdir(), "planner-test-"));
const KEY = "makeready-life-planner-v1";
let fails = 0;
const ok = (c, msg) => {
  console.log((c ? "PASS " : "FAIL ") + msg);
  if (!c) fails++;
};
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1360, height: 900 },
  acceptDownloads: true,
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("dialog", (d) => d.accept());
const state = async () => {
  await page.waitForTimeout(350);
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);
};
const flush = () => page.waitForTimeout(400);
await page.goto("file://" + file);
await page.fill("#welcome-name", "Sara");
await page.click("[data-act=welcome-done]");

// Today
await page.fill("[data-input=top][data-i='0']", "Finish the proposal");
await page
  .click("[data-act=top-toggle][data-i='0']")
  .catch(() => page.click("[data-act=top-toggle] >> nth=0"));
await page.fill("#add-task", "Call the bank");
await page.keyboard.press("Enter");
await page.fill("#add-task", "Buy groceries");
await page.click("[data-act=task-add]");
ok(
  (await page.$$("[data-act=task-toggle]")).length === 2,
  "two tasks added (Enter + button)",
);
ok(
  (await page.evaluate(() => document.activeElement.id)) === "add-task",
  "focus stays in task input",
);
await page.click("[data-act=task-toggle] >> nth=0");
await page.fill("[data-input=block] >> nth=3", "Deep work");
await page.click("[data-act=mood] >> nth=3");
await page.click("[data-act=energy] >> nth=3");
await page.click("[data-act=water] >> nth=4");
await page.click("[data-act=habit-toggle] >> nth=0");
await page.fill("#add-win", "Went for a walk");
await page.keyboard.press("Enter");
await page.fill("[data-input=notes]", "Remember to email Ali");
await page.fill("[data-input=tomorrow]", "Send invoice");
await flush();
let s = await state();
const today = Object.keys(s.days)
  .sort()
  .find((k) => s.days[k].tasks?.length);
const d = s.days[today];
ok(
  d.top[0].t === "Finish the proposal" && d.top[0].done,
  "top thing saved and ticked",
);
ok(d.tasks.length === 2 && d.tasks[0].done, "tasks saved, first done");
ok(
  d.mood && d.energy && d.water === 5,
  `check-in saved mood=${d.mood} energy=${d.energy} water=${d.water}`,
);
ok(d.wins.length === 1 && d.notes.includes("Ali"), "win + notes saved");
ok(
  Object.values(s.days).some((x) => x.top?.[0]?.t === "Send invoice"),
  "tomorrow's first thing saved on next day",
);
ok(
  Object.values(s.habitLog || {}).length > 0 ||
    JSON.stringify(s.habitLog).includes("true") ||
    JSON.stringify(s.habitLog).length > 2,
  "habit tick saved",
);
await page.screenshot({ path: shots + "/10-today.png" });

// Reload persistence
await page.reload();
ok(!(await page.$(".welcome")), "no welcome after reload");
ok(
  (await page.inputValue("[data-input=top][data-i='0']")) ===
    "Finish the proposal",
  "today persists after reload",
);
ok(
  (await page.inputValue("[data-input=block] >> nth=3")) === "Deep work",
  "time block persists",
);

// Week
await page.click(".side [data-view=week]");
await page.fill("[data-enter=week-add] >> nth=2", "Gym");
await page.keyboard.press("Enter");
ok(
  (await page.evaluate(() => document.activeElement.dataset.enter)) ===
    "week-add",
  "week input keeps focus",
);
const wf = await page.$("[data-input=week-focus]");
if (wf) await wf.fill("Ship the proposal");
await page.screenshot({ path: shots + "/11-week.png" });
await page.click("[data-act=week-next]");
await page.click("[data-act=week-prev]");

// Month
await page.click(".side [data-view=month]");
await page.fill("#event-text", "Mum's birthday");
await page.click("[data-act=event-add]");
s = await state();
ok(
  Object.values(s.events)
    .flat()
    .some((e) => e.t === "Mum's birthday"),
  "event added",
);
const mg = await page.$("[data-input=month-goals]");
if (mg) await mg.fill("Save 300\nRead 2 books");
await page.screenshot({ path: shots + "/12-month.png" });

// Habits
await page.click(".side [data-view=habits]");
await page.fill("#add-habit", "Meditate");
await page.keyboard.press("Enter");
s = await state();
ok(
  s.habits.some((h) => h.name === "Meditate"),
  "habit added",
);
for (const i of [0, 1, 2, 5, 9, 12, 14])
  await page.click(`.habit-table [data-act=habit-toggle] >> nth=${i}`);
await page.screenshot({ path: shots + "/13-habits.png" });

// Goals
await page.click(".side [data-view=goals]");
await page.click("[data-act=goal-add]");
await page.keyboard.type("Run a 10k");
await page.click("[data-act=ms-add] >> nth=0").catch(() => {});
await flush();
s = await state();
ok(s.goals[0]?.title === "Run a 10k", "goal added and focused");
await page.screenshot({ path: shots + "/14-goals.png" });

// Dump
await page.click(".side [data-view=dump]");
await page.fill("#dump-text", "Renew passport");
await page.keyboard.press("Enter");
await page.click("[data-act=dump-to] >> nth=0").catch(() => {});
await page.screenshot({ path: shots + "/15-dump.png" });

// Money
await page.click(".side [data-view=money]");
const addTx = async (desc, amt, type) => {
  await page.selectOption("#tx-type", type);
  await page.fill("#tx-desc", desc);
  await page.fill("#tx-amount", String(amt));
  await page.click("[data-act=tx-add]");
};
await addTx("Salary", 3000, "in");
await addTx("Rent", 1200, "out");
await addTx("Groceries", 85.5, "out");
s = await state();
const tx = Object.values(s.money.tx).flat();
ok(tx.length === 3, "3 transactions saved");
const statText = await page.innerText(".stats");
ok(
  statText.includes("3,000") &&
    statText.includes("1,285.50") &&
    statText.includes("1,714.50"),
  "money totals: " + statText.replace(/\s+/g, " "),
);
await page.screenshot({ path: shots + "/16-money.png", fullPage: true });

// Settings + backup
await page.click(".side [data-view=settings]");
const [dl] = await Promise.all([
  page.waitForEvent("download"),
  page.click("[data-act=backup]"),
]);
const bpath = shots + "/backup.json";
await dl.saveAs(bpath);
const backup = JSON.parse(readFileSync(bpath, "utf8"));
ok(
  backup.version === 1 && backup.goals.length === 1,
  "backup downloaded: " + dl.suggestedFilename(),
);
await page.click("[data-act=setting][data-v=dark]").catch(() => {});
ok(
  (await page.evaluate(() => document.documentElement.dataset.theme)) ===
    "dark",
  "dark theme",
);
await page.screenshot({ path: shots + "/17-settings-dark.png" });
await page.click(".side [data-view=today]");
await page.screenshot({ path: shots + "/18-today-dark.png" });

// Erase then restore
await page.click(".side [data-view=settings]");
await page.click("[data-act=erase]");
await page.waitForTimeout(300);
if (await page.$(".welcome")) await page.click("[data-act=welcome-done]");
s = await state();
ok(!s || !s.goals?.length, "erase cleared data");
await page.click(".side [data-view=settings]").catch(() => {});
await page.setInputFiles("#restore-file", bpath);
await page.waitForTimeout(400);
s = await state();
ok(s.goals?.[0]?.title === "Run a 10k", "restore brought data back");

// Mobile
const m = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const mp = await m.newPage();
mp.on("pageerror", (e) => errors.push("mobile: " + e.message));
await mp.goto("file://" + file);
await mp.click("[data-act=welcome-done]");
await mp.fill("[data-input=top][data-i='0']", "Finish the proposal");
await mp.fill("#add-task", "Call the bank");
await mp.keyboard.press("Enter");
const sw = await mp.evaluate(() => [
  document.documentElement.scrollWidth,
  innerWidth,
]);
ok(sw[0] <= sw[1], "no horizontal scroll on phone " + sw);
await mp.screenshot({ path: shots + "/20-mobile-today.png" });
for (const v of ["week", "habits", "money", "more"]) {
  await mp.click(`.tabbar [data-view=${v}]`);
  const w = await mp.evaluate(() => document.documentElement.scrollWidth);
  ok(w <= 390, `${v}: no horizontal scroll (${w})`);
  await mp.screenshot({ path: shots + `/21-mobile-${v}.png` });
}
ok(errors.length === 0, "no JS errors " + JSON.stringify(errors));
console.log(fails ? `${fails} FAILED` : `ALL PASSED (screenshots in ${shots})`);
await browser.close();
if (fails) process.exit(1);
