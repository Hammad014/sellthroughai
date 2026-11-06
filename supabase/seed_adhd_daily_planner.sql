-- ============================================================
-- Makeready — spreadsheet product: "ADHD Daily Planner"
--
-- A 'gated' template (delivery_type='gated', category='templates'). Buyers
-- get one .xlsx that works in Google Sheets and Excel, plus printable PDF
-- pages in US Letter and A4 (product_files, private bucket), plus a 3-step guide (course_lessons) at
-- /dashboard/courses/adhd-daily-planner.
--
-- The file, cover and gallery images are generated from code and uploaded by
--   npm run sheets:build && npm run sheets:test
--   node scripts/sheets/publish.mjs adhd
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
    'adhd-daily-planner',
    'ADHD Daily Planner: Brain Dump, Habits & Routines',
    $d$A daily planner built around how ADHD brains actually work: dump everything, give it a When, and the Today screen shows just what's next with a tiny first step. Energy check-in, habit streaks, routines and a dopamine menu. Google Sheets and Excel.$d$,
    $d$## Start, even on the hard days

Most planners assume you'll sit down, plan your day and follow it. This one starts where you are. Tell it your energy, and it suggests what kind of task to do. Dump everything on your mind, give each item a When, and the **Today** screen shows only today's things, each with a tiny first step so starting is easy.

## What's inside

- **Today**: an energy check-in (1–5) with a suggestion, *Just 3 things*, everything you marked *Today* in the brain dump, and today's habits with streaks
- **Brain dump**: empty your head, one thing per row, then sort each into Today, Tomorrow, This week, Someday or *Let it go*. Add a size (Tiny, Small, Big) and a tiny first step
- **Habits**: tick today's row; current streak, best streak and last-30-days count themselves
- **Routines**: morning, after work or school, and evening, with minutes per step and a tick for each day of the week
- **Dopamine menu**: your own list of quick boosts, bigger energy, things that make boring tasks better, and treats to keep in check
- **Focus log**: every focused session, with today, this week and all-time totals

## Made for ADHD

- Nothing turns red or nags you when you miss a day
- Low battery? It points you to your dopamine menu and a Tiny task, not your hardest one
- Two minutes a day keeps it working

## Works with

**Google Sheets** (free, on any computer, and on your phone with the Google Sheets app) and **Microsoft Excel** (Microsoft 365, Excel 2016 or newer, Excel for Mac, and the free Excel on the web).

## The details

- Printable pages to print and write on (US Letter and A4 PDFs)
- One file: 300 brain-dump rows, 8 habits for a full year, 3 routines
- Starts with example habits, routines and a dopamine menu you can change
- Instant download from your library, plus a short guide

Lifetime access · free updates · 14-day no-questions refund.$d$,
    'templates',
    12.00,
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
    $c$Download **Makeready-ADHD-Daily-Planner.xlsx** from your library, then pick your app.

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
    'Set it up in 3 minutes',
    $c$## 1. Brain Dump

Type everything that's on your mind, one per row. Don't sort while you type: getting it out of your head is the point.

## 2. Give each one a When

*Today*, *Tomorrow*, *This week*, *Someday*, or *Let it go* (that's allowed). If you like, add a size and a tiny first step: something that takes 5 minutes, like *open the doc* or *find the number*.

## 3. Habits

Type the day you start in **Start date**, and rename the habits to your own (up to 8).

The habits, routines and dopamine menu come with examples: change them to yours.$c$
  ),
  (
    2,
    'Every day (2 minutes)',
    $c$## Open Today

Pick your energy (1–5) and read the suggestion. Fill in **Just 3 things**. Everything you marked *Today* in the brain dump is listed underneath, each with its tiny first step.

## When something's done

Tick ✓ in the brain dump and it leaves Today. Tick your habits in today's row on **Habits** (it's highlighted).

## Each morning

Switch yesterday's *Tomorrow* items to *Today*. One dropdown each.

## When it's hard to start

Do only the tiny first step. Low battery? Pick something from your **Dopamine Menu** first. Missed a few days? Nothing is lost: just open Today again.

## If something looks wrong

- **A task doesn't show on Today**: its When must be *Today* and it can't be ticked ✓.
- **A number stopped updating**: you may have typed over a white (formula) cell. Press Undo, or copy the same cell from the row above.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'adhd-daily-planner'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
