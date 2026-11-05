-- ============================================================
-- Makeready — spreadsheet product: "Meal Planner"
--
-- A 'gated' template (delivery_type='gated', category='templates'). Buyers
-- get one .xlsx (product_files, private bucket) that works in Google Sheets
-- and Excel, plus a 3-step guide (course_lessons) at
-- /dashboard/courses/meal-planner.
--
-- The file, cover and gallery images are generated from code and uploaded by
--   npm run sheets:build && npm run sheets:test
--   node scripts/sheets/publish.mjs meal
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
    'meal-planner',
    'Meal Planner: Weekly Plan & Automatic Grocery List',
    $d$Plan your week's meals and the grocery list writes itself: every ingredient you need, added up across recipes and sorted by supermarket aisle. 8 starter recipes included. Google Sheets and Excel.$d$,
    $d$## Plan the week. The shopping list writes itself.

The slow part of meal planning isn't choosing dinners: it's going through every recipe to write the shopping list. Here you pick a recipe for each meal, and the **Grocery List** builds itself: every ingredient, added up across recipes (two recipes with onions = one line for onions) and sorted by aisle, so you walk the shop once.

## What's inside

- **Week plan**: breakfast, lunch, dinner and a snack for every day. Pick recipes from a dropdown, or type anything ("Leftovers", "Eating out")
- **Grocery list**: built from the plan, with quantities added up and sorted by aisle (fruit & veg, meat & fish, dairy, bakery, pantry, frozen…), a *Got it* tick for each item, and an *Also buy* list for everything else
- **Recipes**: your recipe list with meal, time, servings and a link, and how many times each is planned this week
- **Ingredients**: what each recipe needs, with quantity, unit and aisle
- **8 starter recipes**, from overnight oats to salmon, rice and greens, so it works the moment you open it

## Works with

**Google Sheets** (free, on any computer, and on your phone with the Google Sheets app, handy in the shop) and **Microsoft Excel** (Microsoft 365, Excel 2016 or newer, Excel for Mac, and the free Excel on the web).

## The details

- Room for 100 recipes and 600 ingredient lines
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
    $c$Download **Makeready-Meal-Planner.xlsx** from your library, then pick your app.

## Google Sheets (free)

1. Go to **drive.google.com** and sign in.
2. Click **New → File upload** and choose the file.
3. Double-click it in Drive, then **File → Save as Google Sheets**.

Dropdowns, formulas and colours all carry over. Use the new Google Sheets version from now on. It also opens in the **Google Sheets app** on your phone.

## Microsoft Excel

Double-click the file. It works in Microsoft 365, Excel 2016 or newer, Excel for Mac and the free **Excel on the web**. If Excel shows *Enable Editing*, click it.

## Apple Numbers

Numbers isn't supported: some formulas don't carry over. Use Google Sheets instead (free).$c$
  ),
  (
    1,
    'Plan your first week',
    $c$## 1. Week Plan

Pick a recipe for each meal from the dropdown. You can also just type something that isn't a recipe, like *Leftovers* or *Eating out*: it simply adds nothing to the list.

## 2. Grocery List

Open it: everything you need is already there, added up and sorted by aisle. Already have something at home? Tick **Got it** before you go. Add anything else under **Also buy**.

## 3. Shop

Open the Google Sheets app on your phone in the shop and tick items as they go in the trolley.$c$
  ),
  (
    2,
    'Add your own recipes',
    $c$## Recipes

Add the recipe's name, which meal it's for, the time and how many it serves.

## Ingredients

Add one row per ingredient: pick the recipe from the dropdown, then the ingredient, quantity (for one batch), unit and aisle.

## Tip

Use the same spelling and unit for the same item in every recipe (always *Onion*, *piece*). Then it's added up into one line on the grocery list.

## Each week

Clear the Week Plan and the *Got it* ticks, then plan again. The ticks belong to rows, not items, so clear them whenever you change the plan.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'meal-planner'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
