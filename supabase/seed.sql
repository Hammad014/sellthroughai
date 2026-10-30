-- ============================================================
-- Makeready — demo product cleanup
--
-- This file used to insert 3 published DEMO products (The Operator's Prompt
-- Vault, AI in 7 Days, Second Brain OS). They had no real content behind them
-- (no files, lessons or prompts), so anyone who bought one would get nothing.
--
-- If you ever ran the old version, run this in the Supabase SQL Editor: it
-- moves those demo products back to draft so they disappear from the store.
-- Then delete them in /admin/products if you like.
--
-- Idempotent: safe to run multiple times. `supabase db reset` also runs it.
-- The real products live in the supabase/seed_*.sql files (see UPDATES.md).
-- ============================================================

update public.products
set status = 'draft', featured = false
where slug in ('operator-prompt-vault', 'ai-in-7-days', 'second-brain-os');
