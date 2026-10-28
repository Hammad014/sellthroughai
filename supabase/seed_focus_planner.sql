-- ============================================================
-- Makeready — planner product: "Focus Planner (ADHD-friendly)"
--
-- A 'gated' planner (delivery_type='gated', category='planners'). Buyers get
-- six hyperlinked PDFs (product_files, private bucket) + a 4-step setup guide
-- (course_lessons) at /dashboard/courses/focus-adhd-digital-planner.
--
-- The PDFs, cover and gallery images are generated from code and uploaded by
--   node scripts/planners/build.mjs focus && node scripts/planners/mockups.mjs focus
--   node scripts/planners/publish.mjs focus
-- This seed only holds the copy, so re-pasting it never touches those.
--
-- Seeded as a DRAFT: publish it in /admin once the files are uploaded and
-- you've added its Lemon Squeezy variant id.
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
    'focus-adhd-digital-planner',
    'Focus Planner: ADHD-Friendly Digital Planner',
    $d$A calm, fully hyperlinked iPad planner built for brains that juggle too much: just 3 things a day, visual time blocks, a monthly brain dump, and task breakdowns for the scary stuff. 2027 + undated, light and dark.$d$,
    $d$## A planner that doesn't make you feel behind

Most planners assume you'll fill in every box, every day. Miss a week and the empty pages start to feel like a scolding. Focus is built the other way round: small daily pages, one thing that matters most, and no catching up. Skip a day? Just open today.

## Built around how busy, scattered brains actually work

- **Just 3 things**: every day starts with three tasks, and a star for the one that matters most. If that's all you do, the day counts.
- **Visual time blocks**: colour in hour blocks instead of writing a schedule, so you can *see* your day at a glance.
- **Brain dump, every month**: empty everything out of your head, then sort it into four boxes: Do today, Schedule it, Ask for help, Let it go.
- **Task breakdowns**: turn a big, scary task into a tiny first step (5 minutes or less), then the next tiny steps.
- **Energy, mood and basics**: a quick check-in for energy, mood, water, meals and moving, without a wall of trackers.
- **Wins today**: write down what went well, big or tiny. It's the page people say they miss most.
- **Dopamine menu**: your own list of quick boosts for flat or stuck days, so you reach for it instead of your phone.
- **Routines**: morning, evening and weekly-reset checklists you build once and reuse.

## What's inside

- **365 daily pages** (dated) or 420 (undated), each linked to its week and month
- **53 weekly pages** (60 undated): one focus, must / should / could, and a habit streak
- **12 monthly calendars** with one big goal and a reward for hitting it
- **12 brain dump pages** and **12 habit trackers** (8 habits, kept deliberately small)
- **12 task breakdown pages**, **routines**, a **dopamine menu** and **20 notes pages**

## Six files, one purchase

| Edition | Light (Sage) | Dark (Night) |
|---|---|---|
| 2027 · Monday start | ✓ | ✓ |
| 2027 · Sunday start | ✓ | ✓ |
| Undated (any year) | ✓ | ✓ |

## Works with

GoodNotes, Notability, Noteshelf, Xodo, Samsung Notes, Flexcil, PDF Expert, and any app that supports PDF links. Made for iPad and Android tablets in landscape (4:3).

## The details

- 493 pages (dated) / 555 pages (undated), over 12,000 internal links per file, every one tested
- Vector PDF, so it stays crisp at any zoom (about 6–7 MB per file)
- Instant download from your library, plus a short setup guide

*Designed to be ADHD-friendly; it's a planning tool, not medical advice or treatment.*

Lifetime access · free updates · 14-day no-questions refund.$d$,
    'planners',
    17.00,
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
    'Which file should I download?',
    $c$You get six files. You only need one to start, but they're all yours, so grab more than one and switch whenever you like.

## Pick your edition

- **2027 · Monday start**: weeks run Monday to Sunday, like most work calendars.
- **2027 · Sunday start**: weeks run Sunday to Saturday, the way most US calendars are laid out.
- **Undated**: no printed dates. Start in any month of any year and write dates in yourself. Great if you're starting mid-year, or if empty past days make you feel behind.

## Pick your theme

- **Sage**: soft off-white with calm greens. Easy on the eyes in daylight.
- **Night**: dark background, great for evening planning and OLED screens. Use a light or bright pen colour.

## Not sure?

Grab **Undated · Sage**. Many people find undated planners easier to stick with: there's never a blank week staring back at you. You can download another version any time.$c$
  ),
  (
    1,
    'Import it into your planner app',
    $c$## 1. Download it on your tablet

Open your Makeready library on the iPad or tablet you'll plan on and tap the file. On iPad it goes to **Files → Downloads**; on Android it lands in your **Downloads** folder.

## 2. Open it in your app

**GoodNotes**: in the Files app, tap and hold the PDF → **Share** → **GoodNotes** → *Import as new document*. Or, inside GoodNotes, tap **+** → **Import** and pick the file.

**Notability**: **Share** → **Notability**, or inside Notability tap **Import** and choose the PDF.

**Noteshelf, Flexcil, PDF Expert**: use the app's **Import** button, or *Share → Open in…* from the Files app.

**Android (Xodo, Samsung Notes, Noteshelf)**: open the PDF from your Downloads folder and choose your app. In Samsung Notes, tap **+** → **Import PDF**.

## 3. Name it and you're done

Call it something like *Focus 2027* so it's easy to find. The import takes a few seconds, since the planner is around 500 pages.$c$
  ),
  (
    2,
    'How the links work',
    $c$Everything is a link, so you'll rarely need to scroll.

## Always there

- **Month tabs** down the right edge open that month's calendar.
- **Top bar**: *Home*, this month's *Brain dump* and *Habits*, your *Routines*, *Breakdowns* and *Notes*.
- **FOCUS** in the top-left corner always takes you Home.

## Getting to today

Open the month, then tap today's date. Or tap a week number (W1, W2…) to open that week, then tap a day's name.

## On every page

The arrows next to the page title go to the previous and next page of the same kind. The pills between them take you up a level, from a day to its week or month.

## If a tap draws a line instead of jumping

Most apps only follow links when you're not writing. Tap with your **finger** while your pen is selected, or switch to **read-only / view mode**. In GoodNotes and Notability, turning on *Apple Pencil only draws* (or *Stylus only*) lets your finger follow links while your pencil keeps writing.$c$
  ),
  (
    3,
    'Make it stick (without trying to be perfect)',
    $c$## Start with one page

For the first week, only use the **daily page**: write 3 things, star one, and fill in *Wins today* before bed. That's it. Add other pages once this feels easy.

## Brain dump when it's loud in your head

When everything feels urgent, open this month's **Brain dump** and write it all down, no sorting. Later, move each item into one of the four boxes. *Let it go* is a real option.

## Make scary tasks tiny

If you keep avoiding something, give it a **Task breakdown** page. Make the first step so small it feels silly ("open the document", "find the email"). Starting is the hard part.

## Fill in the dopamine menu on a good day

Write your quick boosts while you have the energy. On a flat day, pick from the list instead of deciding from scratch.

## Missed days are fine

There's nothing to catch up on. Skip empty pages and open today. The planner works for you, not the other way round.

## Back it up

Turn on your app's cloud backup (iCloud, Google Drive or the app's own sync). You can always re-download the blank planner from your library.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'focus-adhd-digital-planner'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
