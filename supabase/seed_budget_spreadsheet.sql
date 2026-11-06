-- ============================================================
-- Makeready — spreadsheet product: "Budget Spreadsheet"
--
-- A 'gated' template (delivery_type='gated', category='templates'). Buyers
-- get one .xlsx that works in Google Sheets and Excel, plus printable PDF
-- pages in US Letter and A4 (product_files, private bucket), plus a 3-step guide (course_lessons) at
-- /dashboard/courses/budget-spreadsheet.
--
-- The file, cover and gallery images are generated from code and uploaded by
--   npm run sheets:build && npm run sheets:test
--   node scripts/sheets/publish.mjs budget
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
    'budget-spreadsheet',
    'Budget Spreadsheet: Google Sheets & Excel',
    $d$A budget that does the maths for you. Log what you spend and every total, progress bar, paycheck plan, savings goal and debt-free date updates itself. Works in Google Sheets and Excel.$d$,
    $d$## Type it once. It adds up for you.

Most budget planners hand you empty boxes and a calculator. This one is a spreadsheet: you log money in and out, pick a category from a dropdown, and everything else calculates itself. No formulas to write, no maths, no subscription.

## Ten tabs, one system

- **Setup**: your categories and monthly budget, with a zero-based *left to assign* check and a 50 / 30 / 20 split
- **Monthly dashboard**: pick a month and see planned vs actual for every category, with progress bars that turn red when you overspend
- **Transactions**: one simple log for the whole year (date, description, category, amount)
- **Year at a glance**: every category across all 12 months, with totals and monthly averages
- **Bills & paychecks**: assign each bill to a paycheck, see what's left from each, tick bills off every month
- **Debt payoff**: snowball or avalanche, with your exact debt-free date, payoff order and interest per debt
- **Debt plan**: month-by-month balances until you're debt-free
- **Savings & sinking funds**: how much to save each month to hit every goal on time
- **Net worth**: what you own minus what you owe, month by month

## Works with

**Google Sheets** (free, on any computer, and on your phone with the Google Sheets app) and **Microsoft Excel** (Microsoft 365, Excel 2016 or newer, Excel for Mac, and the free Excel on the web). Any currency.

## The details

- Printable pages to print and write on (US Letter and A4 PDFs)
- One file: open it in the app you like
- Example categories, bills and debts to show you how it works: type over them
- Yellow cells are yours; everything else is a formula, so nothing to break by accident
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
    $c$Download **Makeready-Budget-Spreadsheet.xlsx** from your library, then pick your app.

## Google Sheets (free)

1. Go to **drive.google.com** and sign in.
2. Click **New → File upload** and choose the file.
3. Double-click it in Drive, then **File → Save as Google Sheets**.

That's it: dropdowns, formulas and colours all carry over. Use the new Google Sheets version from now on (you can delete the .xlsx in Drive). It also opens in the **Google Sheets app** on your phone.

## Microsoft Excel

Double-click the file. It works in Microsoft 365, Excel 2016 or newer, Excel for Mac, and the free **Excel on the web** (upload it to OneDrive). If Excel shows *Enable Editing*, click it.

## Prefer pen and paper?

Download the **Printable** PDF (US Letter or A4) from your library and print as many pages as you like.

## Apple Numbers

Numbers isn't supported: some formulas and dropdowns don't carry over. Use Google Sheets instead (free).$c$
  ),
  (
    1,
    'Set it up in 15 minutes',
    $c$## 1. Setup tab

Type your **year** and **currency symbol**. Then go down the category list: rename, delete or add categories, give each one a **Type** (Income, Need, Want, Savings or Debt) and a **monthly budget**.

Watch **Left to assign** on the right. Aim for **0**: that means every bit of income has a job.

## 2. Bills tab

Type your two paycheck amounts, then list your regular bills with their amount, due day and which paycheck pays them. You'll see straight away what's left from each paycheck.

## 3. Debt Payoff (if you have debts)

Type each debt's balance, interest rate and minimum payment, choose **Snowball** or **Avalanche**, and add an extra monthly amount if you can. Your debt-free date appears instantly. **Debt Plan** shows every month.

## 4. Savings

Add your goals with a target and a date. Give a goal **the same name as a Savings category** and every transfer you log counts toward it automatically.

The examples are there to show you how it works: type over them or delete them.$c$
  ),
  (
    2,
    'Your routine (2 minutes a day)',
    $c$## Every day or every few days

Open **Transactions** and add what you spent: date, a few words, category, amount. Amounts are always positive; the category decides whether it's money in or out. Many people do it once a week from their banking app.

## On payday and bill days

Tick bills off in **Bills** as they're paid.

## Once a month

- **Dashboard**: pick the month and see where you went over or under.
- **Year**: spot patterns across months.
- **Net Worth**: type this month's balances.
- Adjust next month's budgets in **Setup**.

## If something looks wrong

- **Type says Unknown**: the category isn't in Setup (check the spelling).
- **A number stopped updating**: you may have typed over a white (formula) cell. Press Undo, or copy the same cell from the row above.
- Keep the original file as a spare copy, just in case.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'budget-spreadsheet'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
