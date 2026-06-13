-- ============================================================
-- Aiselling — first prompt product: "The Founder's Content Engine"
--
-- A 'prompts' product (delivery_type = 'prompts'): 10 chained prompts that turn
-- one idea into a week of content + the system to repeat it. Buyers browse and
-- copy them at /dashboard/prompts/founder-content-engine.
--
-- Run AFTER 0005_prompt_library.sql. Idempotent: safe to run more than once
-- (re-running adds only prompts whose title is not already present).
-- ============================================================

insert into public.products
  (slug, title, short_desc, long_desc, category, price_usd,
   delivery_type, status, featured)
values
  (
    'founder-content-engine',
    'The Founder''s Content Engine',
    'Turn one idea into a week of content. 10 chained prompts that run your LinkedIn, X and newsletter — without a marketing team.',
    e'## What this is\n\nMost founders know they *should* post consistently. Almost none have a system for it. The Founder''s Content Engine is that system: **10 prompts you run in order**, taking you from "what do I even talk about?" to a full week of publish-ready content and a repeatable weekly rhythm.\n\nThis is not a list of 500 generic prompts. It is a tested, chained workflow — each prompt feeds the next.\n\n## The workflow\n\n1. **Positioning Snapshot** — nail who you help and your point of view\n2. **Content Pillars** — 4–5 themes you''ll own\n3. **Hook Bank** — 20 scroll-stopping openers per topic\n4. **The Signature Post** — a long-form LinkedIn post that sounds like you\n5. **Thread Repurpose** — reshape it for X\n6. **Newsletter Segment** — expand it for email\n7. **Strategic Comments** — borrow other people''s audiences\n8. **Lead Magnet** — convert readers into emails\n9. **Short-Form Video Script** — a 40-second talking-head script\n10. **Weekly Calendar** — assemble it into a 7-day plan\n\n## How to use it\n\nEvery prompt has the parts you fill in marked like `[THIS]`, plus a worked example so you can see exactly what good looks like. Copy, paste into ChatGPT or Claude, swap in your details, and ship. Works with any modern model.\n\n## What you get\n\n- 10 chained, copy-to-use prompts in your dashboard\n- A worked example for each\n- Free updates as models and platforms change\n- Lifetime access · 14-day no-questions refund',
    'prompts',
    39.00,
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
    'Positioning Snapshot',
    'Run this first. It defines who you help and the point of view every later prompt builds on.',
    'Claude / GPT-4o',
    $p$You are a sharp positioning strategist. Help me write a positioning statement and a point of view I can build content around.

About me:
- What I do: [WHAT YOU DO]
- Who I help: [TARGET AUDIENCE]
- The result I help them get: [OUTCOME / TRANSFORMATION]
- A belief I hold that others in my space don't: [CONTRARIAN BELIEF]

Output exactly:
1. A 2-sentence positioning statement (who I help + the outcome + why me).
2. My core point of view in one punchy sentence.
3. Three "enemy" beliefs — common advice in my niche I disagree with, each in one line.

Be specific. No buzzwords, no "leverage", no "synergy".$p$,
    $p$What I do: fractional CFO work. Who I help: bootstrapped SaaS founders. Outcome: predictable cash flow and confident pricing. Belief: most founders raise prices far too late.$p$,
    $p$1. I help bootstrapped SaaS founders turn messy spreadsheets into predictable cash flow and pricing they can defend — without hiring a full finance team. 2. POV: "Your pricing is your fastest growth lever, not a year-end chore." 3. Enemies: "Only hire finance after a raise" · "Discount to win deals" · "Revenue is the metric that matters most."$p$
  ),
  (
    1,
    'Content Pillars',
    'Turns your positioning into 4–5 recurring themes so you never stare at a blank page.',
    'Claude / GPT-4o',
    $p$Based on this positioning, give me my content pillars.

Positioning statement: [PASTE OUTPUT FROM PROMPT 1]
My point of view: [PASTE POV FROM PROMPT 1]

Give me 4–5 content pillars. For each pillar:
- A short name (2–3 words)
- One sentence on what it covers
- 3 example post topics

Pillars should ladder up to my point of view and mix education, opinion, and proof (stories/results).$p$,
    $p$Positioning: I help bootstrapped SaaS founders turn messy finances into predictable cash flow. POV: pricing is your fastest growth lever.$p$,
    $p$1. Pricing Power — how to price for growth. Topics: value-based pricing, when to raise prices, killing discounts. 2. Cash Clarity — runway without panic... 3. Founder Finance Myths... 4. Behind the Numbers (client stories)...$p$
  ),
  (
    2,
    'Hook Bank',
    'Generates 20 scroll-stopping openers for any topic. The hook decides whether the rest gets read.',
    'Claude / GPT-4o',
    $p$You are a direct-response copywriter who writes hooks that stop the scroll.

Topic: [TOPIC]
Audience: [TARGET AUDIENCE]
My point of view: [YOUR POV]

Write 20 first-line hooks for a social post on this topic. Mix these styles: contrarian take, specific number/result, painful relatable moment, bold prediction, "I was wrong about X", and a curiosity gap.

Rules:
- One line each, under 15 words.
- No clickbait I can't back up.
- No emojis, no hashtags.
Number them 1–20.$p$,
    $p$Topic: raising your prices. Audience: SaaS founders. POV: pricing is your fastest growth lever.$p$,
    $p$1. I doubled my prices and lost zero customers. 2. Your cheapest plan is quietly killing your company. 3. "We'll raise prices later" is the most expensive sentence in SaaS. ...$p$
  ),
  (
    3,
    'The Signature Post',
    'Writes a full long-form LinkedIn post in your voice from a single hook and insight.',
    'Claude / GPT-4o',
    $p$Write a long-form LinkedIn post in my voice.

Hook to open with: [PASTE ONE HOOK FROM PROMPT 3]
The core insight: [YOUR MAIN POINT IN 1–2 SENTENCES]
A specific example or story I can use: [STORY / DATA / EXAMPLE]
Audience: [TARGET AUDIENCE]

Structure:
- Open with the hook on its own line.
- 2–4 short paragraphs (1–2 sentences each, lots of white space).
- Include the example so it feels real, not generic.
- End with a one-line takeaway and a soft question to invite comments.

Voice: plain-spoken, confident, no corporate jargon, no "in today's fast-paced world". Don't use hashtags.$p$,
    $p$Hook: "We'll raise prices later" is the most expensive sentence in SaaS. Insight: founders underprice out of fear and leave huge revenue on the table. Story: a client raised prices 40%, churn didn't move, MRR jumped 31% in a quarter.$p$,
    $p$"We'll raise prices later" is the most expensive sentence in SaaS.\n\nA client said it for two years. Then we raised prices 40%.\n\nChurn? Didn't budge. MRR jumped 31% in a quarter...\n\nThe lesson: your customers respect your pricing more than you do.\n\nWhat's stopping you from raising yours?$p$
  ),
  (
    4,
    'Thread Repurpose',
    'Reshapes your signature post into an X / Twitter thread — same idea, native format.',
    'Claude / GPT-4o',
    $p$Turn this post into an X (Twitter) thread.

Post: [PASTE OUTPUT FROM PROMPT 4]

Rules:
- Tweet 1 is a standalone hook that earns the click (under 200 characters).
- 5–8 tweets total, each one idea, each under 260 characters.
- Use line breaks for rhythm; no hashtags, no "a thread 🧵".
- Last tweet: the takeaway + a single clear call to action (follow / reply / link).
Number each tweet.$p$,
    $p$[the signature post from prompt 4]$p$,
    $p$1/ "We'll raise prices later" is the most expensive sentence in SaaS. Here's what happened when one founder finally stopped saying it. 2/ Two years underpriced... 3/ We raised prices 40%... 7/ Your customers respect your pricing more than you do. Follow for more founder finance.$p$
  ),
  (
    5,
    'Newsletter Segment',
    'Expands the same idea into a newsletter section so one insight fuels three channels.',
    'Claude / GPT-4o',
    $p$Expand this post into a newsletter segment (250–400 words).

Post / idea: [PASTE OUTPUT FROM PROMPT 4]
Newsletter name & vibe: [NEWSLETTER NAME / TONE]

Structure:
- A subject line and a one-line preview text.
- A short intro that hooks the reader.
- The main idea with the example, room to go one level deeper than the social post.
- A "try this week" action step.
- A one-line sign-off.

Keep paragraphs short and skimmable.$p$,
    $p$Idea: founders underprice out of fear. Newsletter: "Runway" — practical finance for SaaS founders, friendly and direct.$p$,
    $p$Subject: The $0 growth lever you're ignoring. Preview: It's not ads. Intro: Last week a founder told me... Action: Pull your pricing page up right now and ask one question...$p$
  ),
  (
    6,
    'Strategic Comments',
    'Writes thoughtful comments for bigger creators'' posts — the fastest way to borrow an audience.',
    'Claude / GPT-4o',
    $p$You help me grow by leaving genuinely valuable comments on other people's posts.

The post I'm replying to: [PASTE THE POST]
My expertise / angle: [YOUR ANGLE]

Write 3 comment options that:
- Add a real insight or a specific example, not "great post!".
- Are 2–4 sentences.
- Subtly show my expertise without pitching.
- Sound human and warm, not like an expert flexing.
Label them A, B, C and note the angle of each.$p$,
    $p$Post: a creator argues most startups die from lack of focus. My angle: finance — they die from running out of cash, focus is a symptom.$p$,
    $p$A (build on it): "Focus and cash are the same problem wearing two hats — every unfocused bet is a cash bet..." B (gentle counter): "I'd reframe it slightly..." C (story): "Watched a team with great focus still fold because..."$p$
  ),
  (
    7,
    'Lead Magnet Builder',
    'Turns one content pillar into a free resource that converts readers into email subscribers.',
    'Claude / GPT-4o',
    $p$Help me design a lead magnet from one of my content pillars.

Pillar: [PICK ONE PILLAR FROM PROMPT 2]
Audience: [TARGET AUDIENCE]
What I sell (so the magnet leads toward it): [YOUR OFFER]

Output:
1. Three lead-magnet title options (specific, outcome-focused).
2. For the strongest one: the format (checklist / template / mini-guide / calculator) and why it fits.
3. A bullet outline of its contents.
4. A one-line opt-in pitch I can put under my posts.
Keep it something I can make in an afternoon.$p$,
    $p$Pillar: Pricing Power. Audience: SaaS founders. I sell fractional CFO work.$p$,
    $p$1. "The SaaS Pricing Audit (12 questions)" · "Raise-Your-Prices Checklist" · "The Underpricing Calculator". 2. Best: the calculator — interactive, shows lost revenue. 3. Outline: inputs... 4. Opt-in: "Find out how much revenue your current pricing is leaving on the table — free calculator."$p$
  ),
  (
    8,
    'Short-Form Video Script',
    'Turns your post into a 40-second talking-head script for Reels, Shorts or TikTok.',
    'Claude / GPT-4o',
    $p$Turn this idea into a short-form video script (about 40 seconds, ~110 words).

Idea / post: [PASTE OUTPUT FROM PROMPT 4]

Format:
- HOOK (first 3 seconds): a line that stops the scroll.
- BODY: the idea in 3 quick beats, spoken plainly.
- PAYOFF: the takeaway.
- CTA: one line.

Write it as I'd actually say it out loud — short sentences, no jargon. Add a [B-ROLL / ON-SCREEN TEXT] note in brackets for each beat.$p$,
    $p$[the signature post about raising prices]$p$,
    $p$HOOK: "Raising your prices won't lose you customers. Here's proof." [ON-SCREEN: +40% price] BODY: One client waited two years... [B-ROLL: dashboard] PAYOFF: Your customers respect your pricing more than you do. CTA: Follow for founder finance that actually moves the needle.$p$
  ),
  (
    9,
    'Weekly Content Calendar',
    'Assembles everything above into a publish-ready 7-day plan you can repeat every week.',
    'Claude / GPT-4o',
    $p$Build me a 7-day content calendar.

My pillars: [PASTE PILLARS FROM PROMPT 2]
Channels I post on: [e.g. LinkedIn daily, X 3x/week, newsletter weekly]
Time I have per day: [e.g. 30 minutes]

Output a day-by-day table (Mon–Sun) with: the channel, the pillar, the post format (signature post / thread / story / engagement / video), and a specific topic idea for each slot. Keep it realistic for my time budget, and mark one "batch creation" block where I make several at once.$p$,
    $p$Pillars: Pricing Power, Cash Clarity, Founder Myths, Client Stories. Channels: LinkedIn daily, X 3x/week, newsletter Friday. Time: 30 min/day.$p$,
    $p$Mon — LinkedIn signature post (Pricing Power): "When to raise prices". Tue — X thread + 3 strategic comments... Fri — Newsletter (batch block, 60 min): repurpose the week's best post. Sun — plan + draft next week.$p$
  )
) as v(sort_order, title, description, model,
       prompt_body, example_input, example_output)
where p.slug = 'founder-content-engine'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  description = excluded.description,
  model = excluded.model,
  prompt_body = excluded.prompt_body,
  example_input = excluded.example_input,
  example_output = excluded.example_output;
