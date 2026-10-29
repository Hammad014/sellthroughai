-- ============================================================
-- Makeready — course product: "Build Your First AI Agent (No Code)"
--
-- A 'gated' course (delivery_type='gated', category='courses'): 9 lessons
-- (course_lessons) + course files (product_files: a .zip with 3 example
-- agents and the system-prompt template, plus each agent on its own) at
-- /dashboard/courses/build-your-first-ai-agent.
--
-- The agent files and store images are generated from code:
--   node scripts/automation/build.mjs course
--   node scripts/automation/publish.mjs course
-- This seed only holds the copy, so re-pasting it never touches those.
--
-- Seeded as a DRAFT: publish it in /admin once the files are uploaded and
-- checkout is set up.
--
-- UPSERT: re-pasting updates content and never duplicates. Preserves admin
-- fields (status, featured, ls_variant_id, cover_image_url, gallery).
-- Run AFTER 0006_seed_upsert_keys.sql and 0008_product_gallery.sql.
-- ============================================================

insert into public.products
  (slug, title, short_desc, long_desc, category, price_usd,
   delivery_type, status, featured)
values
  (
    'build-your-first-ai-agent',
    'Build Your First AI Agent (No Code)',
    $d$A practical mini-course: build AI agents in n8n that use tools, remember context and work with your real Gmail and Calendar, safely. 9 lessons and 3 working agents to import. No coding.$d$,
    $d$## From "what's an agent?" to one that works for you

Everyone's talking about AI agents. Most tutorials either stay vague ("agents will change everything") or jump straight into Python. This course sits in the middle: you build real, useful agents in **n8n**, a visual tool, step by step, and you understand exactly what each piece does.

By the end you'll have three agents running and the know-how to design your own.

## What you'll build

1. **Research Buddy**: looks things up on Wikipedia, does maths with a calculator instead of guessing, and plans before it answers
2. **Inbox Assistant**: searches your Gmail and writes replies as drafts (it can't send, on purpose)
3. **Calendar Assistant**: checks your week, finds free time and books events after you say yes

All three come as ready-to-import files, so you can follow along or skip ahead.

## What you'll learn

- What an agent actually is: a model, tools, memory and instructions, and when you *don't* need one
- How agents choose tools, and how to write tool descriptions they understand
- A fill-in-the-blanks **system prompt template** for reliable agents
- Connecting real apps with `$fromAI()` so the agent fills in the details
- Memory, context and cost: what a conversation really costs and how to keep it cheap
- Testing and guardrails: confirmation steps, human approval and what to do when it goes wrong
- Putting it live: a chat page, your website, Slack or Telegram

## Lessons

1. What an AI agent really is
2. Set up your workshop
3. Your first agent in 15 minutes
4. Give it tools
5. Instructions that actually work
6. Connect your real apps
7. Memory, context and cost
8. Testing and guardrails
9. Ship it, and what to build next

## What you'll need

- **n8n**: n8n Cloud or the free self-hosted version
- **An OpenAI API key**: the whole course costs well under a dollar in AI usage
- A Google account for lessons 6–9 (optional)

Lifetime access · free updates · 14-day no-questions refund.$d$,
    'courses',
    39.00,
    'gated',
    'draft',
    true
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
    'What an AI agent really is',
    $c$Strip away the hype and an AI agent is four things working together:

1. **A model**: the "brain" (GPT, Claude, Gemini). It reads, reasons and writes.
2. **Instructions**: who it is, what it's for, and the rules it must follow.
3. **Tools**: things it can *do*: search the web, read your email, check a calendar, run a calculation.
4. **Memory**: what it remembers from earlier in the conversation.

A plain chatbot only has the first two. It can talk about your calendar, but it can't look at it. An agent can, because you've handed it a tool, and **it decides on its own when to use it**.

## How an agent thinks, step by step

You ask: *"Am I free for lunch on Thursday?"*

1. The model reads your question and its instructions.
2. It decides it needs information it doesn't have, so it calls the **Check my calendar** tool for Thursday.
3. The tool returns your events.
4. The model reads them and answers: *"You're free from 12:00 to 13:30."*

That loop of think → use a tool → read the result → think again is what makes it an agent. It can go round several times for one question.

## Agent or workflow?

This matters more than anything else in the course.

- A **workflow** does the same steps every time: *new email → classify → label*. Predictable, cheap, easy to test.
- An **agent** decides the steps itself. Flexible, great for open-ended questions, but less predictable.

**Rule of thumb:** if you can draw the steps on a napkin, build a workflow. Use an agent when the steps depend on what the person asks.

Many of the best automations are workflows with one small agent inside them.

## What you'll build in this course

- **Research Buddy** (lessons 3–4): your first agent, with a calculator, Wikipedia and a "think" tool.
- **Inbox Assistant** (lesson 6): searches your Gmail and writes drafts.
- **Calendar Assistant** (lessons 6–8): checks your week and books events after you confirm.

You'll build the first one from scratch so every piece makes sense. The finished versions of all three are in your course files.$c$
  ),
  (
    1,
    'Set up your workshop',
    $c$Ten minutes of setup, and you won't have to think about it again.

## 1. Get n8n

- **n8n Cloud** (easiest): sign up at n8n.io. Nothing to install, and connecting Google later is one click.
- **Self-hosted** (free): run n8n on your own computer or server. Keep it updated: the course uses current AI nodes.

## 2. Get an OpenAI API key

Go to **platform.openai.com → API keys → Create new secret key** and add a few dollars of credit under *Billing*. The course uses **gpt-5-mini**: fast, capable and cheap. Everything in this course together costs well under a dollar.

In n8n, the first time you add an OpenAI model node, choose **Create new credential → OpenAI**, paste the key and save. You'll reuse it everywhere.

## 3. Download the course files

At the top of this page, download **Makeready-AI-Agent-Course-Files.zip** and unzip it. Inside:

- `workflows/`: the three finished agents
- `System-Prompt-Template.txt`: the instructions template from lesson 5

## 4. Know how to import

In n8n, create a new workflow, open the **⋯** menu (top right) and choose **Import from File**. You'll do this whenever you want to compare your build with the finished version.

## 5. Find the chat

Every agent in this course starts with a **Chat** trigger. When it's on the canvas, an **Open chat** button appears at the bottom of the editor. That's where you'll talk to your agents while you build them. Next to it, **Logs** shows every step the agent took: which tools it called, with what, and what came back. You'll use it constantly.$c$
  ),
  (
    2,
    'Your first agent in 15 minutes',
    $c$Let's build the core of **Research Buddy** from scratch, so you know what every piece does.

## 1. Add a chat trigger

Create a new workflow. Click **+**, search for **Chat**, and add **When chat message received**. This gives you the chat window and sends each message into the workflow.

## 2. Add the agent

Click the **+** after the trigger and add **AI Agent**. Leave *Source for Prompt* on **Connected Chat Trigger Node**: the agent will answer whatever you type.

The agent has three slots underneath: **Chat Model**, **Memory** and **Tool**.

## 3. Give it a brain

Click **+** under *Chat Model*, choose **OpenAI Chat Model**, select your credential and pick **gpt-5-mini**.

## 4. Give it a memory

Click **+** under *Memory* and choose **Simple Memory**. Set *Context Window Length* to **10**: it will remember the last 10 messages of the conversation.

Without memory, every message is a fresh start. Ask "What's the capital of France?" then "What's its population?" and it won't know what "its" means.

## 5. Give it instructions

Open the **AI Agent** node → **Add Option** → **System Message**, and paste:

> You are a careful research assistant. Lead with the answer in one or two sentences, then the key facts. If you're not sure, say so. Don't guess.

## 6. Talk to it

Click **Open chat** and ask a few questions. Then try:

- *"What's 17% of 2,340?"*
- *"How many years ago was the Eiffel Tower finished?"*

It will probably get the maths slightly wrong, or answer from memory with confidence. Language models are bad calculators and their facts can be out of date. That's exactly what tools fix, in the next lesson.

**Checkpoint:** compare your workflow with `Agent-01-Research-Buddy.json` from the course files.$c$
  ),
  (
    3,
    'Give it tools',
    $c$Tools turn a talker into a doer. Let's give Research Buddy three.

## 1. Calculator

Click **+** under the agent's *Tool* slot and add **Calculator**. No settings needed.

## 2. Wikipedia

Add **Wikipedia** the same way. Now it can look facts up instead of relying on memory.

## 3. Think

Add **Think**. This one is subtle: it doesn't fetch anything, it gives the agent a scratchpad to plan multi-step questions before acting. Set its description to: *"Use this to plan multi-step questions before answering."*

## Tell it when to use them

Agents choose tools by reading two things: **the tool's description** and **your instructions**. Update the system message:

> For facts about people, places, history or science, look them up with the Wikipedia tool. For any arithmetic, use the Calculator tool. Never do maths in your head. For questions with several steps, use the Think tool first to plan.

## Watch it work

Ask: *"How much older is the Eiffel Tower than the Golden Gate Bridge, in years?"*

Then open **Logs**. You'll see it:

1. Plan with **Think**: find both completion years, then subtract.
2. Call **Wikipedia** twice.
3. Call **Calculator** with something like `1937 - 1889`.
4. Answer: *48 years*.

## Why tool descriptions matter

The agent only knows what a tool does from its name and description. A vague description gets a tool ignored or misused. Good descriptions say **what it does, when to use it, and what to give it**:

- ❌ *"Calendar tool"*
- ✅ *"List the user's calendar events between two date-times (ISO 8601). Use before suggesting meeting times."*

## Too many tools?

Start with 2–4. Every extra tool is one more choice the model can get wrong. If an agent needs ten tools, it's usually two agents.$c$
  ),
  (
    4,
    'Instructions that actually work',
    $c$The system message is where most agents succeed or fail. A good one reads like a job description for a capable new hire: clear goal, clear tools, clear rules.

## The five parts

Open `System-Prompt-Template.txt` from your course files. Every reliable agent prompt covers:

1. **Role & context**: who it is, who it works for, today's date.
2. **Goal**: the job in one sentence, and what a great answer looks like.
3. **Tools**: each tool by name, with *when* to use it.
4. **Rules**: especially what it must never do, and what to do when it doesn't know.
5. **Style**: tone, format and length.

## Before and after

❌ **Before:**

> You are a helpful assistant that helps with calendar stuff.

✅ **After:**

> You are a friendly scheduling assistant. Right now it is {{ $now }}. Working hours are 9:00–17:30, Monday to Friday.
>
> You can read events with "Check my calendar" and create events with "Add an event".
>
> Rules: always check the calendar before suggesting times. Before adding an event, repeat the title, day and time and ask "Shall I add it?". Only add it after a yes.
>
> Keep answers short: a list of times beats a paragraph.

The second version fixes the most common agent failures: it doesn't know the date, double-books, acts without permission, and rambles.

## Give it today's date

Models don't know what day it is. In n8n, add the date to the system message with an expression:

`Today is {{ $now.toFormat('cccc d LLLL yyyy') }}.`

Click the system message field, switch it to **Expression**, and paste that in. Without it, "next Thursday" means nothing.

## Rules that earn their place

- **Confirm before acting:** anything that sends, books, deletes or spends.
- **Admit uncertainty:** "If you don't know, say so and suggest emailing X."
- **Stay in scope:** "Only help with scheduling. Politely decline anything else."

## Examples are a superpower

One or two example exchanges at the end of the prompt (*User: … / You: …*) teach tone and format better than a paragraph of description.$c$
  ),
  (
    5,
    'Connect your real apps',
    $c$Now the fun part: agents that work with *your* stuff. Import **Agent-02-Inbox-Assistant.json** and **Agent-03-Calendar-Assistant.json** from your course files.

## App nodes as tools

Almost any n8n app node can be a tool. Click **+** under the agent's *Tool* slot and search for **Gmail**, **Google Calendar**, **Google Sheets**, **Notion**, **Slack**… Pick the action (for example *Gmail → Get many messages*) and it becomes a tool the agent can call.

Connect your account on each tool node (double-click → *Credential to connect with*).

## Let the agent fill in the blanks: $fromAI()

When you set up a tool, some fields should be decided by the agent at the moment it calls the tool: the search query, the email body, the event time. That's what `$fromAI()` is for. In the Inbox Assistant's search tool, the *Search* field is:

`{{ $fromAI('search', 'Gmail search query, e.g. from:sam newer_than:7d', 'string') }}`

- `'search'`: the name of the value
- the hint: tells the model what to put there (be specific, with an example)
- `'string'`: the type (`number` and `boolean` work too)

Tip: click the small ✨ button next to most fields to let the model define them automatically.

## Safety by design

Look at what the Inbox Assistant *can't* do: there's no "send email" tool. It writes **drafts**, and you press send. That's the most important design decision in the course:

- **Read-only first.** Start with tools that only look things up.
- **Drafts, not sends.** For anything outgoing, save a draft or ask for approval.
- **Confirm in the prompt.** The Calendar Assistant repeats the details and waits for a yes before booking.

Only add powerful tools once you've watched the agent behave for a while.

## Try it

- *"What did I get from Sam this week?"*
- *"Draft a polite reply to the latest invoice email saying I'll pay Friday."*
- *"What's on my calendar tomorrow?"*
- *"Find me two free hours for deep work this week."*

Open **Logs** after each one and read the exact arguments it passed to each tool. That's how you'll debug every agent you ever build.$c$
  ),
  (
    6,
    'Memory, context and cost',
    $c$## How memory works

Simple Memory keeps the last *N* messages of a conversation (the **Context Window Length**) and sends them to the model with every new message. That's how it knows what "it" or "that email" refers to.

- **Too short** (2–3): it forgets what you were talking about.
- **Too long** (50+): every message gets slower and more expensive.
- **Sweet spot:** 8–15 for most assistants.

Each chat window gets its own **session**, so two people talking to your agent never see each other's conversation.

## Memory that survives restarts

Simple Memory lives in n8n's working memory: it's lost if n8n restarts, and it doesn't work in n8n's queue mode. For agents other people use, switch the memory node to **Postgres Chat Memory** or **Redis Chat Memory**. Same idea, stored in a real database.

## What it really costs

Models charge per **token** (roughly ¾ of a word), for what you send *and* what comes back. Every message sends the system prompt, the memory, the tool results and your question.

A typical Inbox Assistant exchange: about 3,000 tokens in and 300 out. With gpt-5-mini that's a tiny fraction of a cent. Even a busy personal agent costs pennies a day.

Costs creep up when:

- Tools return huge results (a 50-email search, a whole web page). **Limit results**: 5–10 emails, not 100.
- The system prompt is enormous. Keep it to what matters.
- Memory is very long.

## Choosing a model

- **gpt-5-mini**: the default here. Fast, cheap, good at tools.
- **A bigger model** (gpt-5, Claude Sonnet, Gemini Pro): for complex reasoning or long documents. Try it when the small one keeps getting confused.
- **Switching** is easy: delete the model node and add another under *Chat Model*. Everything else stays the same.

Start small, upgrade only where you see it struggle.$c$
  ),
  (
    7,
    'Testing and guardrails',
    $c$An agent that works once in a demo isn't done. An agent that handles the awkward questions is.

## Build a test list

Write 10 questions before you call it finished:

- 5 **normal** ones (what it's for)
- 3 **awkward** ones (vague, two questions at once, a typo-ridden one)
- 2 **should-refuse** ones (out of scope, or asking it to do something risky)

Run them all after every change to the system message. It takes three minutes and catches most regressions.

## The four classic failures (and fixes)

1. **It doesn't use the tool**: it answers from memory. *Fix:* name the tool and the situation in the instructions ("Always check the calendar before suggesting times").
2. **It uses the tool wrong**: bad search terms, wrong date format. *Fix:* improve the `$fromAI` hint with an example, and say the format ("ISO 8601 date-time").
3. **It makes things up.** *Fix:* "If you don't know, say so." Give it a fallback ("suggest emailing…").
4. **It loops**, calling tools over and over. *Fix:* in the agent's options, set **Max Iterations** (5–10 is plenty) and tighten the tool descriptions.

## Guardrails that matter

- **Confirmation in the conversation:** "Repeat the details and ask before booking." Cheap and effective.
- **Human approval in the workflow:** for anything high-stakes, put a **Send and Wait for Response** step (Gmail, Slack and others have it) between the agent's decision and the action, so a person clicks *Approve* first.
- **Least privilege:** only give it the tools it needs. An agent that can't delete can't delete by mistake.
- **Read the logs:** every run is saved under **Executions**. Skim them weekly; it's how you find the questions you didn't think to test.$c$
  ),
  (
    8,
    'Ship it, and what to build next',
    $c$## Put it live

1. **Publish** the workflow (top right). Its chat now works outside the editor.
2. For a **public** chat page: open the chat trigger, turn on **Make Chat Publicly Available**, choose **Hosted Chat**, and copy the URL. Anyone with the link can use it, so only do this for agents that are safe for strangers (an FAQ bot, not your inbox).
3. **On your website:** n8n has an embeddable chat widget (search "n8n chat widget" in n8n's docs). Point it at your chat URL and add your site under *Allowed Origins*.
4. **In Slack or Telegram:** swap the chat trigger for a **Slack Trigger** or **Telegram Trigger** and send the agent's answer back with a Slack or Telegram node. Same agent, new front door.

## Ideas worth building next

- **Customer FAQ agent** for your website: answers from your FAQ, hands over to email when unsure
- **Lead qualifier**: chats with new enquiries, asks your three key questions, logs the answers to a sheet
- **Meeting prep agent**: before each call, searches your email and notes about the person and writes a one-page brief
- **Personal ops agent** in Telegram: "add milk to the shopping list", "what's on tomorrow?", "remind me to call mum Friday"
- **Research agent** with a web-search tool: compares tools or suppliers and writes a short report

## A simple recipe for any new agent

1. Write the goal in one sentence.
2. List the tools it needs (start read-only).
3. Fill in the system prompt template.
4. Write your 10 test questions.
5. Build, test, read the logs, adjust.
6. Ship it to one person (you) for a week before anyone else.

You now know more about building agents than most people talking about them. Go build something useful.

Questions or stuck? Email support@usemakeready.com.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'build-your-first-ai-agent'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
