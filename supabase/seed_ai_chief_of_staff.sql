-- ============================================================
-- Aiselling — prompt product: "The AI Chief of Staff"
--
-- A 'prompts' product: 10 prompts that hand the busywork of a knowledge-work
-- day to AI — inbox, meetings, planning, decisions, status updates.
-- Buyers browse/copy at /dashboard/prompts/ai-chief-of-staff.
--
-- Run AFTER 0005_prompt_library.sql. Idempotent.
-- ============================================================

insert into public.products
  (slug, title, short_desc, long_desc, category, price_usd,
   delivery_type, status, featured)
values
  (
    'ai-chief-of-staff',
    'The AI Chief of Staff',
    'Hand the busywork to AI. 10 prompts for inbox, meetings, planning and decisions — get your time back without learning prompt engineering.',
    e'## What this is\n\nA chief of staff protects your time and clears the noise so you can do the work only you can do. The AI Chief of Staff is **10 prompts** that do exactly that — triage your inbox, prep your meetings, turn notes into action, plan your week, and help you decide faster.\n\nNo prompt-engineering skills needed. If you can copy, paste and fill in a blank, you can run this.\n\n## What it does for your day\n\n1. **Inbox Triage** — sort and draft replies in minutes\n2. **Meeting Prep Brief** — walk in ready, every time\n3. **Notes → Action Items** — never lose a decision again\n4. **Weekly Priorities Planner** — focus on what moves the needle\n5. **Decision Framework** — stop spinning, decide\n6. **Status Update Writer** — clear updates in 2 minutes\n7. **Saying No & Delegating** — protect your calendar gracefully\n8. **Project One-Pager** — align everyone fast\n9. **Daily Plan from Chaos** — turn a messy list into a plan\n10. **End-of-Day Shutdown** — close the day clean\n\n## How to use it\n\nFill in the `[BRACKETED]` parts, paste into ChatGPT or Claude, done. Every prompt has a worked example. Works with any modern model.\n\nLifetime access · free updates · 14-day no-questions refund.',
    'prompts',
    39.00,
    'prompts',
    'published',
    false
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
    'Inbox Triage & Reply Drafting',
    'Paste a pile of emails; get them sorted by urgency with replies drafted for the ones you can clear fast.',
    'Claude / GPT-4o',
    $p$You are my executive assistant triaging my inbox.

Here are emails (subject + sender + body): [PASTE EMAILS]
My role / context: [WHO YOU ARE, WHAT MATTERS TO YOU]

Output a table: Sender | One-line summary | Category (Reply now / Delegate / Schedule / Ignore) | Suggested action. Then, for everything marked "Reply now", draft a short reply in my voice (polite, concise, no filler). Flag anything that looks time-sensitive or risky.$p$,
    $p$Role: founder. Emails: 1) investor asking for the deck, 2) vendor invoice overdue notice, 3) newsletter, 4) candidate following up on offer.$p$,
    $p$Table: Investor → wants deck → Reply now → send deck + thanks. Vendor → overdue invoice → Reply now (time-sensitive!) → confirm payment date. Newsletter → Ignore. Candidate → Reply now → reassure, give timeline. Drafts below: "Hi [Investor], thanks for the nudge — deck attached..."$p$
  ),
  (
    1,
    'Meeting Prep Brief',
    'Walk into any meeting prepared in 60 seconds, even one you forgot was happening.',
    'Claude / GPT-4o',
    $p$Prepare me for a meeting.

Meeting: [TITLE / PURPOSE]
Who's attending: [NAMES + ROLES]
What I know / context: [BACKGROUND, PRIOR THREADS, DOCS]
My goal for the meeting: [DESIRED OUTCOME]

Output:
1. The one outcome that makes this meeting a success.
2. 3–5 talking points in priority order.
3. 3 smart questions I should ask.
4. Likely objections or concerns from attendees + a brief response to each.
5. The single decision or next step I should push for before it ends.$p$,
    $p$Meeting: pricing review with sales + finance. Goal: get buy-in to raise prices 15%. Context: margins down, competitors more expensive.$p$,
    $p$1. Success = a yes (or a clear test plan) on +15%. 2. Talking points: margin trend, competitor benchmark, churn-risk data... 3. Questions: "What would make you comfortable testing this on new customers only?" 4. Objection: "sales will push back" → propose grandfathering existing. 5. Push for: agree to a 30-day new-customer test.$p$
  ),
  (
    2,
    'Notes to Action Items',
    'Turn messy meeting notes into clear owners, actions and deadlines — nothing slips.',
    'Claude / GPT-4o',
    $p$Turn my raw meeting notes into a clean summary and action list.

Notes: [PASTE RAW NOTES]
Attendees: [NAMES]

Output:
1. A 3-bullet summary of what was decided.
2. An action table: Action | Owner | Due date (infer if implied, flag if unclear).
3. Open questions that still need an answer and who can answer them.
4. A short, send-ready recap message I can paste into Slack/email.
If an owner or date is missing, say so rather than guessing silently.$p$,
    $p$Notes: "talked pricing, Mara to draft new tiers by Fri, Sam unsure about grandfathering, need legal to check terms, launch maybe next month". Attendees: Mara, Sam, me.$p$,
    $p$1. Decided: test +15% on new customers; revisit grandfathering. 2. Actions: Draft new tiers | Mara | Fri · Check terms | Legal | (no date — confirm). 3. Open: grandfather existing? (Sam to decide). 4. Recap: "Quick recap from pricing: we're testing +15%..."$p$
  ),
  (
    3,
    'Weekly Priorities Planner',
    'Cut a long, anxious to-do list down to the few things that actually matter this week.',
    'Claude / GPT-4o',
    $p$Help me plan my week around what actually matters.

My goals this quarter: [TOP GOALS]
Everything on my plate right now: [BRAIN-DUMP YOUR TASKS]
Hard commitments this week: [MEETINGS / DEADLINES]

Output:
1. The 3 priorities that, if done, make this a winning week (tie each to a goal).
2. What to deliberately NOT do or defer this week, and why.
3. A simple day-by-day shape (Mon–Fri) placing deep work and the 3 priorities around my commitments.
Be ruthless — protect focus over volume.$p$,
    $p$Goals: launch v2, hire a designer. Plate: 14 random tasks. Commitments: board call Thu, 3 interviews.$p$,
    $p$1. Priorities: ship v2 beta, run + decide on designer hire, prep board call. 2. Defer: the 9 minor tasks, batch them Fri PM; say no to the new partnership intro. 3. Mon deep work on v2 / Tue interviews / Wed v2 + decision / Thu board / Fri admin batch.$p$
  ),
  (
    4,
    'Decision Framework',
    'Stop looping on a hard call. This structures the decision so you can actually make it.',
    'Claude / GPT-4o',
    $p$Help me make a decision I've been stuck on.

The decision: [WHAT YOU'RE DECIDING]
Options I see: [OPTIONS]
What matters most to me here: [CRITERIA / CONSTRAINTS]
What I'm afraid of: [THE FEAR / RISK]

Output:
1. Reframe the real question I'm actually deciding.
2. A short pros/cons for each option against my criteria.
3. The likely outcome of doing nothing.
4. A clear recommendation with the reasoning — and the one piece of information that would change it.
Don't hedge into "it depends"; give me a lean.$p$,
    $p$Decision: hire a senior dev now or wait a quarter. Criteria: runway, shipping speed. Fear: running out of cash.$p$,
    $p$1. Real question: can I afford to ship slower for a quarter? 2. Hire now: faster v2, −3 months runway. Wait: safer cash, slower launch... 3. Do nothing: launch slips, momentum fades. 4. Lean: hire now on a 3-month contract-to-perm — caps the cash risk. Changes if: runway is under 6 months, then wait.$p$
  ),
  (
    5,
    'Status Update Writer',
    'Write a crisp update for your team, boss or investors in two minutes.',
    'Claude / GPT-4o',
    $p$Write a status update.

Audience: [TEAM / MANAGER / INVESTORS / CLIENT]
Period: [THIS WEEK / MONTH]
What happened: [WINS, PROGRESS, NUMBERS]
What's blocked or behind: [ISSUES]
What's next: [NEXT STEPS]

Rules:
- Lead with the headline, not the history.
- Skimmable: short sections (Highlights / Lowlights / Next / Asks).
- Honest about what's behind — no spin.
- Match the tone to the audience (investors = numbers + direction; team = clarity + morale).
Keep it tight.$p$,
    $p$Audience: investors. Month. Wins: MRR +12%, 2 enterprise trials. Behind: hiring slow. Next: close trials, ship v2.$p$,
    $p$Headline: Steady growth, hiring is the bottleneck. Highlights: MRR +12% to $X, 2 enterprise trials started. Lowlights: senior hire still open (4 weeks). Next: convert trials, ship v2 beta. Asks: intros to senior backend devs.$p$
  ),
  (
    6,
    'Saying No & Delegating',
    'Protect your time without burning the relationship — scripts for declining and handing off.',
    'Claude / GPT-4o',
    $p$Help me say no or delegate gracefully.

The request: [WHAT'S BEING ASKED OF ME]
Who's asking + our relationship: [WHO]
Why I can't / shouldn't take it on: [REAL REASON]
If delegating, who could own it: [PERSON, IF ANY]

Output:
1. A warm "no" that holds my boundary and keeps goodwill (under 70 words).
2. If it can be delegated: a hand-off message that gives the owner context, the outcome wanted, and authority to run with it.
3. An optional middle path if I want to partly help without fully owning it.
No over-apologizing.$p$,
    $p$Request: "Can you join our weekly marketing sync?" From: a peer. Reason: too many meetings, not my lane. Delegate to: Priya.$p$,
    $p$1. No: "I want to protect focus time, so I'm going to pass on a standing slot — but I don't want to leave you hanging." 2. Hand-off: "Priya, can you own our side of the marketing sync? Goal: keep us aligned on campaigns; you have full call on commitments." 3. Middle path: "Loop me in async with notes; I'll weigh in when it's strategic."$p$
  ),
  (
    7,
    'Project One-Pager',
    'Align everyone on a project fast with a single clear brief.',
    'Claude / GPT-4o',
    $p$Write a one-page project brief.

Project: [NAME]
Why it matters / the problem: [CONTEXT]
What "done" looks like: [SUCCESS CRITERIA]
Scope notes / constraints: [TIME, BUDGET, MUST/WON'T DO]
Who's involved: [PEOPLE + ROLES]

Output a clean one-pager with: Objective (1 sentence), Why now, Success metrics, Scope (in / out), Milestones with rough dates, Owner & team, and Risks. Keep it to a page someone can read in 90 seconds.$p$,
    $p$Project: revamp onboarding. Problem: 40% drop off day 1. Done: drop-off under 20%. Constraint: 6 weeks, no new hires. Team: me, Mara (design), Sam (eng).$p$,
    $p$Objective: cut day-1 onboarding drop-off from 40% to under 20% in 6 weeks. Why now: it's our biggest leak. Metrics: D1 activation %. Scope in: signup→first value flow; out: billing redesign. Milestones: wk2 prototype, wk4 build, wk6 ship. Owner: me. Risks: eng capacity.$p$
  ),
  (
    8,
    'Daily Plan from Chaos',
    'Dump everything in your head; get back a realistic, time-blocked day.',
    'Claude / GPT-4o',
    $p$Turn my brain-dump into a realistic plan for today.

Everything in my head: [DUMP TASKS, ERRANDS, WORRIES]
Fixed commitments today: [MEETINGS / CALLS WITH TIMES]
My energy pattern: [e.g. sharpest in the morning]
Hours I actually have: [e.g. 6]

Output:
1. The ONE thing that must get done today.
2. A time-blocked schedule around my commitments, putting deep work in my high-energy window.
3. What to drop or push to tomorrow (be realistic — don't plan 10 hours into 6).
4. A 2-minute "if the day goes sideways" minimum version.$p$,
    $p$Dump: finish proposal, call dentist, review 2 PRs, gym, prep Thu talk, reply to Mara. Fixed: standup 9:30, 1:1 at 3. Energy: AM. Hours: 6.$p$,
    $p$1. Must: finish the proposal. 2. 8:30 deep work (proposal) / 9:30 standup / 10–12 proposal + PRs / lunch+gym / 1:1 at 3 / 3:30 talk prep / quick: dentist, reply Mara. 3. Push: second PR to tomorrow. 4. Sideways version: send proposal draft + reply Mara, that's the day.$p$
  ),
  (
    9,
    'End-of-Day Shutdown',
    'Close the day clean so work doesn''t follow you home and tomorrow starts sharp.',
    'Claude / GPT-4o',
    $p$Run my end-of-day shutdown.

What I did today: [QUICK DUMP]
What's still open: [UNFINISHED / LOOSE ENDS]
Tomorrow's commitments: [MEETINGS / DEADLINES]

Output:
1. A 2-line "wins" note so I acknowledge progress.
2. A clean capture of open loops so I can stop holding them in my head.
3. The top 1–3 things to start tomorrow, in order.
4. One thing I should drop or stop carrying.
Keep it short and calming — this is a shutdown, not a new to-do list.$p$,
    $p$Did: shipped beta, 3 interviews. Open: proposal half-done, haven't replied to investor. Tomorrow: board call 10am.$p$,
    $p$1. Wins: beta is live and you ran 3 solid interviews — good day. 2. Open loops captured: finish proposal, reply to investor. 3. Tomorrow: (1) prep board call, (2) reply investor, (3) finish proposal. 4. Drop: stop re-checking beta metrics tonight — look in the morning.$p$
  )
) as v(sort_order, title, description, model,
       prompt_body, example_input, example_output)
where p.slug = 'ai-chief-of-staff'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  description = excluded.description,
  model = excluded.model,
  prompt_body = excluded.prompt_body,
  example_input = excluded.example_input,
  example_output = excluded.example_output;
