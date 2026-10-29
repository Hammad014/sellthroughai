-- ============================================================
-- Makeready — bundle product: "The AI Automation Bundle"
--
-- The AI Automation Starter Kit + Build Your First AI Agent, at one price.
-- Buying it grants both products (see the webhook's bundle handling).
--
-- Run AFTER seed_ai_automation_kit.sql, seed_ai_agent_course.sql and
-- 0007_bundles.sql. Seeded as a DRAFT. UPSERT: safe to re-paste.
-- ============================================================

insert into public.products
  (slug, title, short_desc, long_desc, category, price_usd,
   delivery_type, status, featured)
values
  (
    'ai-automation-bundle',
    'The AI Automation Bundle',
    $d$The AI Automation Starter Kit (10 n8n workflows) + Build Your First AI Agent (9-lesson course, 3 agents), together for less.$d$,
    $d$## Automate the routine, then build agents for the rest

Two products that work best together:

- **The AI Automation Starter Kit**: 10 ready-to-import n8n workflows for your inbox, leads, content, invoices, meetings and more, with a setup guide for each.
- **Build Your First AI Agent (No Code)**: a 9-lesson course where you build agents that use tools, remember context and work with your Gmail and Calendar, plus 3 working agents to import.

Start with the kit to take the predictable work off your plate in an afternoon. Then use the course to build agents for the jobs that need judgement.

## How it works

Buy once and both unlock in your library straight away. Lifetime access and free updates on both.

Lifetime access · free updates · 14-day no-questions refund.$d$,
    'bundles',
    55.00,
    'license',
    'draft',
    false
  )
on conflict (slug) do update set
  title = excluded.title,
  short_desc = excluded.short_desc,
  long_desc = excluded.long_desc,
  category = excluded.category,
  price_usd = excluded.price_usd,
  delivery_type = excluded.delivery_type;

insert into public.product_bundle_items (bundle_id, item_product_id, sort_order)
select b.id, i.id, w.ord
from public.products b
cross join (values
  ('ai-automation-starter-kit', 0),
  ('build-your-first-ai-agent', 1)
) as w(slug, ord)
join public.products i on i.slug = w.slug
where b.slug = 'ai-automation-bundle'
on conflict (bundle_id, item_product_id) do update set
  sort_order = excluded.sort_order;
