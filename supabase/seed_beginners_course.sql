-- ============================================================
-- Aiselling — course product: "ChatGPT & Claude for Total Beginners"
--
-- A 'gated' product (delivery_type = 'gated', category = 'courses'): 7 text
-- lessons authored as markdown in course_lessons. Buyers read them in the
-- course player at /dashboard/courses/chatgpt-claude-for-beginners.
-- No video uploads required — fully self-contained.
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
    'Never really used AI? Start here. 7 short, plain-English lessons that take you from "I have no idea" to confidently using ChatGPT and Claude every day.',
    e'## Who this is for\n\nIf you keep hearing that AI will change everything but you have barely opened ChatGPT — this is for you. No tech background needed. No jargon. Just 7 short lessons that get you genuinely comfortable using AI for everyday work and life.\n\n## What you will learn\n\n- What ChatGPT and Claude actually are (and what they are not)\n- How to have your first real conversation\n- 10 things to try on day one\n- The simple formula for getting far better answers\n- The beginner mistakes that waste your time\n- What is safe to share — and what is not\n- How to build an AI habit that sticks\n\n## How it works\n\nSeven bite-sized lessons you can read in an afternoon, each with examples you can copy and try immediately. Everything works in both ChatGPT and Claude, on the free plans.\n\nLifetime access · free updates · 14-day no-questions refund.',
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

ChatGPT (made by OpenAI) and Claude (made by Anthropic) are **AI assistants you talk to in plain English**. You type a question or request; they write back. Think of a fast, well-read assistant who can draft, explain, summarize, brainstorm and plan — instantly.

They are *not* search engines, and they are *not* always right. They predict the most helpful-sounding response based on patterns in huge amounts of text. That makes them brilliant with language and occasionally confidently wrong about facts.

## What they are great at

- Writing and rewriting (emails, posts, documents)
- Explaining things simply
- Summarizing long text
- Brainstorming ideas
- Planning and organizing
- Turning messy notes into something clear

## What to watch out for

- **They can make things up.** This is called "hallucination." Always double-check facts, names, numbers and quotes.
- **They may not know recent events** unless web access is switched on.
- **They do not remember you** between separate chats (unless a memory feature is on).

> Rule of thumb: trust them with *words*, verify them on *facts*.

## ChatGPT or Claude — which one?

For a beginner, either is great, and both have free versions. ChatGPT is the most popular; Claude is loved for thoughtful, longer writing. Try both and use whichever feels better — **everything in this course works in both.**$c$
  ),
  (
    1,
    'Your First Conversation',
    $c$## Getting in

1. Go to **chatgpt.com** (ChatGPT) or **claude.ai** (Claude).
2. Sign up for a free account.
3. You will see a box that says something like "Message..." — that is where you type.

## Just talk to it

You do not need special words. Type the way you would ask a knowledgeable friend:

> Explain how compound interest works, like I am 12.

Press Enter, read the reply, and then — this is the important part — **keep going.** It is a conversation, not a single search.

> Now show me a real example with $1,000 over 5 years.

The AI remembers everything earlier *in this chat*, so you can refine in plain English: "shorter," "more formal," "add an example," "now turn it into an email."

## Starting a fresh topic

When you switch to something unrelated, start a **New chat** (there is a button for it). Each chat is its own clean slate — this keeps things from getting muddled.

## Try this now

Open the tool and paste:

> Ask me 3 questions about what I do for work, then suggest 3 ways AI could save me time.

Answer its questions and see what it suggests. Congratulations — you are already having a real AI conversation.$c$
  ),
  (
    2,
    '10 Things to Try Today',
    $c$Copy any of these, swap in your own details, and see what happens. The goal today is *reps*, not perfection.

1. **Summarize** — "Summarize this in 5 bullet points: [paste text]."
2. **Draft an email** — "Write a polite email asking my landlord to fix the heating. Keep it short."
3. **Explain simply** — "Explain what an API is, like I am not technical."
4. **Brainstorm** — "Give me 10 dinner ideas using chicken, rice and whatever is common in a pantry."
5. **Rewrite the tone** — "Rewrite this to sound friendlier: [paste text]."
6. **Make a plan** — "Make me a simple 1-week plan to start running, I am a total beginner."
7. **Compare options** — "Pros and cons of leasing vs buying a car for someone who drives 10k miles a year."
8. **Turn notes into something** — "Turn these messy notes into a clean to-do list: [paste]."
9. **Practice a conversation** — "Role-play a job interviewer for a marketing role and ask me 5 questions."
10. **Learn something** — "Teach me the basics of [topic] in 5 minutes, then quiz me."

> Tip: if the first answer is not quite right, do not start over — just tell it what to change.$c$
  ),
  (
    3,
    'How to Get Much Better Answers',
    $c$Most "bad" AI answers come from thin requests. The fix is a simple formula. The more of these four you include, the better the result:

## The R-C-T-F formula

- **Role** — who should the AI be? *"You are an experienced copywriter."*
- **Context** — the background it needs. *"I run a small bakery. My customers are local families."*
- **Task** — exactly what you want. *"Write 3 Instagram captions for our new sourdough."*
- **Format** — how the answer should look. *"Each under 20 words, friendly, with one emoji."*

Put together:

> You are an experienced copywriter. I run a small local bakery for families. Write 3 Instagram captions for our new sourdough — each under 20 words, friendly, one emoji each.

Compare that to just "write instagram captions" and you will feel the difference immediately.

## Three more power moves

- **Give an example.** "Here is one I liked: [example]. Make 3 more like it."
- **Ask for options.** "Give me 3 versions: one formal, one casual, one bold."
- **Iterate.** "Make #2 shorter and add a call to action." Keep refining — that is where the magic is.

> You do not have to nail the perfect prompt. Start rough, then steer.$c$
  ),
  (
    4,
    'Common Beginner Mistakes',
    $c$A quick tour of the traps — and the fix for each.

## 1. Treating it like Google
Typing 3 keywords gets you a generic answer. **Fix:** write a full sentence and give context (see the R-C-T-F lesson).

## 2. Giving up after one reply
The first answer is a starting point, not the final word. **Fix:** refine it — "shorter," "add an example," "different angle."

## 3. Trusting facts blindly
It can state wrong things with total confidence. **Fix:** verify anything important — numbers, names, dates, quotes, legal or medical info.

## 4. Vague requests
"Make it better" gives weak results. **Fix:** say *how* — "more concise," "warmer tone," "for a non-technical reader."

## 5. One giant messy prompt
Cramming ten unrelated asks into one message confuses it. **Fix:** do one thing at a time, build on each reply.

## 6. Not telling it who it is for
"Write about budgeting" vs "Write a budgeting tip for a stressed college student." **Fix:** name the audience.

> If an answer disappoints you, 9 times out of 10 the next message — not a new chat — fixes it.$c$
  ),
  (
    5,
    'Privacy & Safety: What Not to Paste',
    $c$AI tools are useful, but treat them like a smart stranger on the internet, not a vault.

## Do not paste

- Passwords, bank details, card numbers, or government IDs
- Other people personal data without their okay
- Confidential work documents, unless your employer allows it
- Anything you would not be comfortable leaving on a shared computer

## Good habits

- **Check the settings.** Both tools let you turn off using your chats to train their models. Look under *Settings → Data controls* (ChatGPT) or *Settings* (Claude).
- **Anonymize.** Swap real names and numbers for placeholders when you just need the writing, not the specifics.
- **Use a work-approved tool for work data.** Many companies have an approved AI plan with stronger privacy — ask.

## A note on accuracy and judgment

- For health, legal, money or safety decisions, use AI to *understand options*, then confirm with a qualified human.
- The AI sounds confident even when wrong. Confidence is not proof.

> Simple test before pasting: "Would I be fine if this showed up in a screenshot?" If not, leave it out.$c$
  ),
  (
    6,
    'Building an AI Habit That Sticks',
    $c$Knowing how to use AI is not the same as actually using it. Here is how to make it automatic.

## The trigger trick

Attach AI to things you already do:

- About to write any email longer than 3 lines? Draft it with AI first.
- Facing a blank page? Ask for an outline before you write.
- Got a long article or thread? Summarize it before reading in full.
- Planning your day or week? Brain-dump and ask AI to organize it.

## Start a personal prompt list

Keep a note (phone or doc) of prompts that worked well for you. Reusing your own proven prompts is the single biggest time-saver. Steal shamelessly from your past self.

## A simple 7-day challenge

Use AI for **one real task a day** this week:

1. Summarize something long
2. Draft an email
3. Plan your week
4. Brainstorm an idea
5. Rewrite something in a better tone
6. Learn a new topic
7. Automate a small recurring chore (a template, a checklist)

By day 7 it stops feeling like a novelty and starts feeling like a tool.

## Where to go next

You now have the fundamentals. When you want ready-made, expert prompts for specific jobs — content, outreach, marketing, client work — that is exactly what the prompt libraries in the store are for. But honestly? You already know enough to start. Go use it.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'chatgpt-claude-for-beginners'
  and not exists (
    select 1 from public.course_lessons cl
    where cl.product_id = p.id and cl.title = v.title
  );
