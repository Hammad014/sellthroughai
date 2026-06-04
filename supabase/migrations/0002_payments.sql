-- ============================================================
-- Aiselling — payments add-on (Lemon Squeezy)
-- Additive only; existing schema is unchanged. Run after 0001_init.sql.
-- ============================================================

-- Lemon Squeezy order receipt URL (download + license keys live here for
-- "license" delivery-type products). Nullable, populated by the webhook.
alter table public.orders
  add column if not exists receipt_url text;
