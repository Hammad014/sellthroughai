-- ============================================================
-- Makeready — spreadsheet product: "Workout & Weight Tracker"
--
-- A 'gated' template (delivery_type='gated', category='templates'). Buyers
-- get one .xlsx that works in Google Sheets and Excel, plus printable PDF
-- pages in US Letter and A4 (product_files, private bucket), plus a 3-step guide (course_lessons) at
-- /dashboard/courses/workout-weight-tracker.
--
-- The file, cover and gallery images are generated from code and uploaded by
--   npm run sheets:build && npm run sheets:test
--   node scripts/sheets/publish.mjs fitness
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
    'workout-weight-tracker',
    'Workout & Weight Tracker: Weight Goal, Workouts & Personal Bests',
    $d$Log weigh-ins, workouts and lifts, and the dashboard shows your progress to goal, workouts this week, every month of the year and your personal best for every exercise. Google Sheets and Excel.$d$,
    $d$## See your progress, not just your weight

A number on the scales only tells part of the story. This tracker puts your weight next to the work you're putting in: every workout, every lift, and the personal bests you'd otherwise forget.

## What's inside

- **Dashboard**: current weight, lost so far, still to go, progress to your goal, workouts this week, and workouts, minutes and average weight for every month
- **Weight**: weekly weigh-ins and waist, with the change since last time and since you started
- **Workouts**: every session, any kind (strength, run, walk, yoga, class…), with minutes and how hard it felt
- **Strength**: sets, reps and weight for each exercise, with volume worked out
- **Personal bests**: your heaviest lift, best volume, last session and number of sessions for every exercise, updated by themselves

## Works with

**Google Sheets** (free, on any computer, and on your phone with the Google Sheets app) and **Microsoft Excel** (Microsoft 365, Excel 2016 or newer, Excel for Mac, and the free Excel on the web).

## The details

- Printable pages to print and write on (US Letter and A4 PDFs)
- kg or lb
- Room for 500 weigh-ins, 1,000 workouts and 1,500 lifts
- Instant download from your library, plus a short guide

Lifetime access · free updates · 14-day no-questions refund.$d$,
    'templates',
    9.00,
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
    $c$Download **Makeready-Workout-Weight-Tracker.xlsx** from your library, then pick your app.

## Google Sheets (free)

1. Go to **drive.google.com** and sign in.
2. Click **New → File upload** and choose the file.
3. Double-click it in Drive, then **File → Save as Google Sheets**.

Dropdowns, formulas and colours all carry over. Use the new Google Sheets version from now on. It also opens in the **Google Sheets app** on your phone.

## Microsoft Excel

Double-click the file. It works in Microsoft 365, Excel 2016 or newer, Excel for Mac and the free **Excel on the web**. If Excel shows *Enable Editing*, click it.

## Prefer pen and paper?

Download the **Printable** PDF (US Letter or A4) from your library and print as many pages as you like.

## Apple Numbers

Numbers isn't supported: some formulas don't carry over. Use Google Sheets instead (free).$c$
  ),
  (
    1,
    'Set it up in 2 minutes',
    $c$## 1. Dashboard

Type your **starting weight**, your **goal**, your **unit** (kg or lb) and the **year**.

## 2. Exercises

The lifts you do: 10 common ones are there. Rename or add your own; the Strength tab's dropdown uses this list.$c$
  ),
  (
    2,
    'As you go',
    $c$## Weight

Once a week is plenty: same day, same time, same scales. Type the date and the number.

## Workouts and Strength

Log every session on **Workouts**. On lifting days, add each exercise on **Strength** with sets, reps and weight. Your personal bests update on **Exercises**.

## If something looks wrong

- **A number stopped updating**: you may have typed over a white (formula) cell. Press Undo, or copy the same cell from the row above.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'workout-weight-tracker'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
