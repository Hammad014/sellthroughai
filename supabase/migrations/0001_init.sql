-- ============================================================
-- Aiselling — initial schema + Row Level Security
-- Single migration. Run via Supabase SQL Editor or `supabase db push`.
-- ============================================================

-- gen_random_uuid() is built in on Supabase (pgcrypto), but ensure it exists.
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Helper: is the current user an admin?
-- SECURITY DEFINER so it can read profiles WITHOUT tripping the
-- profiles RLS policies (which would otherwise recurse).
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- ============================================================
-- TABLES
-- ============================================================

-- profiles: one row per auth user. id == auth.uid().
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

-- products: the catalog.
create table public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  short_desc      text not null default '',
  long_desc       text,
  category        text not null,
  price_usd       numeric(10, 2) not null default 0,
  cover_image_url text,
  delivery_type   text not null default 'license'
                    check (delivery_type in ('license', 'gated')),
  ls_variant_id   text,
  status          text not null default 'draft'
                    check (status in ('draft', 'published')),
  featured        boolean not null default false,
  created_at      timestamptz not null default now()
);

create index products_status_idx   on public.products (status);
create index products_category_idx on public.products (category);
create index products_featured_idx on public.products (featured);

-- product_files: gated downloadable assets (private storage paths).
create table public.product_files (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  file_name    text not null,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index product_files_product_id_idx on public.product_files (product_id);

-- course_lessons: gated lesson content for mini-courses.
create table public.course_lessons (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  title       text not null,
  content_md  text,
  video_path  text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index course_lessons_product_id_idx on public.course_lessons (product_id);

-- orders: one per checkout. Lemon Squeezy fills ls_order_id later.
create table public.orders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete set null,
  email       text not null,
  ls_order_id text unique,
  total_usd   numeric(10, 2) not null default 0,
  status      text not null default 'pending',
  created_at  timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);

-- order_items: line items per order.
create table public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  price_usd  numeric(10, 2) not null default 0
);

create index order_items_order_id_idx   on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

-- entitlements: which products a user owns. One per (user, product).
create table public.entitlements (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  order_id   uuid references public.orders (id) on delete set null,
  granted_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index entitlements_user_id_idx on public.entitlements (user_id);

-- download_events: audit log of file downloads (written server-side).
create table public.download_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  file_id    uuid not null references public.product_files (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index download_events_user_id_idx on public.download_events (user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON FIRST SIGN-IN
-- Trigger on auth.users fires when the auth user is first created
-- (magic link or OAuth). SECURITY DEFINER so it can write profiles.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- Enable on every table, then add only the policies we want.
-- The service-role key bypasses RLS entirely (used by trusted
-- server code), so gated tables simply get NO client policies.
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.products        enable row level security;
alter table public.product_files   enable row level security;
alter table public.course_lessons  enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.entitlements    enable row level security;
alter table public.download_events enable row level security;

-- ---- profiles: users see/manage only their own row (admins see all) ----
create policy "profiles: read own or admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles: insert own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---- products: anyone can read PUBLISHED; admins read all + write ----
create policy "products: read published"
  on public.products for select
  to anon, authenticated
  using (status = 'published' or public.is_admin());

create policy "products: admin write"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- product_files: NO client policies → service-role only ----
-- (RLS enabled, zero policies = denied for anon/authenticated.)

-- ---- course_lessons: NO client policies → service-role only ----
-- (RLS enabled, zero policies = denied for anon/authenticated.)

-- ---- orders: users read their own; admins read all ----
create policy "orders: read own or admin"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---- order_items: readable if you own the parent order (or admin) ----
create policy "order_items: read own or admin"
  on public.order_items for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

-- ---- entitlements: users read their own; admins read all ----
create policy "entitlements: read own or admin"
  on public.entitlements for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---- download_events: users read their own; admins read all ----
-- Inserts are performed server-side with the service-role key.
create policy "download_events: read own or admin"
  on public.download_events for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());
