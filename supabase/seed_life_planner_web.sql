-- ============================================================
-- Makeready — planner product: "Life Planner (Web App)"
--
-- A 'gated' planner (delivery_type='gated', category='planners'). Buyers get
-- ONE self-contained HTML file (product_files, private bucket) that opens in
-- their browser and saves as they type, plus a short guide (course_lessons)
-- at /dashboard/courses/life-planner-web-app.
--
-- The file, cover and gallery images are generated from code and uploaded by
--   node scripts/webapps/build.mjs && node scripts/webapps/mockups.mjs
--   node scripts/webapps/publish.mjs
-- This seed only holds the copy, so re-pasting it never touches those.
--
-- Seeded as a DRAFT: publish it in /admin once the file is uploaded and
-- checkout is set up.
--
-- UPSERT: re-pasting updates content and never duplicates. Preserves admin
-- fields (status, featured, ls_variant_id, cover_image_url, gallery).
-- Run AFTER 0006_seed_upsert_keys.sql and 0008_product_gallery.sql.
-- ============================================================

insert into public.products
  (slug, title, short_desc, long_desc, category, price_usd,
   delivery_type, status, featured)
values
  (
    'life-planner-web-app',
    'Life Planner: The Planner You Just Open and Use',
    $d$A complete daily, weekly and monthly planner with habits, goals and budget, in one file that opens in your browser. No app, no account, no setup: double-click and start typing. It saves as you go and works offline.$d$,
    $d$## Open it. Plan. Done.

Most digital planners make you do the work first: import a PDF, learn an app, find a stylus. This one is a single file. Double-click it and your planner opens in your browser, already set to today. Type into it, tick things off, and it saves automatically. Close it, open it again tomorrow, and everything is still there.

## Today

- **Just 3 things**: the tasks that would make today a good day, with a star for the one that matters most
- **To-do list**: add with Enter, tick when done, or push a task to tomorrow with one click
- **Time blocks** from 6am to 10pm
- **Check-in**: mood, energy and water, one tap each
- **Habits, wins and notes**, plus *Tomorrow, first thing* so you start the next day already knowing what to do

## This week, this month

- **Week view**: your one focus for the week, every day's tasks side by side, and a weekly review
- **Month calendar**: see how much of each day you got done, add birthdays and appointments, and set monthly goals

## Habits, goals and money

- **Habit tracker**: tap a day to tick it; streaks and monthly totals count themselves
- **Goals**: why it matters, a deadline, and milestones with a progress bar
- **Brain dump**: empty your head, then send each item to today, tomorrow, or let it go
- **Budget**: log money in and out and watch it add up by category, with *money in · money out · left over* and savings goals. Any currency.

## Yours, and private

Everything stays on your computer, in your browser. Nothing is uploaded and there's no account to make. Download a backup whenever you like (one click in Settings) and restore it on any computer.

## Works with

Chrome, Edge, Firefox and Safari on Windows, Mac, Chromebook and Linux. Made for computers and laptops: phones can't run a downloaded web file reliably (iPhone shows only a preview), so plan on a computer. Light and dark mode, Monday or Sunday week start.

## The details

- One file, about 140 KB; works offline
- Instant download from your library, plus a short guide

Lifetime access · free updates · 14-day no-questions refund.$d$,
    'planners',
    19.00,
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
    'Open your planner',
    $c$## 1. Download it to your computer

Download **Makeready-Life-Planner.html** from your library. Move it somewhere you'll find it again, like your **Documents** folder or your desktop.

## 2. Double-click it

It opens in your web browser (Chrome, Edge, Firefox or Safari), already set to today. Type your first name if you like, press **Start planning**, and you're in.

## 3. Open it the same way every time

Your planner saves into the browser you opened it with, for this file in this folder. So keep the file where it is and open it the same way each time. Tip: once it's open, **bookmark the page** (Ctrl+D, or ⌘D on a Mac) and you're one click away from your planner.

## On a phone?

Phones don't run downloaded web files properly: iPhone and iPad only show a preview, and Android is hit-and-miss. Use your planner on a computer or laptop.$c$
  ),
  (
    1,
    'How saving works (and backups)',
    $c$## It saves as you type

There's no save button. Everything you type or tick is saved within a moment; you'll see **Saved** in the bottom-left corner.

## Where your data lives

In your browser, on your computer. Nothing is uploaded anywhere, and nobody else can see it.

## Back it up now and then

Go to **Settings → Download backup**. You get a small file (life-planner-backup-DATE.json); keep it somewhere safe, like a cloud drive. The planner reminds you every couple of weeks.

Make a backup before you clear your browser's history or cookies, since that can wipe what your browser has saved.

## Moving to another computer

Copy the planner file to the new computer, open it, then **Settings → Restore from backup** and pick your backup file. Everything comes back exactly as it was.$c$
  ),
  (
    2,
    'A 5-minute daily routine',
    $c$## Morning (2 minutes)

Open **Today**. Write your **Just 3 things** and star the one that matters most. Anything smaller goes in the **To-do** list. If you like structure, put your big task in a **time block**.

## During the day

Tick things off as you go. Not happening today? Click the **→** next to a task to move it to tomorrow, no guilt.

## Evening (3 minutes)

Tick your **habits**, tap your mood and energy, and add one **win**, however small. Then fill in **Tomorrow, first thing** so tomorrow starts itself.

## Once a week

Open **Week**: set one focus for the coming week and write a quick review of the last one.

## Once a month

Open **Month** to add birthdays and appointments and set your monthly goals. Check **Money** to see where it went, and adjust next month's budget.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'life-planner-web-app'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
