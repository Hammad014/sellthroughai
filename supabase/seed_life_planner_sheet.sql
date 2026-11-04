-- ============================================================
-- Makeready — spreadsheet product: "Life Planner (Spreadsheet)"
--
-- A 'gated' template (delivery_type='gated', category='templates'). Buyers
-- get one .xlsx (product_files, private bucket) that works in Google Sheets
-- and Excel, plus a 3-step guide (course_lessons) at
-- /dashboard/courses/life-planner-spreadsheet.
--
-- The file, cover and gallery images are generated from code and uploaded by
--   npm run sheets:build && npm run sheets:test
--   node scripts/sheets/publish.mjs life
-- This seed only holds the copy, so re-pasting it never touches those.
--
-- Seeded as a DRAFT. UPSERT: re-pasting updates content, never duplicates.
-- Run AFTER 0006_seed_upsert_keys.sql and 0008_product_gallery.sql.
-- ============================================================

insert into public.products
  (slug, title, short_desc, long_desc, category, price_usd,
   delivery_type, status, featured)
values
  (
    'life-planner-spreadsheet',
    'Life Planner Spreadsheet: Goals, Weekly Plan & Habits',
    $d$Your goals, your week and your habits on one dashboard. Break goals into steps and watch progress fill in, plan each week with a top 3, track habit streaks, and never miss a birthday. Google Sheets and Excel.$d$,
    $d$## Goals, week and habits on one screen

Goals don't fail for lack of motivation; they fail because they never turn into this week's tasks. This planner connects the two: every goal gets small steps, every week gets a top 3, and the **Dashboard** shows how it's all going without you adding anything up.

## What's inside

- **Dashboard**: goals progress, this week's progress, habits done today, the next important date, your top 3, every goal's next step, and what's coming up
- **Weekly plan**: top 3, tasks for every day with ticks, a progress bar, and a three-line review (what went well, what got in the way, what's next)
- **Goals**: up to 20, with area, why it matters, target date, progress bar, days left, and the next step worked out for you
- **Milestones**: small steps for each goal, with due dates
- **Habits**: tick today's row; current streak, best streak and last-30-days count themselves
- **Dates**: birthdays, anniversaries, appointments and deadlines with countdowns. Birthdays roll over every year
- **Monthly review**: rate each month, keep one win and one lesson, and see your average

## Works with

**Google Sheets** (free, on any computer, and on your phone with the Google Sheets app) and **Microsoft Excel** (Microsoft 365, Excel 2016 or newer, Excel for Mac, and the free Excel on the web). Any year: undated.

## The details

- One file, 8 tabs
- Example goals and steps to show you how it works: type over them
- Instant download from your library, plus a short guide

Lifetime access · free updates · 14-day no-questions refund.$d$,
    'templates',
    15.00,
    'gated',
    'draft',
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  short_desc = excluded.short_desc,
  long_desc = excluded.long_desc,
  category = excluded.category,
  price_usd = excluded.price_usd,
  delivery_type = excluded.delivery_type;

insert into public.course_lessons
  (product_id, sort_order, title, content_md)
select p.id, v.sort_order, v.title, v.content_md
from public.products p
cross join (values
  (
    0,
    'Open it in Google Sheets or Excel',
    $c$Download **Makeready-Life-Planner-Spreadsheet.xlsx** from your library, then pick your app.

## Google Sheets (free)

1. Go to **drive.google.com** and sign in.
2. Click **New → File upload** and choose the file.
3. Double-click it in Drive, then **File → Save as Google Sheets**.

Dropdowns, formulas and colours all carry over. Use the new Google Sheets version from now on. It also opens in the **Google Sheets app** on your phone.

## Microsoft Excel

Double-click the file. It works in Microsoft 365, Excel 2016 or newer, Excel for Mac and the free **Excel on the web**. If Excel shows *Enable Editing*, click it.

## Apple Numbers

Numbers isn't supported: some formulas don't carry over. Use Google Sheets instead (free).$c$
  ),
  (
    1,
    'Set it up in 15 minutes',
    $c$## 1. Goals

Write up to 20 goals. Pick an area, add a target date, and write one line on why it matters to you. That line is what keeps you going in March.

## 2. Milestones

Break each goal into small steps: pick the goal from the dropdown, write the step, add a due date. Each goal's progress and next step update themselves.

## 3. Dates

Add birthdays, anniversaries, appointments and deadlines. Birthdays and anniversaries roll over every year.

## 4. Habits

Type the day you start and name up to 8 habits.

The goals and steps are examples: type over them or delete them.$c$
  ),
  (
    2,
    'Your weekly and monthly rhythm',
    $c$## Every week (10 minutes)

Open **Weekly Plan**. Clear last week's yellow cells, write your **top 3**, and spread tasks over the days (tie them to your goals' next steps). Tick ✓ as you go. On Sunday, write the three review lines at the bottom.

## Every day

Glance at the **Dashboard**. Tick your habits in today's row on **Habits** (it's highlighted). Tick off milestones as you reach them.

## Every month

Rate the month 1–10 in **Monthly Review**, and write one win and one lesson. Then pick next month's focus.

## If something looks wrong

- **A goal says "Add steps in Milestones"**: no step uses that goal's exact name yet.
- **A number stopped updating**: you may have typed over a white (formula) cell. Press Undo, or copy the same cell from the row above.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'life-planner-spreadsheet'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
