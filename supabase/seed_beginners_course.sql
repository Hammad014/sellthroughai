-- ============================================================
-- Aiselling — course product: "ChatGPT & Claude for Total Beginners"
--
-- A 'gated' product (delivery_type = 'gated', category = 'courses'): 7 text
-- lessons authored as markdown in course_lessons. Buyers read them in the
-- course player at /dashboard/courses/chatgpt-claude-for-beginners.
-- No video uploads required — fully self-contained.
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
    'chatgpt-claude-for-beginners',
    'ChatGPT & Claude for Total Beginners',
    'Barely touched AI? Start here. 7 short, plain-English lessons that take you from "I have no clue" to using ChatGPT and Claude like it''s second nature.',
    e'## Who this is for\n\nYou keep hearing AI will change everything, but you''ve barely opened ChatGPT. That''s exactly who this is for. No tech background, no jargon — just 7 short lessons that get you genuinely comfortable using AI for everyday work and life.\n\n## What you''ll learn\n\n- What ChatGPT and Claude really are (and what they''re not)\n- How to have your first real conversation\n- 10 things to try on day one\n- The simple formula for getting far better answers\n- The beginner mistakes that quietly waste your time\n- What''s safe to share, and what isn''t\n- How to build an AI habit that actually sticks\n\n## How it works\n\nSeven bite-sized lessons you can finish in an afternoon, each with examples you can copy and try right away. Everything works in both ChatGPT and Claude, on the free plans.\n\nLifetime access · free updates · 14-day no-questions refund.',
    'courses',
    29.00,
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
    'What ChatGPT & Claude Actually Are',
    $c$## The 30-second version

ChatGPT (from OpenAI) and Claude (from Anthropic) are **AI assistants you talk to in plain English**. You type a question or a request, they write back. Picture a fast, ridiculously well-read assistant who'll draft, explain, summarize, brainstorm and plan with you — instantly.

What they're *not* is a search engine, and they're not always right. They predict the most helpful-sounding response from patterns in a huge amount of text. That's why they're brilliant with language and, every so often, confidently wrong about a fact.

## Where they shine

- Writing and rewriting — emails, posts, documents
- Explaining things simply
- Summarizing long, boring text
- Brainstorming when you're stuck
- Planning and organizing
- Turning a mess of notes into something clear

## Where to keep your guard up

- **They make things up sometimes.** The polite word is "hallucination." Double-check facts, names, numbers and quotes.
- **They might not know recent news** unless web access is switched on.
- **They don't remember you** from one chat to the next (unless a memory feature is on).

> Rule of thumb: trust them with *words*, check them on *facts*.

## ChatGPT or Claude — which one?

Honestly? For a beginner, either is great, and both have free versions. ChatGPT is the most popular; Claude has a reputation for thoughtful, longer writing. Try both for a day and keep whichever feels nicer to talk to. **Everything in this course works in both**, so you can't really pick wrong.$c$
  ),
  (
    1,
    'Your First Conversation',
    $c$## Getting in

1. Head to **chatgpt.com** (ChatGPT) or **claude.ai** (Claude).
2. Sign up for a free account.
3. You'll see a box that says something like "Message..." — that's where you type.

## Just talk to it

There are no magic words. Type the way you'd ask a clever friend who happens to know a bit about everything:

> Explain how compound interest works, like I'm 12.

Hit Enter, read the reply, and then — this is the bit most people miss — **keep going.** It's a conversation, not a one-shot search.

> Now show me a real example with $1,000 over 5 years.

It remembers everything earlier *in this chat*, so you can nudge it in plain English: "shorter," "a bit more formal," "add an example," "now turn that into an email."

## Starting something new

When you move to an unrelated topic, hit **New chat**. Each chat is a clean slate, which keeps things from getting tangled together.

## Try this now

Open the tool and paste this in:

> Ask me 3 questions about what I do for work, then suggest 3 ways AI could save me time.

Answer its questions and see what it comes back with. That's it — you're already having a real conversation with AI.$c$
  ),
  (
    2,
    '10 Things to Try Today',
    $c$Copy any of these, drop in your own details, and see what happens. Today's goal is *reps*, not perfection.

1. **Summarize** — "Summarize this in 5 bullet points: [paste text]."
2. **Draft an email** — "Write a short, polite email asking my landlord to fix the heating."
3. **Explain simply** — "Explain what an API is, like I'm not technical."
4. **Brainstorm** — "Give me 10 dinner ideas using chicken, rice and basic pantry stuff."
5. **Fix the tone** — "Rewrite this so it sounds friendlier: [paste text]."
6. **Make a plan** — "Give me a simple 1-week plan to start running. I'm a total beginner."
7. **Compare options** — "Pros and cons of leasing vs buying a car if I drive 10k miles a year."
8. **Tidy up notes** — "Turn these messy notes into a clean to-do list: [paste]."
9. **Practice out loud** — "Role-play a job interviewer for a marketing role and ask me 5 questions."
10. **Learn something** — "Teach me the basics of [topic] in 5 minutes, then quiz me."

> If the first answer isn't quite right, don't start over — just tell it what to change.$c$
  ),
  (
    3,
    'How to Get Much Better Answers',
    $c$Most "bad" AI answers come from thin questions. The fix is a simple formula — the more of these four you include, the better the result.

## The R-C-T-F formula

- **Role** — who should it be? *"You're an experienced copywriter."*
- **Context** — the background it needs. *"I run a small bakery for local families."*
- **Task** — exactly what you want. *"Write 3 Instagram captions for our new sourdough."*
- **Format** — how it should look. *"Each under 20 words, friendly, one emoji."*

Stitch those together:

> You're an experienced copywriter. I run a small local bakery for families. Write 3 Instagram captions for our new sourdough — each under 20 words, friendly, with one emoji.

Compare that to a plain "write instagram captions" and you'll feel the difference straight away.

## Three more power moves

- **Show an example.** "Here's one I liked: [example]. Make 3 more in that style."
- **Ask for options.** "Give me 3 versions: one formal, one casual, one bold."
- **Keep steering.** "Make #2 shorter and add a call to action." That back-and-forth is where the good stuff happens.

> You don't need the perfect prompt. Start rough, then steer.$c$
  ),
  (
    4,
    'Common Beginner Mistakes',
    $c$A quick tour of the traps — and how to climb out of each one.

## 1. Treating it like Google
Three keywords get you a bland answer. **Fix:** write a full sentence and give it some context (that's the whole R-C-T-F lesson).

## 2. Giving up after one reply
The first answer is a starting point, not the verdict. **Fix:** refine it — "shorter," "add an example," "try a different angle."

## 3. Trusting facts blindly
It'll state wrong things with a completely straight face. **Fix:** check anything that matters — numbers, names, dates, quotes, and anything legal or medical.

## 4. Being vague
"Make it better" gets you mush. **Fix:** say *how* — "more concise," "warmer," "for someone non-technical."

## 5. One giant messy message
Ten unrelated asks crammed into one go just confuses it. **Fix:** one thing at a time, building on each reply.

## 6. Forgetting who it's for
"Write about budgeting" versus "Write a budgeting tip for a stressed college student." **Fix:** name the audience.

> When an answer lets you down, nine times out of ten the *next message* fixes it — not a fresh chat.$c$
  ),
  (
    5,
    'Privacy & Safety: What Not to Paste',
    $c$AI tools are genuinely useful, but treat them like a smart stranger online — not a safe.

## Don't paste

- Passwords, bank details, card numbers, or ID numbers
- Other people's personal info without their okay
- Confidential work documents, unless your employer says it's fine
- Anything you'd hate to see in a screenshot

## Smart habits

- **Check the settings.** Both tools let you stop your chats being used to train their models. Look under *Settings → Data controls* in ChatGPT, or *Settings* in Claude.
- **Swap in placeholders.** When you only need the writing, replace real names and numbers with fakes.
- **Use the work-approved tool for work data.** Plenty of companies have an approved AI plan with stronger privacy — it's worth asking.

## On accuracy and judgment

- For health, legal, money or safety calls, use AI to *understand your options*, then check with a real expert.
- It sounds confident even when it's wrong. Confidence isn't proof.

> Quick gut-check before you paste: "Would I be okay if this showed up in a screenshot?" If not, leave it out.$c$
  ),
  (
    6,
    'Building an AI Habit That Sticks',
    $c$Knowing how to use AI and actually using it are two different things. Here's how to make it stick.

## Pin it to things you already do

- Writing an email longer than a few lines? Draft it with AI first.
- Staring at a blank page? Ask for an outline before you write a word.
- Got a long article or thread? Summarize it before you dive in.
- Planning your day? Brain-dump everything and let AI sort it out.

## Keep your own prompt list

Start a note on your phone with the prompts that worked well for you. Reusing your own proven prompts is the single biggest time-saver there is — steal shamelessly from past you.

## A simple 7-day challenge

Use AI for **one real task a day** this week:

1. Summarize something long
2. Draft an email
3. Plan your week
4. Brainstorm an idea
5. Rewrite something in a better tone
6. Learn a new topic
7. Automate a small recurring chore — a template or a checklist

By day 7 it stops feeling like a gimmick and starts feeling like a tool you reach for without thinking.

## Where to go from here

You've got the fundamentals now. When you want expert, ready-made prompts for specific jobs — content, outreach, marketing, client work — that's exactly what the prompt libraries in the store are for. But genuinely? You already know enough to start. Go use it.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'chatgpt-claude-for-beginners'
  and not exists (
    select 1 from public.course_lessons cl
    where cl.product_id = p.id and cl.title = v.title
  );
