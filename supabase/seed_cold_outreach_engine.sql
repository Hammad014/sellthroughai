-- ============================================================
-- Aiselling — prompt product: "The Cold Outreach Engine"
--
-- A 'prompts' product: 10 chained prompts that take you from "who do I email?"
-- to booked meetings — research, cold email, follow-ups, objection handling.
-- Buyers browse/copy at /dashboard/prompts/cold-outreach-engine.
--
-- Run AFTER 0005_prompt_library.sql. Idempotent.
-- ============================================================

insert into public.products
  (slug, title, short_desc, long_desc, category, price_usd,
   delivery_type, status, featured)
values
  (
    'cold-outreach-engine',
    'The Cold Outreach Engine',
    'Turn cold strangers into booked calls. 10 prompts for research, cold email, follow-ups and objection handling — the whole pipeline.',
    e'## What this is\n\nMost cold outreach fails for one reason: it''s generic. The Cold Outreach Engine is a **10-prompt pipeline** that makes every message feel one-to-one — from finding the right people to writing emails that get replies to following up without being annoying.\n\nBuilt for founders, freelancers and agencies who sell to other businesses and don''t have a sales team (or a sales background).\n\n## The pipeline\n\n1. **ICP Builder** — define exactly who to target\n2. **Lead Research** — turn a name into a personalized angle\n3. **The Cold Email** — problem → proof → one clear ask\n4. **Follow-Up Sequence** — 4 touches that add value, not guilt\n5. **LinkedIn Opener** — connect and start a real conversation\n6. **Objection Handling** — replies to "no time / no budget / not now"\n7. **The Break-Up Email** — the last touch that often works best\n8. **Subject Line Bank** — openers built to get the email opened\n9. **Meeting-Booking Nudge** — turn "interested" into a calendar invite\n10. **Reply Triage** — read the signal and draft the next step\n\n## How to use it\n\nFill in the `[BRACKETED]` parts, paste into ChatGPT or Claude, and ship. Every prompt includes a worked example. Works with any modern model.\n\nLifetime access · free updates · 14-day no-questions refund.',
    'prompts',
    49.00,
    'prompts',
    'published',
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  short_desc = excluded.short_desc,
  long_desc = excluded.long_desc,
  category = excluded.category,
  price_usd = excluded.price_usd,
  delivery_type = excluded.delivery_type;

insert into public.product_prompts
  (product_id, sort_order, title, description, model,
   prompt_body, example_input, example_output)
select p.id, v.sort_order, v.title, v.description, v.model,
       v.prompt_body, v.example_input, v.example_output
from public.products p
cross join (values
  (
    0,
    'Ideal Customer Profile (ICP) Builder',
    'Run this first. Bad targeting kills outreach before the first word. This sharpens exactly who to contact.',
    'Claude / GPT-4o',
    $p$You are a B2B sales strategist. Help me define a tight Ideal Customer Profile so my outreach hits the right people.

What I sell: [YOUR PRODUCT/SERVICE]
The result it delivers: [OUTCOME FOR THE BUYER]
Who has bought before (if any): [PAST CUSTOMERS]

Output:
1. ICP firmographics: company size, industry, stage, and 2–3 "trigger" signals that mean they need me NOW.
2. The exact job title(s) of the person who feels this pain and the one who controls budget.
3. Three pains my offer solves, phrased the way the buyer would say them.
4. Two reasons a good-fit prospect might NOT be ready (so I don't waste touches).
Be specific — no "small to medium businesses".$p$,
    $p$I sell done-for-you bookkeeping. Outcome: founders stop drowning in receipts and always know their numbers. Past customers: early-stage agency owners.$p$,
    $p$1. 5–25 employees, agencies/studios, post-revenue; triggers: just hired, raising, or behind on taxes. 2. Feels pain: Founder/COO. Budget: Founder. 3. "I have no idea what my real margin is" ... 4. Not ready: pre-revenue, or they have an in-house finance hire.$p$
  ),
  (
    1,
    'Lead Research & Personalization',
    'Turns a name and a company into a specific, genuine reason to reach out — the difference between spam and a real message.',
    'Claude / GPT-4o',
    $p$You help me personalize cold outreach. I'll give you what I know about a prospect; you find the angle.

Prospect: [NAME, TITLE, COMPANY]
What I know / found (site, LinkedIn, news): [PASTE NOTES OR LINKS' CONTENT]
What I sell: [YOUR OFFER]

Output:
1. One specific, non-obvious observation about them or their company I can open with (not "I love what you're building").
2. A plausible pain they likely have right now, tied to that observation.
3. A one-sentence bridge from that pain to my offer.
Keep it honest — flag if there's not enough to personalize, rather than inventing facts.$p$,
    $p$Prospect: Mara Lee, COO, Northwind Studio. Notes: just posted they grew from 8 to 20 people this year; hiring a producer. I sell bookkeeping.$p$,
    $p$1. "You've more than doubled headcount to 20 this year." 2. Finance complexity usually outgrows the founder's spreadsheet right around 15–20 people. 3. Bridge: that's exactly the size where messy books start hiding margin — which is what I clean up.$p$
  ),
  (
    2,
    'The Cold Email',
    'Writes a short cold email that respects the reader''s time: relevant, credible, one ask.',
    'Claude / GPT-4o',
    $p$Write a cold email that gets a reply. Short, specific, human.

To: [PROSPECT NAME, ROLE, COMPANY]
Opening angle (from research): [PERSONALIZED OBSERVATION]
The pain I solve: [PAIN]
Proof I can solve it: [RESULT / CLIENT / NUMBER]
The single ask: [e.g. "open to a 15-min call next week?"]

Rules:
- Under 90 words. Reads like one human to another.
- Line 1 = the personalized angle, NOT about me.
- One proof point, stated plainly.
- One clear, low-friction ask. No "circle back", no "synergy", no fake urgency.
- Give me 2 versions: one slightly warmer, one more direct.$p$,
    $p$To: Mara, COO, Northwind. Angle: doubled to 20 people this year. Pain: messy books hiding margin. Proof: cut one agency's reporting time 80% and found 6% margin. Ask: 15-min call next week?$p$,
    $p$Version A (warmer): "Hi Mara — saw Northwind doubled to 20 this year, congrats..." Version B (direct): "Hi Mara — scaling to 20 people usually breaks the founder's bookkeeping setup..." (each ends with: "Worth a quick 15 minutes next week?")$p$
  ),
  (
    3,
    'Follow-Up Sequence',
    'Most replies come from follow-ups, not the first email. This writes 4 touches that add value instead of nagging.',
    'Claude / GPT-4o',
    $p$Write a 4-email follow-up sequence for prospects who didn't reply to my cold email.

Original email context: [PASTE OR SUMMARIZE THE FIRST EMAIL]
What I sell: [OFFER]
A useful resource or insight I can share: [LEAD MAGNET / TIP / CASE STUDY]

For each follow-up give me: the send timing (e.g. +3 days), a one-line goal, and the email (under 60 words). Each must add something new — a resource, a different angle, a relevant result — never just "bumping this" or "did you see my email?". Final one is a polite break-up.$p$,
    $p$First email: bookkeeping for scaling agencies. Resource: a 1-page "month-end close checklist". Offer: done-for-you bookkeeping.$p$,
    $p$FU1 (+3d, give value): shares the month-end checklist, no ask. FU2 (+5d, new angle): a client result. FU3 (+7d, social proof + soft ask). FU4 (+7d, break-up): "I'll stop here — want me to send the checklist and close the loop?"$p$
  ),
  (
    4,
    'LinkedIn Connection & DM Opener',
    'Starts a real conversation on LinkedIn without the instant pitch that gets you ignored.',
    'Claude / GPT-4o',
    $p$Write LinkedIn outreach that starts a conversation, not a pitch.

Prospect: [NAME, ROLE, COMPANY]
Personalized angle: [OBSERVATION]
What I eventually offer: [OFFER]

Output:
1. A connection-request note under 200 characters — warm, specific, zero pitch.
2. A first DM to send AFTER they accept: opens with the angle, asks one genuine question related to their world. No link, no pitch.
3. A natural second message that introduces what I do — only if they reply positively.
Sound like a person, not a template.$p$,
    $p$Prospect: Mara, COO, Northwind. Angle: doubled to 20 people. Offer: bookkeeping.$p$,
    $p$1. "Hi Mara — Northwind doubling to 20 this year caught my eye. Always curious how ops keeps up at that pace. Happy to connect." 2. DM: "Thanks for connecting! Genuinely curious — what's been the trickiest part of scaling the team this fast?" 3. (if reply) "Makes sense. I help agencies your size keep the finance side from becoming that headache..."$p$
  ),
  (
    5,
    'Objection-Handling Replies',
    'Drafts calm, non-pushy replies to the three objections that kill most deals.',
    'Claude / GPT-4o',
    $p$A prospect replied with an objection. Help me respond in a way that keeps the door open without being pushy.

What I sell: [OFFER]
Their objection: [PASTE THEIR REPLY]

Output:
1. What they're really saying underneath the objection.
2. A reply (under 80 words) that acknowledges it honestly, reframes, and offers a small next step — not a hard close.
3. A fallback if they still say no, that leaves the relationship intact for later.
Never argue or guilt-trip.$p$,
    $p$Offer: bookkeeping. Objection: "We're happy with our current setup, thanks."$p$,
    $p$1. Underneath: low urgency, not a real "no". 2. Reply: "Totally fair — most teams I work with felt the same until close took a week. No switch needed; happy to send a 1-page checklist you can use either way. Want it?" 3. Fallback: "All good — I'll check back next quarter. Best of luck with the scale-up."$p$
  ),
  (
    6,
    'The Break-Up Email',
    'The last touch in a sequence — often the highest reply rate of all. This writes it.',
    'Claude / GPT-4o',
    $p$Write a "break-up" email for a prospect who's gone quiet after several touches.

Context: [WHAT I OFFER + HOW MANY TIMES I'VE REACHED OUT]

Rules:
- Under 60 words, warm and ego-free.
- Make it genuinely easy to say "not now" — that often triggers a reply.
- Optionally leave one last piece of value.
- No guilt, no "final notice", no fake deadline.
Give me 2 versions.$p$,
    $p$Offer: bookkeeping. Reached out 4 times over 3 weeks, no reply.$p$,
    $p$A: "Hi Mara — I'll stop reaching out so I'm not cluttering your inbox. If clean books ever jump up the priority list, just reply and I'm here. Sending the month-end checklist as a parting gift either way." B: "Sounds like the timing isn't right — totally understand. Should I close the file, or check back next quarter?"$p$
  ),
  (
    7,
    'Subject Line Bank',
    'Generates subject lines built to get opened — the gate every cold email has to pass.',
    'Claude / GPT-4o',
    $p$Write subject lines for a cold email.

Email is about: [TOPIC / ANGLE]
Prospect type: [WHO]

Give me 15 subject lines across these styles: ultra-short (1–3 words), a relevant question, a specific result/number, the personalized angle, and pattern-interrupt. Rules: under 6 words where possible, lowercase-friendly, no clickbait I can't deliver, no "RE:" tricks, no spammy words (free, guarantee, !!!). Mark the 3 you'd test first.$p$,
    $p$About: bookkeeping for scaling agencies. Prospect: agency COO who just doubled headcount.$p$,
    $p$quick question on Northwind | scaling to 20? | your month-end close | found 6% margin | the agency bookkeeping trap | ... ★ test first: "quick question on Northwind", "scaling to 20?", "your month-end close".$p$
  ),
  (
    8,
    'Meeting-Booking Nudge',
    'Turns "sounds interesting" into an actual scheduled call with zero back-and-forth.',
    'Claude / GPT-4o',
    $p$A prospect showed interest. Write a reply that books the meeting with minimal friction.

Their message: [PASTE THEIR REPLY]
My availability / link: [TIMES OR SCHEDULING LINK]
What the call will cover: [AGENDA IN ONE LINE]

Rules:
- Match their energy, then make booking effortless.
- Offer 2–3 concrete time options AND the link (don't make them choose how to choose).
- Set a clear, low-pressure agenda and expected length.
- Under 70 words.$p$,
    $p$Their reply: "Yeah, could be worth a chat." Link: cal.com/me. Covers: where their books are leaking margin + whether I can help. 20 min.$p$,
    $p$"Great — let's keep it quick. I'll walk you through where agency books usually leak margin and whether it's worth me helping. 20 min. Does Tue 2pm or Wed 10am work? Or grab any slot here: cal.com/me."$p$
  ),
  (
    9,
    'Reply Triage & Next-Step Drafter',
    'Read an ambiguous reply, figure out the real signal, and draft the right next move.',
    'Claude / GPT-4o',
    $p$Help me handle a reply I'm not sure how to read.

What I sell: [OFFER]
Their reply: [PASTE IT]

Output:
1. The signal: are they interested, deflecting, delegating, or a soft no? Why you think so.
2. The single best next move.
3. A drafted reply (under 80 words) for that move.
4. What NOT to do here.
Be honest if it's a no — chasing a dead lead wastes us both.$p$,
    $p$Offer: bookkeeping. Reply: "Thanks, let me loop in our ops lead and get back to you."$p$,
    $p$1. Signal: warm-ish, delegating — real but slow. 2. Move: make it easy to forward + offer to talk to ops directly. 3. Reply: "Perfect — want me to send a short summary you can forward to [ops lead]? Or happy to chat with them directly, whatever's easier." 4. Don't: go silent and wait, or pester before they've had time to loop them in.$p$
  )
) as v(sort_order, title, description, model,
       prompt_body, example_input, example_output)
where p.slug = 'cold-outreach-engine'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  description = excluded.description,
  model = excluded.model,
  prompt_body = excluded.prompt_body,
  example_input = excluded.example_input,
  example_output = excluded.example_output;
