# Selling on Etsy

Every product has an **Etsy edition**: downloadable files that work on their
own (no website account needed), listing photos, and the listing text ready to
paste. They're generated from the same content as the website, so when you
update a product, rebuild and re-upload.

## What's in each product folder

```
scripts/etsy/out/<product>/
  files/        what buyers download (Etsy allows 5 files, 20 MB each; all fit)
  images/       listing photos, 2400×1800 JPG. 01.jpg is the thumbnail
  LISTING.txt   title, suggested price, 13 tags, settings and description
```

| Product | Buyers get | Suggested Etsy price |
|---|---|---|
| 5 prompt packs | Designed PDF (every prompt + worked example) + copy-paste .txt | $14.99 each |
| Prompt Power Bundle | All 5 prompt-pack PDFs | $49.99 |
| ChatGPT & Claude for Total Beginners | PDF course (7 lessons) | $12.99 |
| Prompt Engineering Fundamentals | PDF course (7 lessons) | $14.99 |
| The AI-at-Work Playbook | PDF guide (8 chapters) | $9.99 |
| Build Your First AI Agent | Agent files .zip + 9-lesson PDF | $24.99 |
| AI Automation Starter Kit | n8n workflows .zip + setup guide PDF | $24.99 |
| AI Automation Bundle | Kit + course files and PDFs | $39.99 |
| Clarity / Focus planners | 3 zips (2027 Mon, 2027 Sun, undated; light + dark) + setup guide | $12.99 / $11.99 |
| Budget Planner | 4 PDFs + setup guide | $9.99 |
| New Year Planner Bundle | All editions of all 3 planners (3 zips) + setup guide | $24.99 |

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
   for planners, *Books, Movies & Music → Books → Guides & How Tos* for the
   guides and prompt packs. Pick what Etsy suggests if it fits better.
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
npm run planners:build      # planner PDFs + store images
npm run automation:build    # n8n kit + course files
npm run etsy:build          # all Etsy editions, from the live database
npm run etsy:build -- budget-digital-planner   # just one
```

`etsy:build` reads the products from Supabase (`.env.local`). You can also
point it at a JSON snapshot with `--catalog snapshot.json` (format in
`scripts/etsy/catalog.mjs`).

Listing titles, tags and prices live in `scripts/etsy/listings.mjs`; the script
refuses to build if a title is over 140 characters or a tag over 20.
