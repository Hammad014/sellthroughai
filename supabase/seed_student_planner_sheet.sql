-- ============================================================
-- Makeready — spreadsheet product: "ADHD Student Planner"
--
-- A 'gated' template (delivery_type='gated', category='templates'). Buyers
-- get one .xlsx that works in Google Sheets and Excel, plus printable PDF
-- pages in US Letter and A4 (product_files, private bucket), plus a 3-step guide (course_lessons) at
-- /dashboard/courses/adhd-student-planner.
--
-- The file, cover and gallery images are generated from code and uploaded by
--   npm run sheets:build && npm run sheets:test
--   node scripts/sheets/publish.mjs student
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
    'adhd-student-planner',
    'ADHD Student Planner: Assignment Tracker',
    $d$Add your assignments once and the planner does the sorting: one Today screen shows what to do next, most urgent first, with a tiny first step. Week view, class progress, exam countdowns and a focus log. Google Sheets and Excel.$d$,
    $d$## One question: what do I do next?

Long to-do lists are hard for ADHD brains: everything looks equally urgent, so nothing gets started. This planner keeps the list out of sight. You add your assignments once, straight from the syllabus, and the **Today** screen shows only what's next, most urgent first, with a *tiny first step* so starting is easy.

## What's inside

- **Today**: your next 12 tasks sorted by due date, with "2 days late", "Today", "Tomorrow" or "In 4 days", plus counts of overdue, due this week and done
- **This week**: every open task on the day it's due, with next and last week one click away
- **Assignments**: class, task, type, due date, status, tiny first step and minutes. Priority (overdue, due today, this week, later) and colours update themselves; done tasks are crossed out and drop off Today
- **Classes**: tasks done, progress bar, next deadline, average grade and study minutes for every class
- **Exams**: a countdown to every exam, turning amber then red as it gets close, and how ready you feel
- **Focus log**: log study sessions and watch the minutes add up today, this week and all term

## Why it works for ADHD

- One screen, one question. No scanning a 60-row list.
- Every task has a tiny first step ("open the doc and write the title").
- Overdue isn't hidden or shamed: it's simply first in line until it's done.
- Two minutes a day to keep it up to date.

## Works with

**Google Sheets** (free, on any computer, and on your phone with the Google Sheets app) and **Microsoft Excel** (Microsoft 365, Excel 2016 or newer, Excel for Mac, and the free Excel on the web). Any school, any term, any year.

## The details

- Printable pages to print and write on (US Letter and A4 PDFs)
- One file, up to 300 assignments, 12 classes and 20 exams
- Starts empty and ready for your term: just add your classes
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
    $c$Download **Makeready-ADHD-Student-Planner.xlsx** from your library, then pick your app.

## Google Sheets (free)

1. Go to **drive.google.com** and sign in (your school Google account works too).
2. Click **New → File upload** and choose the file.
3. Double-click it in Drive, then **File → Save as Google Sheets**.

Dropdowns, formulas and colours all carry over. Use the new Google Sheets version from now on. It also opens in the **Google Sheets app** on your phone, so you can check Today between classes.

## Microsoft Excel

Double-click the file. It works in Microsoft 365 (free for many students through school), Excel 2016 or newer, Excel for Mac and the free **Excel on the web**. If Excel shows *Enable Editing*, click it.

## Prefer pen and paper?

Download the **Printable** PDF (US Letter or A4) from your library and print as many pages as you like.

## Apple Numbers

Numbers isn't supported: some formulas don't carry over. Use Google Sheets instead (free).$c$
  ),
  (
    1,
    'Set it up once (10 minutes)',
    $c$## 1. Classes

Type your classes. Teacher, room and office hours are optional.

## 2. Assignments

Open each syllabus and add everything with a due date: class (dropdown), task, type and due date. Don't sort anything; the planner does that.

If you like, add a **tiny first step** for each task, something that takes 5 minutes: *open the doc and write the title*, *do question 1*, *read 5 pages*. Future you will thank you.

## 3. Exams

Add your exam dates for a countdown.$c$
  ),
  (
    2,
    'Every day (2 minutes)',
    $c$## Open Today

It shows only what's next, most urgent first. Do the top task's tiny first step. If you keep going, great; if not, you've started, and that counts.

## Mark things done

In **Assignments**, set **Status** to *Done*. The task is crossed out and drops off Today.

## Log your focus time

Studied for 25 minutes? Add it to **Focus Log**. Seeing the minutes add up is surprisingly motivating.

## Once a week

Look at **This Week** on Sunday evening so Monday isn't a surprise, and check **Exams** for anything coming up.

## If something looks wrong

- **A task doesn't show on Today**: it needs a task name and a due date, and its status can't be Done.
- **A number stopped updating**: you may have typed over a white (formula) cell. Press Undo, or copy the same cell from the row above.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'adhd-student-planner'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
