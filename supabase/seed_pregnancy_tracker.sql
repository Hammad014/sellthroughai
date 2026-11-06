-- ============================================================
-- Makeready — spreadsheet product: "Pregnancy & Baby Tracker"
--
-- A 'gated' template (delivery_type='gated', category='templates'). Buyers
-- get one .xlsx that works in Google Sheets and Excel, plus printable PDF
-- pages in US Letter and A4 (product_files, private bucket), plus a 3-step guide (course_lessons) at
-- /dashboard/courses/pregnancy-baby-tracker.
--
-- The file, cover and gallery images are generated from code and uploaded by
--   npm run sheets:build && npm run sheets:test
--   node scripts/sheets/publish.mjs baby
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
    'pregnancy-baby-tracker',
    'Pregnancy & Baby Tracker: Week by Week, Appointments, Hospital Bag & Baby Log',
    $d$Type your due date and it works out how far along you are, your trimester, days to go and baby's size this week. Appointments with countdowns, a bump log, a hospital-bag checklist, and once baby's here, feeds, nappies and sleep. Google Sheets and Excel.$d$,
    $d$## Type your due date. It does the rest.

From one date, the **Dashboard** shows how many weeks and days along you are, your trimester, the days to go and roughly how big baby is this week. Your next appointments and how much of the hospital bag is packed sit right underneath.

## What's inside

- **Dashboard**: weeks and days along, trimester, days to go, baby's size, next appointments, hospital-bag progress, and today's feeds, nappies and sleep once baby arrives
- **Week by week**: baby's size from week 4 to 40, with room for your own notes
- **Appointments**: every check-up, scan and class, with a countdown and the questions you want to ask
- **Bump log**: weight, bump size, symptoms and mood, with the week worked out from the date
- **Hospital bag**: a checklist for you, for baby and for your partner
- **Baby log**: feeds (side or bottle, ml), nappies and sleep, with today's totals

This is a planner, not medical advice: always follow your midwife or doctor.

## Works with

**Google Sheets** (free, on any computer, and on your phone with the Google Sheets app) and **Microsoft Excel** (Microsoft 365, Excel 2016 or newer, Excel for Mac, and the free Excel on the web).

## The details

- Printable pages to print and write on (US Letter and A4 PDFs)
- One file from the first scan to the first months
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
    $c$Download **Makeready-Pregnancy-Baby-Tracker.xlsx** from your library, then pick your app.

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
    'Set it up in 1 minute',
    $c$## Dashboard

Type your **due date**. Everything else (weeks along, trimester, days to go, baby's size) works itself out every day.

## Appointments

Add the appointments you already have, with the questions you want to ask.$c$
  ),
  (
    2,
    'Week by week, and after the birth',
    $c$## During pregnancy

Now and then, add a row to the **Bump Log**. Tick things off in **Hospital Bag** from about week 35. Add notes in **Week by Week**.

## Once baby's here

Use the **Baby Log**: one row each feed, nappy or sleep. Today's totals show at the top and on the Dashboard, which helps when you're asked "how many feeds today?".

## If something looks wrong

- **A number stopped updating**: you may have typed over a white (formula) cell. Press Undo, or copy the same cell from the row above.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'pregnancy-baby-tracker'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
