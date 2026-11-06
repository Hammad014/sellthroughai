-- ============================================================
-- Makeready — planner product: "Budget Planner"
--
-- A 'gated' planner (delivery_type='gated', category='planners'). Buyers get
-- four hyperlinked PDFs (product_files, private bucket) + a 4-step setup guide
-- (course_lessons) at /dashboard/courses/budget-digital-planner.
--
-- The PDFs, cover and gallery images are generated from code and uploaded by
--   node scripts/planners/build.mjs budget && node scripts/planners/mockups.mjs budget
--   node scripts/planners/publish.mjs budget
-- This seed only holds the copy, so re-pasting it never touches those.
--
-- Seeded as a DRAFT: publish it in /admin once the files are uploaded and
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
    'budget-digital-planner',
    'Budget Planner: Digital Money Planner',
    $d$A calm, fully hyperlinked iPad budget planner: monthly budgets, bill tracker, spending log, savings goals, debt payoff, sinking funds, subscriptions and net worth. 2027 + undated, light and dark.$d$,
    $d$## See exactly where your money goes

Banking apps tell you what you spent. A budget tells you what you *meant* to spend, and that's where things change. This planner gives every month the same simple rhythm: plan it, track it, review it. Everything is linked, so getting from January's budget to its bills or spending log is one tap.

## Every month

- **Monthly budget**: income (planned vs actual), fixed bills, 13 spending categories with budget / spent / left, savings and debt payments, and a *money in · money out · left over* summary
- **Bill tracker**: every bill with its due date, amount, auto-pay and a tick when it's paid
- **Spending log** (2 pages): date, what, category, amount and need vs want
- **No-spend challenge**: a calendar to circle every day you spend nothing extra, plus your rules and what you skipped
- **Month review**: wins, where you overspent, what you'll change, and a rating

## For the whole year

- **Year at a glance**: income, expenses, savings and debt paid for all 12 months on one page
- **6 savings goals**: shade one of 100 boxes every time you put money aside
- **Debt payoff**: all your debts on one page (snowball or avalanche), plus 4 payoff trackers with payment logs
- **Sinking funds**: spread big yearly costs (car, gifts, holidays) into monthly amounts
- **Subscriptions tracker** and a monthly **net worth** tracker
- **10 notes pages**

## Four files, one purchase

| Edition | Light (Linen) | Dark (Ink) |
|---|---|---|
| 2027 | ✓ | ✓ |
| Undated (any year) | ✓ | ✓ |

## Works with

GoodNotes, Notability, Noteshelf, Xodo, Samsung Notes, Flexcil, PDF Expert, and any app that supports PDF links. Made for iPad and Android tablets in landscape (4:3). Any currency: amounts are handwritten.

## The details

- 102 pages, over 2,500 internal links per file, every one tested
- Vector PDF, so it stays crisp at any zoom (about 1 MB per file)
- Instant download from your library, plus a short setup guide

Lifetime access · free updates · 14-day no-questions refund.$d$,
    'planners',
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
    'Which file should I download?',
    $c$You get four files. You only need one to start, but they're all yours.

## Pick your edition

- **2027**: the year is printed throughout and the no-spend calendars show real dates.
- **Undated**: month names only, so you can start any month of any year. The no-spend calendars are numbered 1 to 31.

## Pick your theme

- **Linen**: warm off-white, closest to a paper notebook.
- **Ink**: dark background, easy on the eyes at night. Use a light pen colour.

## Not sure?

Grab **2027 · Linen**. You can download another version from your library any time.$c$
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

**Android (Xodo, Samsung Notes, Noteshelf)**: open the PDF from your Downloads folder and choose your app.

## 3. Name it and you're done

Call it something like *Budget 2027* so it's easy to find.$c$
  ),
  (
    2,
    'How the links work',
    $c$## Always there

- **Month tabs** down the right edge open that month's budget.
- **Top bar**: *Home*, *Year*, *Savings*, *Debt*, *Subscriptions* and *Notes*.
- **BUDGET** in the top-left corner always takes you Home.

## Inside a month

The pills under the page title switch between that month's pages: **Budget**, **Bills**, **Spending**, **No-spend** and **Review**. The arrows go to the same page in the previous or next month.

## On Home

Every month lists its five pages, so you can jump straight to, say, March's bill tracker.

## If a tap draws a line instead of jumping

Tap with your **finger** while your pen is selected, or switch to **read-only / view mode**. In GoodNotes and Notability, turning on *Apple Pencil only draws* lets your finger follow links while your pencil keeps writing.$c$
  ),
  (
    3,
    'Your first month, step by step',
    $c$## 1. Before the month starts (15 minutes)

On the **Budget** page, write the money you expect in under *Income → Planned*. List your fixed bills, then give each spending category a budget. Add what you'll put toward savings and debt.

Then copy each bill onto the **Bills** page with its due date.

## 2. During the month (2 minutes a day)

Log purchases on the **Spending** page as you go (or every evening from your banking app). Tick bills as they're paid. Circle no-spend days on the **No-spend** calendar.

## 3. At the end of the month (15 minutes)

Add up each category from your spending log and fill in *Spent* and *Left* on the Budget page, then the *money in · money out · left over* boxes. Finish with the **Review**: one win, one leak, one change for next month.

## Bigger goals

Set up your **savings goals** and **debt payoff** pages once. Every time you save or pay, shade a box or log the payment. Seeing the progress is what keeps you going.

## Back it up

Turn on your app's cloud backup (iCloud, Google Drive or the app's own sync). You can always re-download the blank planner from your library.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'budget-digital-planner'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
