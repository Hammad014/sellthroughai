-- ============================================================
-- Aiselling — bundle product: "The Prompt Power Bundle"
--
-- A bundle (category='bundles'): buying it grants entitlements to all 5 prompt
-- libraries (see api/webhooks/lemonsqueezy — it expands bundle purchases). The
-- bundle row itself is never added to a buyer's library; the 5 packs are.
--
-- Apostrophes: long_desc is an e'...' literal, so double them (don''t).
--
-- Run AFTER:
--   * 0006_seed_upsert_keys.sql and 0007_bundles.sql (migrations), and
--   * the 5 prompt-pack seeds (so the items exist to link).
-- Idempotent: re-pasting updates the bundle + its contents, never duplicates.
-- ============================================================

insert into public.products
  (slug, title, short_desc, long_desc, category, price_usd,
   delivery_type, status, featured)
values
  (
    'prompt-power-bundle',
    'The Prompt Power Bundle',
    'All 5 prompt libraries — 50 expert prompts — at one discounted price. The complete toolkit for content, outreach, marketing and client work.',
    e'## The whole arsenal, one price\n\nEvery prompt library we make, bundled together — for less than the price of three bought on their own. Five complete, copy-and-go systems covering the work that actually moves a business.\n\n## What''s inside\n\n- **The Founder''s Content Engine** — turn one idea into a week of content\n- **The Cold Outreach Engine** — research through to booked calls\n- **The AI Chief of Staff** — inbox, meetings, planning, decisions\n- **The Marketing & Ads Engine** — ads, landing pages, email funnels\n- **The Freelancer Client Engine** — proposals, pricing, client comms\n\nThat''s 50 expert prompts, each with a worked example, all in your dashboard the moment you buy.\n\n## How it works\n\nBuy once and all five libraries unlock in your account — no codes, no waiting. Lifetime access and free updates on every one.\n\nLifetime access · free updates · 14-day no-questions refund.',
    'bundles',
    99.00,
    'license',
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

-- Link the 5 prompt packs. Inner join means any pack not yet seeded is simply
-- skipped; re-run this file after adding it to include it.
insert into public.product_bundle_items (bundle_id, item_product_id, sort_order)
select b.id, i.id, w.ord
from public.products b
cross join (values
  ('founder-content-engine', 0),
  ('cold-outreach-engine', 1),
  ('ai-chief-of-staff', 2),
  ('marketing-ads-engine', 3),
  ('freelancer-client-engine', 4)
) as w(slug, ord)
join public.products i on i.slug = w.slug
where b.slug = 'prompt-power-bundle'
on conflict (bundle_id, item_product_id) do update set
  sort_order = excluded.sort_order;
