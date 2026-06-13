-- ============================================================
-- Aiselling — product bundles
--
-- A "bundle" is a product (category = 'bundles') that, when purchased, grants
-- the buyer entitlements to a SET of other products. Membership lives in
-- product_bundle_items. The webhook expands a bundle purchase into one
-- entitlement per included product (see api/webhooks/lemonsqueezy).
--
-- Run AFTER 0001_init.sql. Idempotent.
-- ============================================================

create table if not exists public.product_bundle_items (
  id              uuid primary key default gen_random_uuid(),
  bundle_id       uuid not null references public.products (id) on delete cascade,
  item_product_id uuid not null references public.products (id) on delete cascade,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  unique (bundle_id, item_product_id)
);

create index if not exists product_bundle_items_bundle_idx
  on public.product_bundle_items (bundle_id);

-- Membership isn't sensitive (it's just "which products are in this bundle"),
-- so allow reads — the public bundle page lists its contents. Writes happen
-- server-side with the service-role key, which bypasses RLS.
alter table public.product_bundle_items enable row level security;

drop policy if exists "bundle_items: read all" on public.product_bundle_items;
create policy "bundle_items: read all"
  on public.product_bundle_items for select
  to anon, authenticated
  using (true);
