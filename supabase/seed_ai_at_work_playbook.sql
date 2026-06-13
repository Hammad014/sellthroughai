-- ============================================================
-- Aiselling — guide product: "The AI-at-Work Playbook"
--
-- A 'gated' product in the 'ebooks' category: an 8-chapter guide authored as
-- markdown in course_lessons. Buyers read it in the in-app reader at
-- /dashboard/courses/ai-at-work-playbook. No file uploads required.
--
-- Apostrophe rules: inside $c$...$c$ use normal contractions (don't, it's);
-- inside the e'...' long_desc and '...' short_desc, double them (don''t).
--
-- Run AFTER 0001_init.sql (course_lessons table). Idempotent.
-- ============================================================

insert into public.products
  (slug, title, short_desc, long_desc, category, price_usd,
   delivery_type, status, featured)
values
  (
    'ai-at-work-playbook',
    'The AI-at-Work Playbook',
    'Save hours every week with AI — without becoming a "prompt engineer." A skimmable guide to using AI for the real work you do every day.',
    e'## What this is\n\nMost AI advice is either hype or homework. This is neither. The AI-at-Work Playbook is a short, practical guide to using AI for the stuff that actually fills your week — email, research, writing, planning, meetings — so you claw back a few hours and stop dreading your to-do list.\n\nNo coding. No 40-tab tool rabbit hole. Just what works, with copy-paste prompts you can use the minute you read them.\n\n## What''s inside\n\n- The 5 jobs AI is genuinely great at (and the one it isn''t)\n- Taming your inbox\n- Research and summarizing without the rabbit holes\n- Writing and editing — first drafts in minutes\n- Planning and making decisions\n- Meetings and notes\n- Building simple automations, no code\n- Your weekly AI routine\n\n## How it works\n\nEight short chapters you can read in a sitting, each ending with prompts you can copy and use straight away. Works with ChatGPT, Claude or any modern assistant.\n\nLifetime access · free updates · 14-day no-questions refund.',
    'ebooks',
    19.00,
    'gated',
    'published',
    false
  )
on conflict (slug) do nothing;

insert into public.course_lessons
  (product_id, sort_order, title, content_md)
select p.id, v.sort_order, v.title, v.content_md
from public.products p
cross join (values
  (
    0,
    'The 5 Jobs AI Is Genuinely Great At',
    $c$Before you sprinkle AI on everything, it helps to know where it actually earns its keep. Get these five, and the rest of this guide is just applying them to your real work.

## 1. Summarizing
Long becomes short. Reports, threads, articles, transcripts — AI is fantastic at "give me the gist."

## 2. Drafting
It beats the blank page every time. A rough first draft in 20 seconds is far easier to fix than nothing at all.

## 3. Transforming
Same information, new shape: notes into an email, a transcript into action items, a paragraph into a tweet. This is quietly the biggest time-saver of the lot.

## 4. Explaining
It'll take something complicated and make it simple, at whatever level you ask for — "explain it like I'm new to this."

## 5. Brainstorming
Need ten angles, names, or subject lines? You'll have them in seconds, and a few will actually be good.

## What's *not* on the list

Being a reliable source of facts. AI is a brilliant *thinking and writing partner* and a shaky *encyclopedia*. Lean on it for the five jobs above, and double-check anything factual — names, numbers, dates, quotes.

> If a task is really one of these five in disguise, AI can probably help. If it hinges on a hard fact, verify it.$c$
  ),
  (
    1,
    'Taming Your Inbox',
    $c$Email eats more of your week than almost anything. AI can hand a chunk of it back.

## Draft replies in seconds

Paste the email you got and tell it what you want to say:

> Reply to this saying I can't make Thursday but I'm free Friday afternoon. Keep it warm and short: [paste email]

You'll get a solid draft. Tweak a word or two and send.

## Clear a backlog fast

Dump several emails in and let AI triage:

> Here are 6 emails. For each: one-line summary + whether it needs a reply, a quick task, or nothing: [paste]

## Get the tone right

The same message, three ways:

> Rewrite this to sound (a) friendlier, (b) more direct, (c) more formal: [paste draft]

## Handle the awkward ones

The emails you put off are the ones AI helps most with:

> Help me say no to this request politely, without burning the relationship: [paste]

> A client is upset about a delay. Draft a calm reply that owns it and gives a clear next step: [paste]

A fair rule: let AI draft, you decide. Read every reply before it goes — it's your name on it.$c$
  ),
  (
    2,
    'Research & Summarizing Without the Rabbit Holes',
    $c$AI won't replace real research, but it'll get you to "good enough to act" much faster — as long as you keep it honest.

## Summarize anything long

> Summarize this in 5 bullets, then give me the single most important takeaway: [paste article/report/thread]

## Pull out just what you need

> From this document, list only the deadlines and who owns each: [paste]

## Compare options quickly

> Compare these 3 tools for a small team on a budget. Give me a short table: price, best for, main downside.

## Understand a new topic fast

> I'm new to [topic]. Explain the core idea, why it matters, and the 3 things a beginner gets wrong.

## Keeping it honest

This is where AI gets people in trouble, so two rules:

- **Make it work from your source.** Pasting the actual document beats asking from memory — far fewer made-up "facts."
- **Verify anything load-bearing.** If a number, name, or claim is going into a decision or a doc, check it at the source. AI is your fast first pass, not your final word.

> Great use: turning 20 pages into 5 bullets you then skim-verify. Risky use: asking it for stats off the top of its head.$c$
  ),
  (
    3,
    'Writing & Editing: First Drafts in Minutes',
    $c$The blank page is where work goes to die. AI's superpower is getting you to a messy first draft you can actually improve.

## Start with an outline

> I need to write [thing] for [audience]. Give me a tight outline before I start.

## Get the first draft

> Write a first draft from this outline. Plain language, no fluff, around [X] words: [paste outline]

## Then edit like a pro

The drafting is the easy half — editing is where it gets good:

> Make this tighter and cut 20%: [paste]
> Rewrite this so a non-expert gets it instantly: [paste]
> Punch up the opening line so it actually grabs attention: [paste]

## Make it sound like *you*

Generic AI writing is a real risk. Fix it by feeding it your voice:

> Here are two things I've written: [paste samples]. Match that tone and rewrite this: [paste]

## A word of caution

Never ship AI writing you haven't read and made yours. The goal isn't to sound like a robot that read the internet — it's to say what *you* mean, faster. Always do a final human pass.

> AI drafts. You direct. The voice stays yours.$c$
  ),
  (
    4,
    'Planning & Making Decisions',
    $c$When your head is full, AI is great at helping you sort it out and move.

## Turn a brain-dump into a plan

> Here's everything on my plate: [dump it all]. Organize it into today, this week, and later — and tell me the 3 things that matter most.

## Break down something overwhelming

> I need to [big scary goal]. Break it into small, concrete first steps I can start this week.

## Think through a decision

You stay in charge — AI just structures the thinking:

> Help me decide: [the decision]. Lay out the options, the trade-offs against [what I care about], and the cost of doing nothing. Then give me your honest lean.

## Pressure-test your own idea

> Here's my plan: [paste]. Play devil's advocate — what am I missing, and what would make this fail?

The point isn't to outsource the call. It's to see your options clearly and stop spinning. You make the decision; AI just clears the fog.

> Use it to think *wider*, then decide for yourself.$c$
  ),
  (
    5,
    'Meetings & Notes',
    $c$Meetings generate a ton of "I'll deal with that later." AI makes later take two minutes.

## Walk in prepared

> I have a meeting about [topic] with [who]. Give me 3 talking points, 3 smart questions, and the one outcome I should aim for.

## Turn messy notes into action

This is the big one. After the meeting, paste your scribbles:

> Turn these notes into: a 3-bullet summary, an action list with owners, and any open questions. Notes: [paste]

If your tool transcribes calls (many do now), paste the transcript instead — same prompt, even better results.

## Write the follow-up

> Draft a short, friendly recap email I can send the group from these notes: [paste]

## Catch up on one you missed

> Here's the transcript of a call I couldn't join. What did I miss, and is there anything I need to do? [paste]

A small habit with a big payoff: spend two minutes running your notes through AI right after every meeting. Nothing slips, and you look impressively on top of things.

> Raw notes in, clear actions out — before you've left the room.$c$
  ),
  (
    6,
    'Building Simple Automations (No Code)',
    $c$"Automation" sounds technical. It isn't — most of the wins are just reusing good work instead of redoing it.

## Build reusable templates

Anything you write again and again, turn into a fill-in-the-blank template once:

> I send proposals a lot. Build me a reusable template with [BRACKETED] spots I can swap each time, based on this example: [paste a good one]

## Create checklists and SOPs

> Turn how I do [recurring task] into a clear step-by-step checklist someone else could follow: [describe it]

## Save your best prompts

Your most valuable automation is a personal prompt library — a note with the prompts that worked. Reusing past-you is the fastest shortcut there is. (When you want ready-made ones for specific jobs, that's what the prompt packs in the store are for.)

## When you're ready for real automation

Tools like Zapier, Make and n8n connect your apps so things happen automatically — "new form submission → add to spreadsheet → send a welcome email." You don't need them on day one. Start by reusing templates and prompts; reach for the wiring once a task is both boring *and* frequent.

> Rule: if you've done it the same way three times, template it.$c$
  ),
  (
    7,
    'Your Weekly AI Routine',
    $c$Tips fade. Routines stick. Here's a light rhythm that turns "I should use AI more" into something automatic.

## Monday — plan
Brain-dump the week and have AI sort it into priorities. Five minutes that make the next five days calmer.

## Every day — draft
Make one rule: anything you'd normally stare at — a tricky email, a blank doc, a fuzzy idea — gets a first pass from AI before you sweat it.

## After every meeting — capture
Two minutes: notes in, summary and actions out. Non-negotiable once you feel how good it is.

## Friday — close the loop
> Here's what I got done and what's still open: [paste]. Give me a 2-line wins note and the top 3 things to start Monday.

## The mindset that makes it work

- **Reach for it first, not last.** The habit is starting *with* AI, not turning to it once you're stuck.
- **Keep your prompt list.** Steal from past-you constantly.
- **Stay the editor.** AI drafts and suggests; you decide and approve. Your judgment is the value — AI just gives you more time to use it.

That's the whole game: let AI do the heavy lifting on words and busywork, so you spend your hours on the work only you can do.

> You don't need to use AI for everything. You just need to stop doing by hand the things it does in seconds.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'ai-at-work-playbook'
  and not exists (
    select 1 from public.course_lessons cl
    where cl.product_id = p.id and cl.title = v.title
  );
