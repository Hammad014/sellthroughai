-- ============================================================
-- Promptory — planner product: "Clarity Digital Planner"
--
-- A 'gated' planner (delivery_type='gated', category='planners'). Buyers get
-- six hyperlinked PDFs (product_files, private bucket) + a 4-step setup guide
-- (course_lessons) at /dashboard/courses/clarity-digital-planner.
--
-- The PDFs, cover and gallery images are generated from code and uploaded by
--   node scripts/planners/build.mjs && node scripts/planners/mockups.mjs
--   node scripts/planners/publish.mjs
-- This seed only holds the copy, so re-pasting it never touches those.
--
-- Apostrophe rules: inside $c$...$c$ use normal contractions (don't, it's);
-- inside the e'...' long_desc and '...' short_desc, double them (don''t).
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
    'clarity-digital-planner',
    'Clarity Digital Planner',
    'A calm, fully hyperlinked iPad planner. 2027 (Monday or Sunday start) plus an undated edition, each in a light and a dark theme. Tap any date, week or tab and you''re there.',
    e'## Plan your year without the clutter\n\nMost digital planners are either pretty but shallow, or so packed with stickers and sections that you stop opening them by February. Clarity is the opposite: a quiet, well-spaced layout with exactly the pages people actually use, and links on everything, so getting around takes one tap.\n\nTap a month tab and you''re on that month. Tap a date and you''re on that day. Tap a week number and you''re on the week. Every daily page links back to its week and month, and Home is always one tap away.\n\n## What''s inside\n\n- **Home hub**: all 12 months plus quick links to every section\n- **Year at a glance**: every one of the 365 dates is a link\n- **Vision & goals**: word of the year, six life areas, and 4 goal planners with milestones and action steps\n- **12 monthly calendars** with focus, important dates and notes\n- **12 plan & review pages** to set the month up and close it out honestly\n- **12 habit trackers**: 14 habits by every day of the month\n- **53 weekly spreads**: focus, top 3, to-do and a box for each day\n- **365 daily pages**: hourly schedule (6am to 10pm), top 3, to-do, notes, gratitude, mood and water\n- **8 project planners** with tasks, deadlines and status\n- **24 notes pages** (dot grid and lined) with an index\n- **Year in review** for the last week of December\n\n## Six files, one purchase\n\n| Edition | Light (Paper) | Dark (Midnight) |\n|---|---|---|\n| 2027 · Monday start | ✓ | ✓ |\n| 2027 · Sunday start | ✓ | ✓ |\n| Undated (any year) | ✓ | ✓ |\n\nThe undated edition gives every month a calendar, a plan & review page, a habit tracker and five linked weekly spreads with seven daily pages each. Write your own dates in and start any month, in any year.\n\n## Works with\n\nGoodNotes, Notability, Noteshelf, Xodo, Samsung Notes, Flexcil, PDF Expert, and any app that supports PDF links. Made for iPad and Android tablets in landscape (4:3). It also opens fine on a laptop if you prefer typing.\n\n## The details\n\n- 498 pages (dated) / 560 pages (undated), over 12,900 internal links per file, every one tested\n- Vector PDF, so it stays crisp at any zoom (about 6 MB per file)\n- Instant download from your library, plus a short setup guide\n\nLifetime access · free updates · 14-day no-questions refund.',
    'planners',
    19.00,
    'gated',
    'published',
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
    'Which file should I download?',
    $c$You get six files. You only need one to start, but they're all yours, so feel free to grab more than one and switch whenever you like.

## Pick your edition

- **2027 · Monday start**: weeks run Monday to Sunday. Most people in Europe, Asia and Australia plan this way, and so do most work calendars.
- **2027 · Sunday start**: weeks run Sunday to Saturday, the way most US calendars are laid out.
- **Undated**: no printed dates. Start in any month of any year and write the dates in yourself. A good pick if you're starting mid-year, plan in school terms, or just like a fresh page without empty past days.

## Pick your theme

- **Paper**: warm off-white, easy on the eyes in daylight, closest to a real notebook.
- **Midnight**: dark background with light lines. Great for evening planning and OLED screens. Use a light or bright pen colour so your writing stands out.

## Not sure?

Grab **2027 · Monday start · Paper**. It's the one most people stick with, and you can always download another version later from your library.$c$
  ),
  (
    1,
    'Import it into your planner app',
    $c$## 1. Download it on your tablet

Open your Promptory library on the iPad or tablet you'll plan on and tap the file. On iPad it goes to **Files → Downloads**; on Android it lands in your **Downloads** folder.

## 2. Open it in your app

**GoodNotes**: in the Files app, tap and hold the PDF → **Share** → **GoodNotes** → *Import as new document*. Or, inside GoodNotes, tap **+** → **Import** and pick the file.

**Notability**: **Share** → **Notability**, or inside Notability tap **Import** and choose the PDF.

**Noteshelf, Flexcil, PDF Expert**: use the app's **Import** button, or *Share → Open in…* from the Files app.

**Android (Xodo, Samsung Notes, Noteshelf)**: open the PDF from your Downloads folder and choose your app. In Samsung Notes, tap **+** → **Import PDF**.

**Laptop**: any PDF reader works. Links work in Preview, Edge, Chrome and Acrobat.

## 3. Name it and you're done

Give the document a name like *Clarity 2027* so it's easy to find. The import takes a few seconds, since the planner is around 500 pages.$c$
  ),
  (
    2,
    'How the links work',
    $c$Everything in Clarity is a link, and once you know where they are you'll barely scroll again.

## Always there

- **Month tabs** down the right edge jump to that month's calendar. The current month's tab is highlighted.
- **Top bar**: *Home*, *Year*, *Goals*, *Habits* (this month's tracker), *Projects* and *Notes*.
- **CLARITY** in the top-left corner always takes you Home.

## On the calendars

- Tap a **date number** to open that day's page.
- Tap a **week number** (W1, W2…) on a monthly calendar to open that week's spread.
- On a weekly spread, tap a **day's header** to open its daily page.

## On every page

The arrows next to the page title go to the previous and next page of the same kind (next day, next week, next month). The pills between them take you back up a level, from a day to its week or month.

## If a tap draws a line instead of jumping

Most apps only follow links when you're not writing. Either tap with your **finger** while your pen is selected, or switch to **read-only / view mode**. In GoodNotes and Notability, turning on *Apple Pencil only draws* (or *Stylus only*) lets your finger follow links while your pencil keeps writing.$c$
  ),
  (
    3,
    'Make it yours',
    $c$A few habits that make a digital planner stick:

## Start with the big picture

Spend ten minutes on the **Vision & goals** page before anything else. Pick a word for the year, jot a line or two for each life area, and turn one or two of those into a full **goal planner**. Every other page gets easier once you know what you're aiming at.

## Use the monthly rhythm

At the start of each month, fill in the **Plan** side of *Plan & review* and pick a few habits for the **habit tracker**. On the last day, fill in the **Review** side. It's the most valuable ten minutes in the planner.

## Need more pages?

Use your app's page menu to **duplicate** any page: a notes page, a project planner, or a second daily page for a busy day. The links on the original pages keep working, and the copy sits right after it.

## Make it pretty (optional)

GoodNotes, Notability and Noteshelf all support stickers, images and highlighters, so add as much or as little as you like. Clarity's calm layout is designed to look good either way.

## Back it up

Turn on your app's cloud backup (iCloud, Google Drive or the app's own sync) so your year is safe if anything happens to your tablet. You can also re-download the blank planner from your library at any time.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'clarity-digital-planner'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
