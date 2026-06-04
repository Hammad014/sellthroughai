# Aiselling

A storefront for selling digital AI products — prompt packs, Notion templates,
AI mini-courses, automation kits and ebooks.

**Stack:** Next.js 16 (App Router, TypeScript, strict) · Tailwind v4 ·
shadcn/ui · Supabase (Postgres, Auth, Storage) · next-themes.

> **Setup & deployment:** see **[SETUP.md](./SETUP.md)** for exact step-by-step
> instructions (create the Supabase project, run the migration, set env vars,
> create the storage buckets, make an admin, deploy to Vercel).

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in Supabase values
npm run dev
```

## What's here

- **Auth** — Supabase magic link + Google OAuth, `/login`, route protection via
  `src/proxy.ts` for `/dashboard/*` and `/admin/*`, profiles auto-created on
  first sign-in.
- **Catalog** — `/products` (category filter + search) and `/products/[slug]`
  detail, reading from the `products` table (RLS-scoped to published rows).
- **Account** — `/dashboard` library (entitlements; empty until checkout).
- **Admin** — `/admin` gated by `profiles.role = 'admin'` (server-side):
  product CRUD, cover image + gated file uploads, orders table.
- **Static pages** — `/about`, `/faq`, `/terms`, `/privacy`, `/refund-policy`
  (editable placeholder copy).
- **Design** — OKLCH design tokens from `design-reference/` translated into the
  Tailwind theme + shadcn semantic variables; light/dark with dark as default.

## Project layout

```
src/
  app/
    (site)/            # public + account shell (nav + footer)
      page.tsx         # landing
      products/        # catalog + [slug] detail
      dashboard/       # user library (protected)
      about|faq|terms|privacy|refund-policy/
    admin/             # admin shell (role-gated) + product CRUD + orders
    auth/              # callback / confirm / signout route handlers
    login/
  components/          # ui (shadcn), site nav/footer, admin, product card…
  lib/
    supabase/          # browser / server / service-role clients + types
    auth.ts            # getUser / getProfile / requireUser / requireAdmin
    products.ts        # public catalog queries
    admin/             # service-role admin queries
    catalog.ts         # category metadata + price formatting
supabase/
  migrations/0001_init.sql
  seed.sql
design-reference/      # original Claude Design handoff (visual source of truth)
```

## Payments & delivery (Lemon Squeezy)

Checkout, fulfilment, and gated delivery are live — see **[PAYMENTS.md](./PAYMENTS.md)**
for setup and end-to-end testing.

- **Checkout:** the `Buy` button opens the Lemon Squeezy overlay
  (`src/components/buy-button.tsx` → `startCheckout` action), passing buyer
  email + `user_id` + `product_id` as checkout custom data.
- **Webhook:** `/api/webhooks/lemonsqueezy` verifies the `X-Signature` HMAC,
  handles `order_created` idempotently, creates a guest account if needed, and
  grants entitlements.
- **Delivery:** `license` products show the Lemon Squeezy receipt/license;
  `gated` products open the course player (`/dashboard/courses/[slug]`) with
  `/api/download` serving files via 60-second Supabase signed URLs.
