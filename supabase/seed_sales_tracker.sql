-- ============================================================
-- Makeready — spreadsheet product: "Small Business Sales Tracker"
--
-- A 'gated' template (delivery_type='gated', category='templates'). Buyers
-- get one .xlsx that works in Google Sheets and Excel, plus printable PDF
-- pages in US Letter and A4 (product_files, private bucket), plus a 3-step guide (course_lessons) at
-- /dashboard/courses/small-business-sales-tracker.
--
-- The file, cover and gallery images are generated from code and uploaded by
--   npm run sheets:build && npm run sheets:test
--   node scripts/sheets/publish.mjs shop
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
    'small-business-sales-tracker',
    'Small Business Sales Tracker: Etsy Fees, Profit & Expenses',
    $d$Know what your shop really makes: every sale's revenue, fees (estimated for Etsy), cost of goods and profit; products ranked by profit; expenses; and a month-by-month profit and loss. Google Sheets and Excel.$d$,
    $d$## Know what your shop really makes

Sales aren't profit. Once fees, materials and ads come off, the number that matters is often very different. This tracker works it out for every sale, every product and every month.

## What's inside

- **Dashboard**: revenue, fees, costs, expenses and profit for the year and for every month, your best products and revenue by platform
- **Orders**: one row per sale, with the price filled in from your products, fees estimated for Etsy (or typed in), cost of goods and profit
- **Products**: price, cost to make, margin, units sold, revenue, fees and profit per product
- **Expenses**: ads, postage, packaging, software, equipment and anything else

## Good to know

Etsy fee estimates are a guide (6.5% transaction + 3% payment processing + $0.45 per order by default); change the rates to match your country. This is a sales tracker, not accounting or tax advice.

## Works with

**Google Sheets** (free, on any computer, and on your phone with the Google Sheets app) and **Microsoft Excel** (Microsoft 365, Excel 2016 or newer, Excel for Mac, and the free Excel on the web).

## The details

- Printable pages to print and write on (US Letter and A4 PDFs)
- Etsy, website, markets, wholesale and more
- Room for 2,000 sales, 100 products and 1,000 expenses
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
    $c$Download **Makeready-Sales-Tracker.xlsx** from your library, then pick your app.

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
    'Set it up in 5 minutes',
    $c$## 1. Dashboard

Type the **year** and your shop name. Check the Etsy fee rates match your country.

## 2. Products

Add each product with its price and what one costs you to make (materials and packaging).$c$
  ),
  (
    2,
    'As you sell',
    $c$## Orders

One row per product sold: date, product, quantity and platform. Leave **Price** blank to use the product's price. For Etsy sales the fees are estimated; know the exact fee? Type it in **Fees (actual)**.

## Expenses

Anything you spend on the business that isn't a product's own materials: ads, postage, software, equipment.

## Dashboard

Profit for every month and your best products, worked out for you.

## If something looks wrong

- **A number stopped updating**: you may have typed over a white (formula) cell. Press Undo, or copy the same cell from the row above.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'small-business-sales-tracker'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
