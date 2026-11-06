-- ============================================================
-- Makeready — bundle product: "The New Year Planner Bundle"
--
-- Clarity + Focus + Budget planners at one price. Buying it grants all
-- three (see the webhook's bundle handling).
--
-- Run AFTER seed_clarity_planner.sql, seed_focus_planner.sql,
-- seed_budget_planner.sql and 0007_bundles.sql. Seeded as a DRAFT.
-- UPSERT: safe to re-paste.
-- ============================================================

insert into public.products
  (slug, title, short_desc, long_desc, category, price_usd,
   delivery_type, status, featured)
values
  (
    'new-year-planner-bundle',
    'The New Year Planner Bundle',
    $d$All three hyperlinked digital planners: Clarity (life & goals), Focus (ADHD-friendly days) and Budget (money). 2027 + undated editions, light and dark. Save $16.$d$,
    $d$## Plan your whole year: life, focus and money

Three planners that cover everything, each fully hyperlinked for iPad and Android tablets:

- **Clarity Digital Planner**: the calm all-rounder. Year, vision & goals, monthly calendars, weekly spreads, 365 daily pages, habit trackers and project planners.
- **Focus Planner (ADHD-friendly)**: just 3 things a day, visual time blocks, monthly brain dumps, task breakdowns, routines and a dopamine menu.
- **Budget Planner**: monthly budgets, bill tracker, spending log, no-spend challenges, savings goals, debt payoff, subscriptions and net worth.

Use Clarity or Focus for your days and Budget for your money, or try them all and keep the one that clicks.

## What you get

16 PDF files: every edition of each planner (2027 and undated, light and dark), plus a setup guide for each. Works with GoodNotes, Notability, Noteshelf, Xodo, Samsung Notes and any PDF app with links.

## How it works

Buy once and all three unlock in your library straight away. Lifetime access and free updates on every planner.

Lifetime access · free updates · 14-day no-questions refund.$d$,
    'bundles',
    35.00,
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
  ('clarity-digital-planner', 0),
  ('focus-adhd-digital-planner', 1),
  ('budget-digital-planner', 2)
) as w(slug, ord)
join public.products i on i.slug = w.slug
where b.slug = 'new-year-planner-bundle'
on conflict (bundle_id, item_product_id) do update set
  sort_order = excluded.sort_order;
