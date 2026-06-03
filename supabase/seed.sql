-- ============================================================
-- Aiselling — seed data (3 published demo products)
-- Idempotent: safe to run multiple times. Run after 0001_init.sql.
--   Supabase SQL Editor, or `supabase db reset` (auto-runs seed.sql).
-- ============================================================

insert into public.products
  (slug, title, short_desc, long_desc, category, price_usd,
   delivery_type, status, featured)
values
  (
    'operator-prompt-vault',
    'The Operator''s Prompt Vault',
    '520+ copy-paste prompts for marketing, ops, research and writing — organized by job, not by hype.',
    e'A curated vault of 520+ production prompts, organized by the job you''re actually trying to do — so you stop prompt-guessing and start shipping.\n\nEvery prompt has been tested in real workflows across marketing, operations, research and writing. Filter by tool, role and use-case, then copy and go.\n\nIncludes a Notion database, a PDF, and a plain-text pack — plus free lifetime updates as new prompts are added.',
    'prompts',
    39.00,
    'license',
    'published',
    true
  ),
  (
    'ai-in-7-days',
    'AI in 7 Days',
    'A 7-day, no-fluff course that takes non-technical pros from AI-curious to AI-fluent.',
    e'Seven focused days, about 30 minutes each. By the end you''ll use AI confidently across writing, research, analysis and automation — no jargon, no code.\n\nTwelve mobile-friendly video lessons, an action workbook with exercises after every lesson, and a starter prompt kit you can use on day one.\n\nFinish with a shareable certificate of completion.',
    'courses',
    89.00,
    'gated',
    'published',
    true
  ),
  (
    'second-brain-os',
    'Second Brain OS',
    'An all-in-one Notion workspace for notes, projects, goals and AI-assisted weekly reviews.',
    e'One Notion workspace to capture everything, connect it, and let AI surface what matters in your weekly review.\n\nTwelve connected databases (notes, tasks, projects, goals and more), eight dashboard views, and an AI weekly-review flow that drafts a summary of your week.\n\nComes with a setup video and guide — up and running in under 20 minutes.',
    'templates',
    59.00,
    'license',
    'published',
    false
  )
on conflict (slug) do nothing;
