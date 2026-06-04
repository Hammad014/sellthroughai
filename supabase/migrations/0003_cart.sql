-- ============================================================
-- Aiselling — persistent cart
-- Additive only. Run after 0002_payments.sql.
-- Guests keep their cart in localStorage; on login it merges here.
-- ============================================================

create table public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index cart_items_user_id_idx on public.cart_items (user_id);

alter table public.cart_items enable row level security;

-- Users manage only their own cart.
create policy "cart_items: select own"
  on public.cart_items for select
  to authenticated
  using (user_id = auth.uid());

create policy "cart_items: insert own"
  on public.cart_items for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "cart_items: delete own"
  on public.cart_items for delete
  to authenticated
  using (user_id = auth.uid());
