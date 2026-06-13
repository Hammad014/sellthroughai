-- ============================================================
-- Aiselling — prompt product: "The Freelancer Client Engine"
--
-- A 'prompts' product: 10 prompts that win, run and retain client work —
-- discovery, scoping, pricing, proposals, and the awkward conversations.
-- Buyers browse/copy at /dashboard/prompts/freelancer-client-engine.
--
-- Run AFTER 0005_prompt_library.sql. Idempotent.
-- ============================================================

insert into public.products
  (slug, title, short_desc, long_desc, category, price_usd,
   delivery_type, status, featured)
values
  (
    'freelancer-client-engine',
    'The Freelancer Client Engine',
    'Win better clients, scope cleanly, price with confidence. 10 prompts for proposals, pricing and the conversations freelancers dread.',
    e'## What this is\n\nMost freelancers lose money not on the work, but on everything around it — vague scopes, underpricing, scope creep, and the awkward conversations they avoid. The Freelancer Client Engine is **10 prompts** that handle the business side so you can do the work and get paid properly for it.\n\nFor freelancers and small agencies who are great at their craft and tired of winging the client stuff.\n\n## What it covers\n\n1. **Discovery Call Questions** — uncover the real project\n2. **Scope & Deliverables Doc** — kill ambiguity before it bites\n3. **Pricing & Packaging** — three tiers that anchor higher\n4. **Winning Proposal** — sell the outcome, not the hours\n5. **Scope-Creep Pushback** — say no without losing the client\n6. **Project Kickoff** — start clean and set expectations\n7. **Status Update** — keep clients calm and informed\n8. **Difficult Conversations** — late payment, unhappy client, delays\n9. **Testimonial & Referral Asks** — turn good work into more work\n10. **Rate Increase / Retainer Pitch** — grow the account\n\n## How to use it\n\nFill in the `[BRACKETED]` parts, paste into ChatGPT or Claude, and ship. Every prompt includes a worked example. Works with any modern model.\n\nLifetime access · free updates · 14-day no-questions refund.',
    'prompts',
    39.00,
    'prompts',
    'published',
    false
  )
on conflict (slug) do nothing;

insert into public.product_prompts
  (product_id, sort_order, title, description, model,
   prompt_body, example_input, example_output)
select p.id, v.sort_order, v.title, v.description, v.model,
       v.prompt_body, v.example_input, v.example_output
from public.products p
cross join (values
  (
    0,
    'Discovery Call Question Set',
    'Run before you quote anything. The right questions surface the real problem, the budget, and the red flags.',
    'Claude / GPT-4o',
    $p$You are a seasoned freelance consultant. Prepare me for a discovery call so I scope and price the project correctly.

My service: [WHAT YOU DO]
The prospect + what they have said so far: [CONTEXT]

Output:
1. 8-10 questions that uncover the real goal, success criteria, budget range, timeline, decision-makers and what "done" means.
2. 3 questions that surface red flags (scope risk, unrealistic expectations, difficult-client signals).
3. The 2 questions most likely to reveal a bigger, more valuable project.
Group them so the call flows naturally from goals to logistics.$p$,
    $p$Service: web design. Prospect said: "we need a new website, ours looks dated and doesn't get leads."$p$,
    $p$Goals: "What does a successful site do for the business in 6 months?" "How are leads handled today?" Budget/logistics: "What range are you working within?" Red flags: "Who has final sign-off?" "Has a previous project like this stalled — why?" Bigger project: "Is the goal really leads, or the whole funnel?"$p$
  ),
  (
    1,
    'Scope & Deliverables Doc',
    'Turns a fuzzy conversation into a precise scope — the single best protection against scope creep and disputes.',
    'Claude / GPT-4o',
    $p$Write a clear scope-of-work document from these project notes.

Project notes: [PASTE DISCOVERY NOTES]
My service: [WHAT YOU DO]

Output:
1. Project objective in one sentence.
2. Deliverables — specific and countable (e.g. "5-page website", not "a website").
3. Explicitly OUT of scope (list the things clients usually assume are included).
4. Assumptions and client responsibilities (what you need from them, by when).
5. Number of revision rounds included.
6. Timeline with milestones.
Plain language, no legalese, but leave no ambiguity.$p$,
    $p$Notes: 5-page marketing site, they provide copy + logo, want it live in 6 weeks, 2 rounds of revisions, no e-commerce.$p$,
    $p$Objective: a 5-page lead-generating marketing site. Deliverables: 5 designed + built pages, contact form, basic SEO setup. Out of scope: copywriting, e-commerce, ongoing maintenance. Client provides: copy + logo by week 1. Revisions: 2 rounds. Timeline: wk2 design, wk4 build, wk6 launch.$p$
  ),
  (
    2,
    'Pricing & Packaging',
    'Builds three tiers that anchor the client higher and make your recommended option the easy yes.',
    'Claude / GPT-4o',
    $p$Help me package and price this project as three tiers.

The project + deliverables: [SCOPE]
My usual rate or target for this: [RATE / TARGET PRICE]
The value it creates for the client: [BUSINESS OUTCOME]

Output:
1. Three tiers (e.g. Essential / Recommended / Premium) with what each includes and a price for each.
2. Make the middle tier the obvious best value (anchor the top tier higher).
3. One line per tier on who it is right for.
4. A short note on how to present price as an investment against the outcome, not a cost.
Price on value, not just hours.$p$,
    $p$Project: 5-page lead-gen site. Target: around $5,000. Outcome: more inbound leads = real revenue.$p$,
    $p$Essential $3.5k: 5-page site, you supply copy. Recommended $6k: site + copywriting + lead capture + analytics (best value). Premium $9k: all that + 3 months optimization. Framing: "A few extra leads a month pays for this many times over."$p$
  ),
  (
    3,
    'Winning Proposal Writer',
    'Writes a proposal that sells the outcome and the plan — not a price list a client can shop around.',
    'Claude / GPT-4o',
    $p$Write a client proposal that wins the work.

Client + their goal: [CLIENT, GOAL]
Their main pain / why now: [PAIN]
My approach + deliverables: [HOW YOU WORK + SCOPE]
Pricing: [TIERS OR PRICE]
Proof I have: [PORTFOLIO, RESULTS, TESTIMONIALS]

Structure: 1) Restate their goal and what is at stake (show you get it), 2) Your approach in clear phases, 3) Deliverables + timeline, 4) Proof you can do it, 5) Investment (the pricing, framed against the outcome), 6) Simple next step. Confident, warm, client-focused — sell the result, not your hours.$p$,
    $p$Client: a clinic wanting more bookings. Pain: site does not convert. Approach: redesign + lead funnel. Price: $6k. Proof: grew another clinic's bookings 35%.$p$,
    $p$"Your goal: more booked appointments from your website. Right now it informs but does not convert..." Phases: discovery → design → build → launch. Deliverables + 6-wk timeline. Proof: "+35% bookings for [clinic]". Investment: $6k, framed vs the value of new patients. Next step: approve and we start Monday.$p$
  ),
  (
    4,
    'Scope-Creep Pushback Scripts',
    'Handle "can you also just..." without working for free or damaging the relationship.',
    'Claude / GPT-4o',
    $p$A client is asking for something outside our agreed scope. Help me respond.

Agreed scope: [WHAT WAS AGREED]
What they are now asking for: [THE NEW REQUEST]
My relationship with them: [NEW / LONG-TERM / etc.]

Output:
1. A friendly reply that acknowledges the request, notes it is outside scope, and offers to do it as a small add-on (with rough price or a change-order step).
2. A firmer version if they push back.
3. A "goodwill" version for when it is genuinely tiny and worth absorbing — while still flagging it so it does not become a pattern.
Never resentful, never a pushover.$p$,
    $p$Agreed: 5-page site. New ask: "can you also set up our email newsletter and write the first one?" Relationship: new client.$p$,
    $p$1. "Happy to help with that — newsletter setup + first email sits outside our current scope, but I can add it for $X or pop it in a phase 2. Want me to send a quick change order?" 2. Firmer: "To keep your launch on track, I'd rather not expand scope mid-project..." 3. Goodwill: "I'll set up the signup form as a freebie since it's quick — the newsletter writing I'd quote separately."$p$
  ),
  (
    5,
    'Project Kickoff Message',
    'Start every engagement clean — expectations, communication, and what you need from the client up front.',
    'Claude / GPT-4o',
    $p$Write a project kickoff message to send right after a client signs.

Project + scope: [SCOPE]
Timeline + key milestones: [DATES]
What I need from them to start: [ASSETS / ACCESS / DECISIONS]
How I work (communication, revisions): [YOUR PROCESS]

Tone: warm, organized, reassuring. Include: a thank-you, a recap of what we are building and by when, exactly what you need from them and by when, how/when you will communicate, and an enthusiastic first step. Make them feel they hired the right person.$p$,
    $p$Project: 5-page site, 6 weeks. Need: copy, logo, brand colors by Friday. Process: weekly Friday update, 2 revision rounds.$p$,
    $p$"Thrilled to get started! Here's the plan: a 5-page lead-gen site, live in 6 weeks. To hit the ground running, could you send copy, logo and brand colors by Friday? I'll send a short progress update every Friday, and we have 2 revision rounds built in. First up: I'll share the homepage concept next week."$p$
  ),
  (
    6,
    'Status Update Template',
    'A 2-minute update that keeps clients calm, informed, and out of your inbox asking "how''s it going?".',
    'Claude / GPT-4o',
    $p$Write a client status update.

Project: [PROJECT]
Done since last update: [PROGRESS]
In progress / next: [WHAT IS NEXT]
Blockers or things I need from them: [BLOCKERS]
On track for the deadline? [YES/NO + ANY CHANGE]

Keep it short and skimmable: a one-line status (on track / at risk), what got done, what is next, and any clear ask of the client. Reassuring and professional. If something slipped, say so plainly with the new plan.$p$,
    $p$Project: clinic website. Done: homepage + about designed. Next: build + booking page. Blocker: waiting on staff photos. On track: yes if photos arrive this week.$p$,
    $p$"Status: on track. ✅ Homepage and About are designed and look great. Next: building those out + the booking page. One thing I need: the staff photos this week to stay on schedule. Still on target for our launch date."$p$
  ),
  (
    7,
    'Difficult Client Conversation',
    'Drafts the message you''ve been avoiding — late payment, an unhappy client, or a delay — firmly and professionally.',
    'Claude / GPT-4o',
    $p$Help me handle a difficult client situation professionally.

The situation: [LATE PAYMENT / UNHAPPY CLIENT / I NEED TO DELAY / etc.]
Relevant facts: [WHAT HAPPENED, DATES, AMOUNTS]
The outcome I want: [GET PAID / RESET EXPECTATIONS / SAVE THE RELATIONSHIP]

Output:
1. What is likely going on from their side.
2. A clear, calm message that states the facts, holds my position, and proposes a concrete path forward.
3. A firmer follow-up if there is no response.
Protect the relationship where possible, but protect me first. No groveling, no aggression.$p$,
    $p$Situation: invoice 3 weeks overdue, client has gone quiet. Want: get paid, keep relationship if possible.$p$,
    $p$1. Likely: it slipped, or cash-flow stall — usually not personal. 2. Message: "Hi [name], just flagging invoice #123 ($X) is now 3 weeks past due. Could you let me know the payment date this week? Happy to resend it if helpful." 3. Follow-up: "Following up on the overdue invoice — I'll need it settled before resuming work. Can we sort this by Friday?"$p$
  ),
  (
    8,
    'Testimonial & Referral Asks',
    'Turn finished work into your next project — the highest-ROI five minutes after a job goes well.',
    'Claude / GPT-4o',
    $p$Write messages to request a testimonial and a referral after successful work.

The project + result achieved: [WHAT YOU DELIVERED + OUTCOME]
Client relationship: [WARMTH / LENGTH]

Output:
1. A testimonial request that makes it effortless — include 3 specific prompt questions they can just answer (so they do not face a blank page).
2. A separate, low-pressure referral ask.
3. A LinkedIn recommendation request version.
Warm and genuine, never needy. Make saying yes easy.$p$,
    $p$Project: redesigned clinic site, bookings up 35%. Relationship: friendly, 2 months.$p$,
    $p$1. Testimonial: "So glad the new site is driving bookings! Mind if I grab a short testimonial? To make it easy: what problem were you facing? what changed after launch? would you recommend me, and why?" 2. Referral: "If you know anyone else who'd want results like this, I'd love an intro — no pressure at all." 3. LinkedIn version included.$p$
  ),
  (
    9,
    'Rate Increase / Retainer Pitch',
    'Grow the account: raise your rate or convert a one-off client into recurring monthly income.',
    'Claude / GPT-4o',
    $p$Help me grow an existing client relationship.

The client + work so far: [WHAT YOU'VE DONE + RESULTS]
What I want: [RAISE MY RATE / PITCH A MONTHLY RETAINER]
Their likely ongoing needs: [WHAT THEY'LL KEEP NEEDING]

Output:
1. If raising rates: a message that justifies the new rate with the value delivered, gives notice, and keeps it positive.
2. If pitching a retainer: a proposal for a monthly package — what is included, the price, and why ongoing beats one-off for them (results compounding, priority, no re-onboarding).
3. How to handle "that's more than we budgeted".
Frame everything around their outcome, not my income.$p$,
    $p$Client: clinic, site done, bookings +35%. Want: monthly retainer. Ongoing needs: content, optimization, ads.$p$,
    $p$Retainer pitch: "The site is converting — now the opportunity is compounding it. A monthly package ($X/mo) covers content, conversion tweaks and reporting, so bookings keep climbing instead of plateauing. You also get priority and no re-briefing each time." Budget objection: offer a lighter tier, not a discount on the full one.$p$
  )
) as v(sort_order, title, description, model,
       prompt_body, example_input, example_output)
where p.slug = 'freelancer-client-engine'
  and not exists (
    select 1 from public.product_prompts pp
    where pp.product_id = p.id and pp.title = v.title
  );
