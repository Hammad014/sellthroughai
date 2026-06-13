-- ============================================================
-- Aiselling — course product: "Prompt Engineering Fundamentals"
--
-- A 'gated' course (delivery_type='gated', category='courses'): 7 markdown
-- lessons in course_lessons, read at /dashboard/courses/prompt-engineering-fundamentals.
-- Teaches buyers to write their own great prompts — a natural cross-sell with
-- the prompt-pack products.
--
-- Apostrophe rules: inside $c$...$c$ use normal contractions (don't, it's);
-- inside the e'...' long_desc and '...' short_desc, double them (don''t).
--
-- UPSERT: re-pasting updates content and never duplicates.
-- Run AFTER 0006_seed_upsert_keys.sql. Idempotent.
-- ============================================================

insert into public.products
  (slug, title, short_desc, long_desc, category, price_usd,
   delivery_type, status, featured)
values
  (
    'prompt-engineering-fundamentals',
    'Prompt Engineering Fundamentals',
    'Stop guessing, start steering. Learn to write prompts that get great answers every time — a practical skill you''ll use with every AI tool, forever.',
    e'## What this is\n\nBuying prompt packs is great. Knowing how to write your own is a superpower. This course teaches the actual skill — the small, repeatable moves that turn a vague request into a precise instruction the AI nails on the first try.\n\nNot theory. Not jargon. Just how prompting really works and how to do it well, with side-by-side before/after examples in every lesson.\n\n## What you''ll learn\n\n- How an AI model actually reads your prompt (and why that changes everything)\n- The 4-part anatomy of a great prompt\n- How to use examples to get exactly the style you want\n- Controlling tone, length and format\n- Chaining prompts into real workflows\n- Debugging a bad answer instead of starting over\n- A reusable template + checklist you''ll keep using\n\n## How it works\n\nSeven short lessons you can read in a sitting, each with copy-paste examples. Works with ChatGPT, Claude or any modern assistant — the skill transfers everywhere.\n\nLifetime access · free updates · 14-day no-questions refund.',
    'courses',
    39.00,
    'gated',
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

insert into public.course_lessons
  (product_id, sort_order, title, content_md)
select p.id, v.sort_order, v.title, v.content_md
from public.products p
cross join (values
  (
    0,
    'How AI Actually Reads Your Prompt',
    $c$To write good prompts, it helps to know what's happening under the hood — and it's simpler than people make it sound.

## It predicts, it doesn't "understand"

An AI model reads your text and predicts what words should come next, based on patterns from a huge amount of writing. That's it. It has no idea what you *meant* — only what you actually typed. So being clear and complete isn't politeness; it's the whole game.

## Three things that follow from this

- **It only knows what's in front of it.** The model can't see your screen, your files, or last week's chat. If it needs context, you have to put it in the prompt.
- **Vague in, vague out.** "Write something about marketing" could mean a thousand things, so you get a bland average of all of them. Specific in, specific out.
- **Recent and explicit instructions win.** If you bury the real ask in a wall of text, it can get lost. Put what matters clearly.

## The mindset shift

Stop thinking "search box," start thinking "delegating to a sharp new assistant who's brilliant but has zero context about you." You wouldn't tell a new hire "do the report" and walk off. You'd say what, for whom, by when, in what format. Same here.

> Everything else in this course is just practical ways to be clearer. That's all prompting really is.$c$
  ),
  (
    1,
    'The Anatomy of a Great Prompt',
    $c$Almost every strong prompt has four parts. Miss them and you get guesswork; include them and the quality jumps. Remember it as **R-C-T-F**.

## Role
Tell it who to be. This sets the perspective and vocabulary.
> "You're an experienced email copywriter."

## Context
Give it the background it can't know.
> "I run a small skincare brand. My customers are women in their 30s who care about clean ingredients."

## Task
Say exactly what you want — be concrete.
> "Write a welcome email for new subscribers who just got 15% off."

## Format
Describe what the output should look like.
> "Under 120 words, warm but not gushy, one clear call to action, no emojis."

## Put together

> You're an experienced email copywriter. I run a small clean-skincare brand; my customers are women in their 30s. Write a welcome email for new subscribers who got 15% off — under 120 words, warm, one clear CTA, no emojis.

## Before vs after

- **Before:** "write a welcome email" → generic, could be for anyone.
- **After:** the prompt above → on-brand, right length, ready to send.

You won't always need all four — but when an answer disappoints, the fix is almost always a missing R, C, T, or F.

> Try it: take your last weak prompt and add the three parts you skipped.$c$
  ),
  (
    2,
    'Show, Don''t Just Tell (Examples)',
    $c$Here's the single highest-leverage trick in prompting: **give the AI an example of what you want.** Describing a style is okay; showing one is far better. (The fancy term is "few-shot prompting" — you're giving it a few shots at the pattern.)

## Why it works

The model is a pattern-matcher. Hand it a pattern and it'll follow it closely — tone, structure, length, the lot. Words like "make it punchy" are fuzzy; an actual punchy example is not.

## How to do it

> Here are two product taglines I love:
> - "Sleep like it's your job."
> - "Coffee that doesn't quit."
>
> Write 5 more in that exact style for a [PRODUCT].

Or for structure:

> Rewrite my bio to match the style of this one: [paste a bio you admire]. Here's mine: [paste yours].

## A couple of tips

- **One to three examples is plenty.** More rarely helps and just costs you typing.
- **Make examples match what you actually want.** The AI copies what you show, flaws included — so show your best.
- **Mix it with R-C-T-F.** Examples + a clear task is the strongest combo there is.

> When you can't get the *style* right by describing it, stop describing and start showing.$c$
  ),
  (
    3,
    'Controlling Tone, Length & Format',
    $c$Once the content is right, these three controls make the output actually usable without a rewrite.

## Length
Be specific — "short" is in the eye of the model.
> "In exactly 3 bullet points." · "Under 50 words." · "A single paragraph."

## Tone
Name the feeling, and who it's for.
> "Friendly and plain, for someone non-technical." · "Confident and direct, no hype." · "Warm but professional."

## Format
This is the one people forget, and it's a huge time-saver. Ask for the exact shape you need:
> "As a table with columns: option, pros, cons." · "As a numbered checklist." · "As ready-to-send email text." · "As JSON with keys title and summary."

## Negative constraints

Telling it what to *avoid* is just as powerful:
> "No jargon. No clichés like 'game-changer'. Don't start with 'In today's world'."

## Put it to work

> Summarize this report for a busy exec who hates fluff. Format: 3 bullets max, under 60 words total, plain language, no buzzwords. Report: [paste]

The difference between a reply you have to reformat and one you can paste straight into your work is usually right here.

> Rule of thumb: if you find yourself editing the *shape* of every answer, you forgot to specify the format.$c$
  ),
  (
    4,
    'Chaining Prompts Into Workflows',
    $c$Big tasks go wrong when you cram them into one giant prompt. The pros break the work into steps and feed each result into the next. This is "chaining," and it's how you get real work done.

## Why one mega-prompt fails

Ask for "research my competitors, write a strategy, and draft 5 posts" in one go and you'll get a shallow pass at all three. The model spreads its effort thin and you can't course-correct.

## Chain it instead

Do it as a conversation, one link at a time:

1. **Research:** "List my top 5 competitors and their main angle."
2. **Synthesize:** "From that, what gap could I own?"
3. **Plan:** "Turn that gap into 3 content themes."
4. **Create:** "Write 2 posts for theme #1."

Each step builds on the last (the chat remembers), and you can fix a wrong turn before it pollutes everything downstream.

## A reliable pattern

For almost any creative task: **Outline → Draft → Edit.**
> "Outline a blog post on X." → (tweak it) → "Write the draft from this outline." → "Now tighten it and improve the intro."

You'll get dramatically better results than asking for the finished post in one shot.

> When an output feels shallow, you probably asked for too much at once. Break it into links.$c$
  ),
  (
    5,
    'Debugging a Bad Answer',
    $c$A weak answer isn't failure — it's information. Nine times out of ten the *next message* fixes it, no need to start over. Here's how to diagnose what went wrong.

## Match the symptom to the fix

- **Too generic?** It's missing context or an example. Add who it's for and show a sample.
- **Wrong format?** You didn't specify the shape. "Redo as a 3-bullet list."
- **Too long / rambling?** Add a limit. "Cut this to under 80 words."
- **Wrong tone?** Name it. "More casual, like texting a friend."
- **It made something up?** Give it the source and add: "Only use the text I pasted. If it's not there, say 'not stated'."
- **Missed part of the ask?** Don't re-explain everything — just point: "Good, but you skipped the pricing section. Add it."

## Steer, don't restart

Treat it like editing with a collaborator:
> "Closer. Keep the structure, but make the opening punchier and drop the last paragraph."

Starting a brand-new chat throws away all the context you've built. Refine in place unless you're truly changing topics.

## The honesty instruction

For anything factual, add this and thank yourself later:
> "If you're not sure, say so instead of guessing."

> A bad first answer is a draft. Your job isn't to accept it or trash it — it's to direct the next one.$c$
  ),
  (
    6,
    'Your Reusable Prompt Template & Checklist',
    $c$You now know the moves. Here's how to make them automatic so you're not reinventing prompts all day.

## The fill-in-the-blank template

Keep this somewhere handy and adapt it:

> **Role:** You're a [ROLE].
> **Context:** [WHAT THE AI NEEDS TO KNOW ABOUT MY SITUATION]
> **Task:** [EXACTLY WHAT I WANT]
> **Format:** [LENGTH, STRUCTURE, TONE]
> **Avoid:** [ANYTHING IT SHOULD NOT DO]
> (Optional) **Example of what good looks like:** [PASTE ONE]

## The 20-second pre-send checklist

Before you hit Enter, glance over:

1. Did I say **who** it's for?
2. Did I give the **context** it can't know?
3. Is the **task** specific?
4. Did I specify the **format**?
5. Could an **example** make this clearer?

If a future answer disappoints, walk back through these five — the gap is almost always one of them.

## Build your own library

Every time a prompt works really well, save it to a note. Reusing your own proven prompts is the biggest time-saver there is — you're building a personal toolkit that compounds.

## Where to go next

You can now write strong prompts from scratch. When you'd rather skip straight to expert, ready-made ones for specific jobs — content, outreach, marketing, client work — that's exactly what the prompt libraries in the store are built for. Now you'll also know how to tweak them to fit you perfectly.

> The skill you just learned works with every AI tool that exists — and every one that's coming.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'prompt-engineering-fundamentals'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
