-- ============================================================
-- Aiselling — lock down the profiles.role column
--
-- WHY: the "profiles: update own" / "profiles: insert own" RLS policies let a
-- user write their OWN row, but place no restriction on WHICH columns. Supabase
-- grants `authenticated` UPDATE on every column, so a regular user could run
--   update profiles set role = 'admin' where id = auth.uid()
-- and self-promote — passing both is_admin() (RLS) and the app's isAdmin().
--
-- This migration adds a BEFORE INSERT/UPDATE trigger that prevents any end-user
-- session from setting or changing `role`. Admins are still made the intended
-- ways:
--   * ADMIN_EMAILS allowlist (no DB role needed), or
--   * promoting via the Supabase SQL editor / service-role (auth.uid() is null
--     there, so the guard is skipped).
-- Run after 0001_init.sql. Idempotent.
-- ============================================================

create or replace function public.profiles_guard_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only constrain changes coming from a logged-in END USER. Service-role and
  -- SQL-editor sessions have a null auth.uid(); existing admins pass is_admin().
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      -- Ignore any attempt to self-assign a role on first insert.
      new.role := 'user';
    elsif tg_op = 'UPDATE' and new.role is distinct from old.role then
      raise exception 'Changing your own role is not allowed.'
        using errcode = '42501'; -- insufficient_privilege
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role
  before insert or update on public.profiles
  for each row execute function public.profiles_guard_role();

-- Defense in depth: even if the trigger were dropped, take column-level UPDATE
-- on `role` away from end users. They may still update editable columns.
revoke update (role) on public.profiles from authenticated;
