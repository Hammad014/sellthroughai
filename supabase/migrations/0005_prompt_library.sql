-- ============================================================
-- Aiselling — in-app prompt library (delivery_type = 'prompts')
--
-- Adds a third delivery type. A 'prompts' product is a curated set of prompts
-- that buyers browse and copy inside their dashboard (no file download). Each
-- prompt carries the wrapper that makes it valuable: when to use it, the
-- parameterized body, a worked example, and a suggested model.
--
-- Run after 0001..0004. Idempotent.
-- ============================================================

-- 1. Allow 'prompts' as a delivery type.
alter table public.products
  drop constraint if exists products_delivery_type_check;
alter table public.products
  add constraint products_delivery_type_check
  check (delivery_type in ('license', 'gated', 'prompts'));

-- 2. The prompts themselves.
create table if not exists public.product_prompts (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products (id) on delete cascade,
  title          text not null,
  description    text,          -- when / why to use it
  prompt_body    text not null, -- the prompt, with [VARIABLES] to fill in
  example_input  text,          -- what the buyer types into the [VARIABLES]
  example_output text,          -- a short sample of what comes back
  model          text,          -- suggested model(s), e.g. "Claude / GPT-4o"
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists product_prompts_product_id_idx
  on public.product_prompts (product_id);

-- 3. RLS on, NO client policies → service-role only (same pattern as
--    product_files / course_lessons). Buyers read these server-side in the
--    dashboard after an entitlement check; the catalog never exposes them.
alter table public.product_prompts enable row level security;
