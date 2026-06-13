# Aiselling — Updates & Apply Guide

Everything built/changed in this round of work: a security fix, the email/password
auth split, the in-app **prompt library** feature, site content, and **8 product
seed files** (5 prompt packs, 2 courses, 1 guide). Plus exactly how to apply it all
in Supabase and answers to the "will re-pasting duplicate?" question.

---

## 1. ⚠️ Apply order (do this in the Supabase SQL Editor)

Run these **in order**. Migrations first, then seeds. Everything is idempotent —
safe to run more than once.

### Migrations (schema)
| Order | File | What it does |
|---|---|---|
| 1 | `supabase/migrations/0004_lock_profile_role.sql` | **Security fix** — stops users self-promoting to admin |
| 2 | `supabase/migrations/0005_prompt_library.sql` | Adds `prompts` delivery type + `product_prompts` table |
| 3 | `supabase/migrations/0006_seed_upsert_keys.sql` | Unique keys so seeds can UPSERT (re-paste = update, never duplicate) |
| 4 | `supabase/migrations/0007_bundles.sql` | `product_bundle_items` table — powers bundle products |

> Already ran 0004/0005? Just run **0006** and **0007** now. 0006 is required
> before re-pasting any updated seed; 0007 is required before the bundle seed.

### Seeds (products) — run after the migrations above
| File | Product | Type | Price |
|---|---|---|---|
| `supabase/seed_founder_content_engine.sql` | The Founder's Content Engine | Prompts | $39 |
| `supabase/seed_cold_outreach_engine.sql` | The Cold Outreach Engine | Prompts | $49 |
| `supabase/seed_ai_chief_of_staff.sql` | The AI Chief of Staff | Prompts | $39 |
| `supabase/seed_marketing_ads_engine.sql` | The Marketing & Ads Engine | Prompts | $49 |
| `supabase/seed_freelancer_client_engine.sql` | The Freelancer Client Engine | Prompts | $39 |
| `supabase/seed_beginners_course.sql` | ChatGPT & Claude for Total Beginners | Course | $29 |
| `supabase/seed_prompt_engineering_course.sql` | Prompt Engineering Fundamentals | Course | $39 |
| `supabase/seed_ai_at_work_playbook.sql` | The AI-at-Work Playbook | Guide | $19 |
| `supabase/seed_prompt_bundle.sql` | The Prompt Power Bundle (all 5 packs) | Bundle | $99 |

> **Run `seed_prompt_bundle.sql` last** — it links the 5 prompt packs, so they
> must already be seeded (and migration 0007 applied).

---

## 2. "Will re-pasting duplicate?" — No. (And now it also updates.)

**Short answer: re-pasting never creates duplicates.**

- **Old behaviour (what you already pasted):** seeds used `on conflict (slug) do nothing`
  + a `where not exists` check. Re-pasting = no duplicates, **but also no updates** —
  it skipped rows that already existed. That's why your beginners course kept its old
  (robotic) text even though the file changed.
- **New behaviour (after running migration 0006 + re-pasting):** seeds now **UPSERT**.
  Re-pasting a file:
  - never duplicates, and
  - **updates** the product copy and every prompt/lesson to match the file.

So to get the **human-tone beginners course** into your database: run `0006`, then
**re-paste `seed_beginners_course.sql`**. It'll overwrite the old lessons in place.

### What re-pasting updates vs. preserves
On a product that already exists, re-pasting **updates**: title, short/long description,
category, price, delivery type, and all prompts/lessons.
It **preserves** (never touched by seeds): `status` (published/draft), `featured`,
`ls_variant_id` (your Lemon Squeezy IDs), and `cover_image_url` (uploaded covers).
→ Safe to re-paste even after you've set variant IDs or uploaded cover images in admin.

---

## 3. Files created / changed

### Migrations — created
- `supabase/migrations/0004_lock_profile_role.sql` — trigger + column revoke; only
  service-role / SQL-editor sessions (and existing admins) can change `profiles.role`.
- `supabase/migrations/0005_prompt_library.sql` — `product_prompts` table (RLS on,
  service-role only) + `prompts` delivery type.
- `supabase/migrations/0006_seed_upsert_keys.sql` — unique indexes on
  `(product_id, title)` for `course_lessons` and `product_prompts`.
- `supabase/migrations/0007_bundles.sql` — `product_bundle_items` table (+ read
  policy) for bundle products.

### Product seeds — created (all now UPSERT)
- `supabase/seed_founder_content_engine.sql` — 10 prompts
- `supabase/seed_cold_outreach_engine.sql` — 10 prompts
- `supabase/seed_ai_chief_of_staff.sql` — 10 prompts
- `supabase/seed_marketing_ads_engine.sql` — 10 prompts
- `supabase/seed_freelancer_client_engine.sql` — 10 prompts
- `supabase/seed_beginners_course.sql` — 7 lessons (human-tone rewrite)
- `supabase/seed_prompt_engineering_course.sql` — 7 lessons
- `supabase/seed_ai_at_work_playbook.sql` — 8 chapters
- `supabase/seed_prompt_bundle.sql` — bundle of all 5 prompt packs

### App code — bundles & admin management (this round)
- `src/app/api/download/route.ts` — admins can download any gated file to verify.
- `src/app/api/webhooks/lemonsqueezy/route.ts` — bundle purchases grant every
  included product.
- `src/app/admin/products/[id]/page.tsx` — edit prompts/lessons in place, file
  download links, "View live page", and a bundle-contents manager.
- `src/app/admin/products/actions.ts` — `updatePrompt`, `updateLesson`,
  `addBundleItem`, `removeBundleItem`.
- `src/app/(site)/products/[slug]/page.tsx` — "Everything included" + savings for
  bundles.
- `src/lib/products.ts`, `src/lib/admin/products.ts` — bundle read helpers.
- `src/lib/catalog.ts` — new `bundles` category.
- `src/lib/supabase/types.ts` — `product_bundle_items` types.

### App code — created
- `src/app/(site)/dashboard/prompts/[slug]/page.tsx` — buyer's in-app prompt reader
  (ownership-gated).
- `src/components/prompts/prompt-item.tsx` — client component: prompt card with
  one-click copy + collapsible worked example.
- `src/components/admin/admin-login.tsx` — separate email/password admin sign-in.

### App code — updated
- `src/lib/auth.ts` — `isAdmin()` (DB role **or** `ADMIN_EMAILS` allowlist).
- `src/proxy.ts` — guards `/dashboard`; `/admin` role check moved server-side.
- `src/components/auth/login-form.tsx` — email/password sign-in + sign-up (replaced
  magic link / Google).
- `src/components/site/site-nav.tsx`, `src/components/ui/dropdown-menu.tsx`,
  `src/app/admin/layout.tsx`, `src/app/auth/callback/route.ts` — auth wiring/cleanup.
- `src/lib/supabase/types.ts` — `product_prompts` types + `prompts` delivery type.
- `src/lib/entitlements.ts`, `src/lib/admin/products.ts` — prompt read helpers.
- `src/app/admin/products/actions.ts` — `addPrompt` / `deletePrompt` server actions;
  CSV import accepts `prompts`.
- `src/app/admin/products/[id]/page.tsx` — prompt-library editor on the edit screen.
- `src/components/admin/product-form.tsx` — `prompts` delivery option + markdown hint.
- `src/app/(site)/dashboard/page.tsx` — routes prompts/guides/courses; labels guides.
- `src/app/(site)/products/[slug]/page.tsx` — renders `long_desc` as markdown;
  delivery-aware benefits.
- `src/app/(site)/page.tsx` — homepage explainer sections (what/who/how/why).
- `src/app/(site)/about/page.tsx`, `src/app/(site)/faq/page.tsx` — enriched copy;
  fixed stale "magic link/Google" answer.
- `.env.example` — documented `ADMIN_EMAILS`.

---

## 3b. Admin product management (what you can do at `/admin/products`)

Open any product → **Edit** to get the full toolkit:

- **View** the live customer page (top-right "View live page").
- **Edit everything**: all product fields, plus — for the first time — edit
  individual **prompts** and **lessons** in place (click one to expand its
  editor). Previously these could only be added/deleted.
- **Upload**: cover image, gated files, lesson videos.
- **Download**: every uploaded gated file (the new "Download" link) so you can
  verify what buyers receive. Admin downloads aren't counted as sales.
- **Add / remove**: prompts, lessons, files, and bundle items.
- **Publish / unpublish** from the list; **delete** in the danger zone.

## 3c. Bundles

A bundle is a product with **category = `bundles`** plus rows in
`product_bundle_items`. When someone buys it, the webhook grants entitlements to
**every included product** (not the bundle row), so all of them appear in the
buyer's library. The bundle's sales page shows an "Everything included" grid and
the total savings.

To make your own bundle in admin: create a product, set its category to
**Bundles**, save, then use the **Bundle contents** section to add products. The
first one (`The Prompt Power Bundle`) is seeded for you.

## 4. Still on you (not code)

1. **Apply the SQL above** in the Supabase SQL Editor (the project isn't CLI-linked).
2. **Set `ADMIN_EMAILS`** in your env so you can reach `/admin`.
3. **Add a Lemon Squeezy `ls_variant_id`** per product in admin before it can take
   payment — the seeds leave it blank, and re-pasting never overwrites it.

### Preview a product before payments are wired
Grant yourself a product, then open `/dashboard`:
```sql
insert into public.entitlements (user_id, product_id)
select u.id, p.id
from auth.users u, public.products p
where u.email = 'you@example.com'           -- your email
  and p.slug  = 'prompt-engineering-fundamentals'  -- any product slug
on conflict do nothing;
```

---

## 5. Notes

- **Human tone:** all product copy is written in a natural, conversational voice.
  (The only product that ever read robotic was the beginners course — fixed.)
- **Seed apostrophe rule (if you edit a seed):** inside `$c$…$c$` / `$p$…$p$`
  dollar-quoted blocks use normal apostrophes (`don't`); inside plain `'…'` and
  `e'…'` literals, double them (`don''t`).
- **Delivery types:** `license` (downloadable file), `gated` (course/guide read
  in-app), `prompts` (in-app copy-to-use library).
