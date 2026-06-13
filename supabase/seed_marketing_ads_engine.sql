-- ============================================================
-- Aiselling — prompt product: "The Marketing & Ads Engine"
--
-- A 'prompts' product: 10 prompts that take an offer from raw angle to running
-- ads, landing pages and email funnels that convert.
-- Buyers browse/copy at /dashboard/prompts/marketing-ads-engine.
--
-- Run AFTER 0005_prompt_library.sql. Idempotent.
-- ============================================================

insert into public.products
  (slug, title, short_desc, long_desc, category, price_usd,
   delivery_type, status, featured)
values
  (
    'marketing-ads-engine',
    'The Marketing & Ads Engine',
    'Write ads, landing pages and email funnels that convert. 10 prompts that turn one offer into a full campaign — without an agency.',
    e'## What this is\n\nGreat marketing isn''t about clever words — it''s about saying the right thing to the right person at the right moment. The Marketing & Ads Engine is **10 prompts** that take you from a raw offer to a running campaign: the angle, the ads, the landing page, and the emails that follow up.\n\nBuilt for marketers, ecommerce owners and founders running their own growth.\n\n## The campaign, end to end\n\n1. **Offer & Angle Generator** — find the hook that sells\n2. **Customer Research Synthesizer** — turn reviews into copy gold\n3. **Facebook / Instagram Ads** — 3 angles, ready to test\n4. **Google Search Ads** — headlines + descriptions that win the click\n5. **Landing Page** — hero to CTA, structured to convert\n6. **Headline & Hook Bank** — 20 openers for any asset\n7. **Welcome Email Sequence** — turn new subscribers into buyers\n8. **Abandoned-Cart Sequence** — recover the sales you''re losing\n9. **Product Description Writer** — PDPs that actually sell\n10. **Campaign Diagnoser** — figure out why it isn''t converting\n\n## How to use it\n\nFill in the `[BRACKETED]` parts, paste into ChatGPT or Claude, and ship. Every prompt includes a worked example. Works with any modern model.\n\nLifetime access · free updates · 14-day no-questions refund.',
    'prompts',
    49.00,
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
    'Offer & Angle Generator',
    'Run this first. The angle — the reason someone should care right now — matters more than the words. This finds it.',
    'Claude / GPT-4o',
    $p$You are a direct-response marketing strategist. Help me find the strongest angle for my offer.

What I sell: [PRODUCT/SERVICE]
Who it is for: [TARGET CUSTOMER]
The main result it delivers: [OUTCOME]
What is special about it vs alternatives: [DIFFERENTIATOR]

Output:
1. Five distinct marketing angles (e.g. status, fear, speed, identity, problem-aware vs unaware). One line each.
2. The single angle you would lead with and why.
3. A one-sentence "big idea" that ties the campaign together.
4. The core promise, phrased so the customer instantly gets the payoff.
No fluff, no buzzwords.$p$,
    $p$I sell a meal-prep service for busy parents. Outcome: healthy dinners with zero planning. Differentiator: kid-approved menus, 5-min reheat.$p$,
    $p$1. Speed: "Dinner solved in 5 minutes." Identity: "Be the parent who feeds them well without the stress." Fear: "Stop defaulting to takeout." ... 2. Lead with identity + speed. 3. Big idea: reclaim weeknights. 4. Promise: healthy dinners your kids will actually eat, with zero planning.$p$
  ),
  (
    1,
    'Customer Research Synthesizer',
    'Turn reviews, survey answers and support messages into the exact words your customers use — the best source of copy there is.',
    'Claude / GPT-4o',
    $p$You are a voice-of-customer researcher. Mine this raw feedback for copy I can use.

Raw feedback (reviews, survey answers, support tickets): [PASTE FEEDBACK]
What I sell: [PRODUCT]

Output:
1. Top 3 desires/outcomes customers mention, in their own words (quote them).
2. Top 3 pains or objections, in their own words.
3. The exact phrases that come up repeatedly (I will reuse these verbatim).
4. 3 headline ideas built from real customer language.
Stick to what is actually in the feedback — do not invent quotes.$p$,
    $p$Reviews: "finally something my picky 6yo eats", "I was so done with cooking after work", "wish it was a bit cheaper", "reheats faster than delivery".$p$,
    $p$1. Desires: "something my picky kid eats", "done with cooking after work", "faster than delivery". 2. Pains: price sensitivity. 3. Repeated phrases: "picky eater", "after work", "faster than delivery". 4. Headlines: "Even your pickiest eater will clear the plate" ...$p$
  ),
  (
    2,
    'Facebook / Instagram Ad Copy',
    'Writes three distinct ad variants so you can test angles instead of betting everything on one.',
    'Claude / GPT-4o',
    $p$Write Facebook/Instagram ad copy I can test.

Product: [PRODUCT]
Audience: [WHO]
Lead angle: [ANGLE FROM PROMPT 1]
Offer / CTA: [WHAT THEY GET + ACTION]

Give me 3 ad variants, each with: a scroll-stopping primary text (50-120 words), a headline (under 8 words), and a description line. Make the three meaningfully different (e.g. story, problem-solution, social proof). Hook in the first line, one clear CTA, no clickbait I cannot back up, no emoji walls.$p$,
    $p$Product: meal-prep for busy parents. Angle: reclaim weeknights. Offer: first box 40% off.$p$,
    $p$Variant 1 (story): "6pm. Everyone's hungry. You're staring into the fridge again..." H: Weeknights, solved. Variant 2 (problem-solution): "Takeout 4 nights a week isn't a meal plan..." Variant 3 (social proof): "12,000 parents stopped the dinner scramble..." (each CTA: Get 40% off your first box)$p$
  ),
  (
    3,
    'Google Search Ad Variants',
    'Writes high-intent search ads — headlines and descriptions built around what people actually type.',
    'Claude / GPT-4o',
    $p$Write Google Search ads for high-intent buyers.

Product/service: [PRODUCT]
What people search to find this: [KEYWORDS / SEARCH INTENT]
Offer + landing page promise: [OFFER]

Output (responsive search ad format):
- 10 headlines (max 30 characters each), mixing the keyword, the benefit, and the offer.
- 4 descriptions (max 90 characters each).
- Note which 3 headlines to pin first.
Match the searcher's intent, include the keyword naturally, and make the value obvious. Stay within the character limits.$p$,
    $p$Product: meal-prep delivery. Searches: "healthy meal prep delivery", "family meal kit". Offer: 40% off first box.$p$,
    $p$Headlines: "Healthy Meal Prep Delivered" · "Family Meal Kit, 40% Off" · "Dinner Ready in 5 Minutes" ... Descriptions: "Kid-approved meals, zero planning. 40% off your first box. Free delivery." ... Pin first: 1, 2, 3.$p$
  ),
  (
    4,
    'Landing Page Builder',
    'Structures a full landing page — hero to final CTA — in the order that actually converts.',
    'Claude / GPT-4o',
    $p$Write a landing page that converts cold traffic.

Product: [PRODUCT]
Audience + their main pain: [WHO + PAIN]
Lead angle/promise: [ANGLE FROM PROMPT 1]
Proof I have: [TESTIMONIALS, NUMBERS, GUARANTEES]
Offer + CTA: [OFFER]

Write these sections in order: 1) Hero (headline, subhead, CTA), 2) The problem (agitate), 3) The solution (how it works in 3 steps), 4) Benefits (not features), 5) Proof/social proof, 6) Objection-handling FAQ (4 Qs), 7) Final CTA with risk-reversal. Keep it skimmable; lead with benefit, support with proof.$p$,
    $p$Product: meal-prep. Pain: weeknight dinner stress. Proof: 12k families, 4.8 stars, cancel anytime. Offer: 40% off first box.$p$,
    $p$Hero: "Healthy dinners your kids will eat — in 5 minutes." Subhead + CTA. Problem: "By 6pm you're out of energy and ideas..." Solution: pick → delivered → reheat. Benefits, proof (12k families/4.8★), FAQ (price, picky eaters, cancel, delivery), Final CTA: "Get 40% off — cancel anytime."$p$
  ),
  (
    5,
    'Headline & Hook Bank',
    'Generates 20 headlines/hooks for any asset — ads, emails, pages — so you never ship the first one you think of.',
    'Claude / GPT-4o',
    $p$Write a bank of headlines/hooks for me to test.

What it is for: [AD / EMAIL / LANDING PAGE]
Product + audience: [PRODUCT, WHO]
Main benefit: [BENEFIT]

Give me 20 headlines across these styles: benefit-driven, curiosity gap, specific number/result, question, contrarian, and "how to without [pain]". Rules: clear over clever, under 12 words, no clickbait I cannot deliver. Mark the 5 strongest.$p$,
    $p$For: ads. Product: meal-prep for busy parents. Benefit: healthy dinners with zero planning.$p$,
    $p$1. Healthy dinners, zero planning. 2. The end of the 6pm scramble. 3. What 12,000 parents stopped doing. 4. Dinner in 5 minutes, not 50. ... ★ strongest: 1, 2, 4, 7, 12.$p$
  ),
  (
    6,
    'Welcome Email Sequence',
    'Turns new subscribers into first-time buyers with a 5-email sequence that builds trust before it sells.',
    'Claude / GPT-4o',
    $p$Write a 5-email welcome sequence for new subscribers.

What they signed up for: [LEAD MAGNET / LIST]
What I sell: [OFFER]
Brand voice: [TONE]

For each email give: send timing, goal, subject line, preview text, and the body (under 150 words). Arc: 1) deliver + welcome, 2) story/why we exist, 3) teach something useful, 4) handle the top objection + soft offer, 5) clear offer with a reason to act now. Sound human, one CTA per email, value before the ask.$p$,
    $p$Signed up for: a free weeknight meal-planner PDF. Offer: meal-prep subscription, 40% off first box. Voice: warm, no-nonsense.$p$,
    $p$E1 (now): deliver the PDF + welcome. E2 (+1d): why we started (parent burnout). E3 (+2d): "the 3-ingredient rule" tip. E4 (+3d): "is it worth it?" + soft offer. E5 (+5d): 40% off, ends Sunday. (subjects + bodies included)$p$
  ),
  (
    7,
    'Abandoned-Cart Sequence',
    'Recovers the buyers who almost purchased — usually the highest-ROI emails you can send.',
    'Claude / GPT-4o',
    $p$Write a 3-email abandoned-cart sequence.

Product: [PRODUCT]
Common reasons people hesitate: [PRICE / TRUST / SHIPPING / TIMING]
Any incentive I can offer: [DISCOUNT / FREE SHIPPING / NONE]

For each email give: timing, subject, preview, and body (under 120 words). Arc: 1) friendly reminder (+1h), 2) handle the main objection + add proof (+24h), 3) urgency or incentive (+48h). Keep it helpful, not desperate; one CTA back to the cart each time.$p$,
    $p$Product: meal-prep box. Hesitation: price + "will my kids eat it". Incentive: free shipping on first box.$p$,
    $p$E1 (+1h): "You left dinner in your cart" — gentle nudge. E2 (+24h): "Worried they won't eat it?" — picky-eater guarantee + reviews. E3 (+48h): "Free shipping ends tonight" — incentive + CTA.$p$
  ),
  (
    8,
    'Product Description Writer',
    'Writes ecommerce product descriptions that sell the outcome, not just list specs.',
    'Claude / GPT-4o',
    $p$Write a product description that sells.

Product + key features: [PRODUCT, FEATURES]
Who it is for: [CUSTOMER]
Main benefit + the feeling they want: [BENEFIT/FEELING]

Output:
1. A benefit-led headline.
2. A short, scannable description (60-100 words) that turns each feature into a benefit.
3. A bulleted "what you get" list.
4. One line that handles the most likely objection.
Write for the customer's desire, not the spec sheet. SEO-friendly but human.$p$,
    $p$Product: meal-prep box, 6 dinners, kid-tested, 5-min reheat. For: busy parents. Feeling: calm, in-control weeknights.$p$,
    $p$Headline: "Six weeknight dinners, zero stress." Description: turns "5-min reheat" into "more time at the table, less at the stove"... What you get: 6 chef-designed dinners, kid-tested recipes, recyclable packaging. Objection: "Picky eater? Swap any meal, free."$p$
  ),
  (
    9,
    'Campaign Diagnoser',
    'Pinpoints WHY a campaign is underperforming — so you fix the real bottleneck instead of guessing.',
    'Claude / GPT-4o',
    $p$Diagnose why my campaign is not converting.

The funnel + numbers: [TRAFFIC, CTR, LANDING PAGE VISITS, CONVERSION RATE, SPEND, SALES]
What I am running: [AD + OFFER + LANDING PAGE SUMMARY]

Output:
1. Where the funnel is leaking the most (be specific: hook, click, page, or offer).
2. The likely root cause of that leak.
3. The top 3 fixes to test, in priority order, with what to change exactly.
4. The one metric to watch to know if the fix worked.
Reason from the numbers; if data is missing to be sure, say what to track.$p$,
    $p$10k impressions, 1.2% CTR, 120 visits, 0.8% conversion, $300 spend, 1 sale. Ad: speed angle. Page: feature-heavy, price high on hero.$p$,
    $p$1. Biggest leak: the landing page (decent CTR, near-zero conversion). 2. Cause: price shown before value; features not benefits. 3. Fixes: (a) lead page with the outcome + proof, move price below value, (b) add risk-reversal, (c) match page headline to the ad. 4. Watch: landing-page conversion rate.$p$
  )
) as v(sort_order, title, description, model,
       prompt_body, example_input, example_output)
where p.slug = 'marketing-ads-engine'
  and not exists (
    select 1 from public.product_prompts pp
    where pp.product_id = p.id and pp.title = v.title
  );
