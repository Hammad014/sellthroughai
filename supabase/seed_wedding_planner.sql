-- ============================================================
-- Makeready — spreadsheet product: "Wedding Planner & Budget"
--
-- A 'gated' template (delivery_type='gated', category='templates'). Buyers
-- get one .xlsx that works in Google Sheets and Excel, plus printable PDF
-- pages in US Letter and A4 (product_files, private bucket), plus a 3-step guide (course_lessons) at
-- /dashboard/courses/wedding-planner.
--
-- The file, cover and gallery images are generated from code and uploaded by
--   npm run sheets:build && npm run sheets:test
--   node scripts/sheets/publish.mjs wedding
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
    'wedding-planner',
    'Wedding Planner & Budget: Checklist, Guest List & RSVPs',
    $d$Your whole wedding on one dashboard: days to go, budget left, guests coming and meal counts, and what's next on a 32-task checklist that counts back from your date. Budget, guest list with RSVPs, and vendors. Google Sheets and Excel.$d$,
    $d$## Your whole wedding, on one dashboard

Type your date and your budget. The **Dashboard** shows the days to go, how much of the budget is left, what you've paid, how many guests are coming and what they're eating, and the next things to do.

## What's inside

- **Dashboard**: countdown, budget left, paid so far, guests coming, checklist and budget progress, next tasks, spending by category and meal counts
- **Checklist**: 32 tasks from "set a budget" to "rehearsal", each due a set time before the day, flagged when overdue or coming up
- **Budget**: estimate, actual and paid for every item, and what's still to pay. It counts the actual price once you have it
- **Guest list**: side, group, party size, invited, RSVP, meal choice, table and dietary notes; the counts add themselves up
- **Vendors**: every supplier's contact details, whether they're booked and the deposit

## Works with

**Google Sheets** (free, on any computer, and on your phone with the Google Sheets app) and **Microsoft Excel** (Microsoft 365, Excel 2016 or newer, Excel for Mac, and the free Excel on the web).

## The details

- Printable pages to print and write on (US Letter and A4 PDFs)
- Room for 400 guests, 100 budget items and 40 vendors
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
    $c$Download **Makeready-Wedding-Planner.xlsx** from your library, then pick your app.

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
    $c$## 1. Dashboard

Type your **wedding date**, your **total budget** and your names.

## 2. Checklist

32 tasks are already there, each due a set number of days before the wedding. Change the days to suit you, tick what you've done, add your own.

## 3. Budget

List every cost with an estimate. When you book, add the actual price and what you've paid.$c$
  ),
  (
    2,
    'Guests and RSVPs',
    $c$## Guests

Add everyone you invite, one row per invitation. Put **2** in People for a couple, so the numbers stay right. Tick **Invited** when it's sent.

## As replies come in

Set **RSVP** to Yes or No and pick the meal. The Dashboard counts who's coming, who hasn't replied, and each meal for the caterer.

## If something looks wrong

- **A number stopped updating**: you may have typed over a white (formula) cell. Press Undo, or copy the same cell from the row above.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'wedding-planner'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
