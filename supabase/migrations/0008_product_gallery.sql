-- ============================================================
-- Promptory — product image gallery
--
-- products.gallery: ordered list of public preview images shown on the sales
-- page, as JSON objects { "url": text, "alt": text }. Images live in the
-- PUBLIC product-covers bucket (same as cover_image_url). Defaults to an empty
-- list, so existing products and seeds are unaffected.
-- Re-runnable.
-- ============================================================

alter table public.products
  add column if not exists gallery jsonb not null default '[]'::jsonb;

alter table public.products
  drop constraint if exists products_gallery_is_array;
alter table public.products
  add constraint products_gallery_is_array
  check (jsonb_typeof(gallery) = 'array');
