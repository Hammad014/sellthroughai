-- ============================================================
-- Aiselling — uniqueness keys so seed files can UPSERT safely
--
-- WHY: the seed files insert prompts/lessons keyed by (product_id, title).
-- With a unique index on those columns, the seeds can use
-- `on conflict (product_id, title) do update set ...` — meaning you can
-- re-paste a seed any number of times: existing rows get UPDATED (so your
-- copy edits sync), and nothing is ever duplicated.
--
-- Uses `create unique index if not exists` so this migration is itself safe to
-- re-run. Existing data already has unique (product_id, title) pairs, so this
-- will not fail on current rows.
--
-- IMPORTANT: apply this BEFORE re-pasting any updated seed file, otherwise the
-- `on conflict (product_id, title)` clause has no index to match and errors.
--
-- Run AFTER 0005_prompt_library.sql. Idempotent.
-- ============================================================

create unique index if not exists course_lessons_product_title_uidx
  on public.course_lessons (product_id, title);

create unique index if not exists product_prompts_product_title_uidx
  on public.product_prompts (product_id, title);
