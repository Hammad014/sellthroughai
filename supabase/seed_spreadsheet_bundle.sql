-- ============================================================
-- Makeready — bundle product: "The Planner Spreadsheet Bundle"
--
-- All six spreadsheet planners at one price. Buying it grants all six (see
-- the webhook's bundle handling).
--
-- Run AFTER the six spreadsheet seeds (seed_budget_spreadsheet.sql,
-- seed_life_planner_sheet.sql, seed_adhd_daily_planner.sql,
-- seed_student_planner_sheet.sql, seed_reading_tracker.sql,
-- seed_meal_planner.sql) and 0007_bundles.sql. Seeded as a DRAFT.
-- UPSERT: safe to re-paste.
-- ============================================================

insert into public.products
  (slug, title, short_desc, long_desc, category, price_usd,
   delivery_type, status, featured)
values
  (
    'planner-spreadsheet-bundle',
    'The Planner Spreadsheet Bundle',
    $d$All six planner spreadsheets for Google Sheets and Excel: Budget, Life Planner, ADHD Daily Planner, ADHD Student Planner, Reading Tracker and Meal Planner. Save $33.$d$,
    $d$## Every part of your life, in spreadsheets that do the work

Six planners that add up, sort and count for you. You type; they do the rest.

- **Budget Spreadsheet**: monthly dashboard, transactions, bills and paychecks, debt payoff (snowball or avalanche), savings goals and net worth
- **Life Planner**: goals with progress and next steps, a weekly plan, habits with streaks, important dates and a monthly review
- **ADHD Daily Planner**: an energy check-in, just 3 things, a brain-dump sorter, habits, routines and a dopamine menu
- **ADHD Student Planner**: today's most urgent tasks with a tiny first step, a week view, class progress, exam countdowns and a focus log
- **Reading Tracker**: a book log, your reading goal, stats by month and genre, and a 24-prompt reading challenge
- **Meal Planner**: a weekly meal plan with a grocery list that writes itself, sorted by aisle

## Works with

Google Sheets (free, on computer and phone) and Microsoft Excel.

## How it works

Every planner also comes with printable pages (US Letter and A4) to print and write on.

Buy once and all six unlock in your library straight away, each with its own short guide.

Lifetime access · free updates · 14-day no-questions refund.$d$,
    'bundles',
    39.00,
    'license',
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

insert into public.product_bundle_items (bundle_id, item_product_id, sort_order)
select b.id, i.id, w.ord
from public.products b
cross join (values
  ('budget-spreadsheet', 0),
  ('life-planner-spreadsheet', 1),
  ('adhd-daily-planner', 2),
  ('adhd-student-planner', 3),
  ('reading-tracker', 4),
  ('meal-planner', 5)
) as w(slug, ord)
join public.products i on i.slug = w.slug
where b.slug = 'planner-spreadsheet-bundle'
on conflict (bundle_id, item_product_id) do update set
  sort_order = excluded.sort_order;
