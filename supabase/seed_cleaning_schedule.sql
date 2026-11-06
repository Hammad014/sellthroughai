-- ============================================================
-- Makeready — spreadsheet product: "Cleaning Schedule"
--
-- A 'gated' template (delivery_type='gated', category='templates'). Buyers
-- get one .xlsx that works in Google Sheets and Excel, plus printable PDF
-- pages in US Letter and A4 (product_files, private bucket), plus a 3-step guide (course_lessons) at
-- /dashboard/courses/cleaning-schedule.
--
-- The file, cover and gallery images are generated from code and uploaded by
--   npm run sheets:build && npm run sheets:test
--   node scripts/sheets/publish.mjs cleaning
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
    'cleaning-schedule',
    'Cleaning Schedule: Chore Tracker That Remembers For You',
    $d$A cleaning schedule that remembers what's due: each chore has a frequency and a last-done date, and Today lists what's due or overdue, most overdue first. 34 chores ready to go, room scores, a 7-day view and a 30-day declutter challenge. Google Sheets and Excel.$d$,
    $d$## Stop keeping the whole house in your head

The hard part of cleaning isn't the cleaning: it's remembering when you last did the oven. Here every chore has a frequency (daily, weekly, every 3 months…) and the date you last did it. The **Today** tab works out what's due and what's overdue, and lists it most overdue first.

## What's inside

- **Today**: what's due and overdue, most overdue first, with who's doing it, plus counts and a house score
- **Next 7 days**: what's coming up each day, so you can spread it out
- **Tasks**: 34 common chores already set up by room and frequency. Change, delete or add your own; assign them to people
- **Rooms**: a clean score for every room (the share of its chores that aren't overdue)
- **Declutter 30**: one small spot a day for 30 days

## Works with

**Google Sheets** (free, on any computer, and on your phone with the Google Sheets app) and **Microsoft Excel** (Microsoft 365, Excel 2016 or newer, Excel for Mac, and the free Excel on the web).

## The details

- Printable pages to print and write on (US Letter and A4 PDFs)
- Room for 200 chores and 15 rooms
- Works for one person or a whole household
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
    $c$Download **Makeready-Cleaning-Schedule.xlsx** from your library, then pick your app.

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
    'Set it up in 5 minutes',
    $c$## 1. Tasks

34 common chores are already there. Change **How often**, delete what you don't need, add your own. Add **Who** if you share the house.

## 2. Last done

Roughly when did you last do each one? Type a date. A chore with no date counts as due today.$c$
  ),
  (
    2,
    'Your routine',
    $c$## Every day

Open **Today**: it shows what's due and overdue, most overdue first. Do one, or a few.

## When you've done a chore

In **Tasks**, type today's date in its **Last done** cell. Shortcut: **Ctrl + ;** (Windows) or **⌘ + ;** (Mac). It jumps to its next date.

## Once a week

Look at **Next 7 Days** and **Rooms** to see what's coming and where to focus.

## If something looks wrong

- **A number stopped updating**: you may have typed over a white (formula) cell. Press Undo, or copy the same cell from the row above.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'cleaning-schedule'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
