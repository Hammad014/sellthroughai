-- ============================================================
-- Makeready — spreadsheet product: "Reading Tracker"
--
-- A 'gated' template (delivery_type='gated', category='templates'). Buyers
-- get one .xlsx that works in Google Sheets and Excel, plus printable PDF
-- pages in US Letter and A4 (product_files, private bucket), plus a 3-step guide (course_lessons) at
-- /dashboard/courses/reading-tracker.
--
-- The file, cover and gallery images are generated from code and uploaded by
--   npm run sheets:build && npm run sheets:test
--   node scripts/sheets/publish.mjs reading
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
    'reading-tracker',
    'Reading Tracker: Book Log, Goal & Reading Challenge',
    $d$A reading tracker that counts itself: log your books and the dashboard shows books and pages this year, your goal, average rating, reading by month and genre, what you're reading now and your top-rated books. Plus a 24-prompt reading challenge. Google Sheets and Excel.$d$,
    $d$## Log the book. The rest counts itself.

Every reading tracker asks you to fill in boxes. This one does the counting: add a book, pick its status, and when you finish it the **Dashboard** updates on its own.

## What's inside

- **Dashboard**: books read this year, progress toward your goal, pages read, average rating, books and pages by month, books by genre, what you're reading now (with progress) and your top-rated books of the year
- **Books**: title, author, genre, format (print, eBook, audiobook), pages, status, dates, the page you're on, a progress bar and a star rating
- **Reading challenge**: 24 prompts for the year (a debut novel, a book over 500 pages, a classic you've never read…). Write a book next to a prompt; it ticks itself when you finish it
- **Quotes**: the lines you want to remember, with the page

## Works with

**Google Sheets** (free, on any computer, and on your phone with the Google Sheets app) and **Microsoft Excel** (Microsoft 365, Excel 2016 or newer, Excel for Mac, and the free Excel on the web). Any year: just type it on the Dashboard.

## The details

- Printable pages to print and write on (US Letter and A4 PDFs)
- Room for 500 books; genres you can rename
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
    $c$Download **Makeready-Reading-Tracker.xlsx** from your library, then pick your app.

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

Type the **year** and your **reading goal** (how many books). Rename the genres at the bottom if you like: the Books tab's dropdown uses them.

## 2. Books

Add what you're reading now and what you want to read next. Pick a **status** from the dropdown: *Want to read*, *Reading*, *Finished* or *Did not finish*.$c$
  ),
  (
    2,
    'As you read',
    $c$## Reading

Set the status to **Reading** and update **On page** now and then: the progress bar fills in, and the book shows on the Dashboard under *Reading now*.

## Finished

Set the status to **Finished**, add the **Finished** date and a **rating**. The Dashboard counts it straight away: books, pages, month, genre and top rated.

## Challenge

Pick a book next to a prompt. It ticks itself off when that book is finished.

## If something looks wrong

- **A finished book isn't counted**: it needs a Finished date in the Dashboard's year.
- **A number stopped updating**: you may have typed over a white (formula) cell. Press Undo, or copy the same cell from the row above.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'reading-tracker'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
