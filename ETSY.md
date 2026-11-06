# Selling on Etsy

The Etsy shop has one niche: **practical planners that do the work for the
buyer**: spreadsheets for Google Sheets and Excel, plus the web-app planner.
The GoodNotes PDF planners, prompt packs, AI guides, AI course and automation
kit are sold on the website only.

Every Etsy product has an **Etsy edition**: downloadable files that work on
their own (no website account needed), listing photos, and the listing text
ready to paste. They're generated from the same content as the website, so
when you update a product, rebuild and re-upload.

## What's in each product folder

```
scripts/etsy/out/<product>/
  files/        what buyers download (Etsy allows 5 files, 20 MB each; all fit)
  images/       listing photos, 2400×1800 JPG. 01.jpg is the thumbnail
  LISTING.txt   title, suggested price, 13 tags, settings and description
```

| Product | Buyers get | Suggested Etsy price |
|---|---|---|
| Budget Spreadsheet | .xlsx for Google Sheets + Excel, printable pages (Letter + A4), Start Here PDF | $11.99 |
| Life Planner Spreadsheet | .xlsx for Google Sheets + Excel, printable pages (Letter + A4), Start Here PDF | $11.99 |
| ADHD Daily Planner | .xlsx for Google Sheets + Excel, printable pages (Letter + A4), Start Here PDF | $9.99 |
| ADHD Student Planner | .xlsx for Google Sheets + Excel, printable pages (Letter + A4), Start Here PDF | $9.99 |
| Reading Tracker | .xlsx for Google Sheets + Excel, printable pages (Letter + A4), Start Here PDF | $8.99 |
| Meal Planner | .xlsx for Google Sheets + Excel, printable pages (Letter + A4), Start Here PDF | $8.99 |
| Cleaning Schedule | .xlsx for Google Sheets + Excel, printable pages (Letter + A4), Start Here PDF | $7.99 |
| Workout & Weight Tracker | .xlsx for Google Sheets + Excel, printable pages (Letter + A4), Start Here PDF | $8.99 |
| Pregnancy & Baby Tracker | .xlsx for Google Sheets + Excel, printable pages (Letter + A4), Start Here PDF | $9.99 |
| Wedding Planner & Budget | .xlsx for Google Sheets + Excel, printable pages (Letter + A4), Start Here PDF | $12.99 |
| Small Business Sales Tracker | .xlsx for Google Sheets + Excel, printable pages (Letter + A4), Start Here PDF | $12.99 |
| Planner Spreadsheet Bundle | All 6 spreadsheets in one zip, all their printables in another, + Start Here PDF | $29.99 |
| Life Planner (web app) | One HTML file that opens in the browser + Start Here PDF. Computers only | $14.99 |

List the spreadsheets first: the research (`reports/`, not in git) found far
fewer competing listings per search for spreadsheets than for PDF planners.

Etsy prices are lower than the website's because Etsy shoppers compare a lot of
similar listings. Change them to suit you.

## Listing a product (about 10 minutes each)

1. Etsy **Shop Manager → Listings → Add a listing**.
2. **Photos**: upload `images/01.jpg` … in order. 01 is the thumbnail.
3. **Title, description, tags, price**: copy from `LISTING.txt`. Add the tags
   one at a time.
4. **About this listing**: *I did* · *A finished product* · *2020 – 2026*.
5. **Type**: *Digital files*. Upload everything in `files/`.
6. **Category**: e.g. *Paper & Party Supplies → Paper → Calendars & Planners*
   for the planners and spreadsheets. Pick what Etsy suggests if it fits
   better.
7. Publish. Etsy charges $0.20 per listing (renewed every 4 months or when it
   sells) plus a 6.5% transaction fee and payment processing.

## Etsy rules worth knowing

- **AI disclosure.** Etsy asks sellers to say when AI tools were used to create
  an item. Every `LISTING.txt` description already ends with:
  *"Some content was created with the help of AI tools and reviewed by us."*
  Keep that line.
- **Keep buyers on Etsy.** The Etsy files never mention the website or the
  support email. Support happens through Etsy messages.
- **Digital items and refunds.** The descriptions say digital items can't be
  returned and invite buyers to message you if something's wrong. Being helpful
  here protects your reviews.
- **Only list what you own.** Everything here is your own content; don't add
  third-party images or fonts to the listings.

## Rebuilding the files

Run these after changing a product (needs Playwright + Chromium:
`npx playwright install chromium`):

```bash
npm run webapps:build       # interactive Life Planner (HTML) + store images
npm run sheets:build        # spreadsheets (.xlsx) + printable PDFs + store images
npm run sheets:test         # recalculates them in LibreOffice and checks every number
npm run etsy:build          # all Etsy editions, from the live database
npm run etsy:build -- budget-digital-planner   # just one
```

`etsy:build` reads the products from Supabase (`.env.local`). You can also
point it at a JSON snapshot with `--catalog snapshot.json` (format in
`scripts/etsy/catalog.mjs`).

Listing titles, tags and prices live in `scripts/etsy/listings.mjs`; the script
refuses to build if a title is over 140 characters or a tag over 20.

## Spreadsheets: the one-click Google Sheets link (recommended)

Spreadsheet buyers can already upload the .xlsx to Google Drive, but a
"Make a copy" link is smoother: one click and they have their own copy. To
set it up once per spreadsheet, follow the steps at the top of
`scripts/sheets/links.mjs`, paste the link there and rebuild with
`npm run etsy:build`. The Start Here PDF then opens with a clickable
"Make your own copy" step.
