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

## Payments seam (later)

Payments are intentionally **not** wired up. The `Buy` button is a no-op
(`src/components/buy-button.tsx`); the schema (`orders`, `order_items`,
`entitlements`, `download_events`, `products.ls_variant_id`) and commented
`LEMONSQUEEZY_*` env vars are ready for a Lemon Squeezy integration in a
follow-up session.
