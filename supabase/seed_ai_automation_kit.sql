-- ============================================================
-- Makeready — automation product: "The AI Automation Starter Kit"
--
-- A 'gated' kit (delivery_type='gated', category='automation'). Buyers get
-- the n8n workflow files (product_files, private bucket: one .zip with
-- everything + each workflow on its own) and a setup guide per workflow
-- (course_lessons) at /dashboard/courses/ai-automation-starter-kit.
--
-- The workflow files and store images are generated from code:
--   node scripts/automation/build.mjs
--   node scripts/automation/publish.mjs
-- This seed only holds the copy, so re-pasting it never touches those.
--
-- Seeded as a DRAFT: publish it in /admin once the files are uploaded and
-- you've added its Lemon Squeezy variant id.
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
    'ai-automation-starter-kit',
    'The AI Automation Starter Kit',
    $d$10 ready-to-import n8n workflows that put AI to work on your inbox, leads, content, invoices and more. Import, connect your accounts, done. A setup guide for every workflow.$d$,
    $d$## Stop doing the robot work

You know AI could take half your admin off your plate. The hard part is wiring it up: which nodes, which prompts, what breaks. This kit skips all of that. Ten complete n8n workflows, each solving one real, recurring job, each with a plain-English setup guide.

Not 2,000 random templates. Ten that are built properly, run end to end in n8n, and come with instructions you can actually follow.

## What's inside

1. **AI Inbox Triage**: every email sorted into Urgent, Lead, Support or FYI and labelled in Gmail; urgent ones ping you on Slack
2. **AI Reply Drafter**: replies written in your voice, saved as Gmail drafts. Nothing is sent without you
3. **Lead Capture & Instant Follow-up**: an enquiry form that scores each lead, logs it to a Google Sheets CRM and replies within a minute
4. **Content Repurposer**: one article becomes a LinkedIn post, an X thread, a newsletter intro and 5 hooks
5. **Daily AI News Digest**: a 2-minute morning email with only the stories that matter to you
6. **Overdue Invoice Reminders**: polite, personal reminders that get firmer the longer an invoice is late
7. **Meeting Notes → Recap & Tasks**: paste a transcript, get a recap email for everyone and a task list
8. **Website FAQ Chatbot**: answers visitors from your own FAQ and hands over to your email when it's unsure
9. **Weekly Feedback Analyzer**: a Monday report on what customers love, what bugs them and what to fix
10. **Receipt & Expense Logger**: PDF receipts in Gmail become tidy rows in your expenses sheet

Plus **Google Sheets templates** for the CRM, content bank, invoices, tasks, feedback and expenses.

## How it works

Download the kit from your library, import a workflow into n8n, follow the note on the canvas (or the guide in your library) to connect your accounts, and click Publish. Most workflows take 5 to 10 minutes to set up.

Every workflow has a **⚙️ Settings** box at the start: your name, your business, your tone. Change it there once and the AI uses it everywhere.

## What you'll need

- **n8n**: n8n Cloud, or the free self-hosted version kept up to date
- **An OpenAI API key**: a typical run costs a fraction of a cent. Prefer Claude or Gemini? Swap one node
- **The apps you use**: Gmail and Google Sheets for most workflows, Slack optional

Lifetime access · free updates · 14-day no-questions refund.$d$,
    'automation',
    29.00,
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
    'Start here: set up n8n in 10 minutes',
    $c$Do this once. After that, every workflow in the kit takes about 5 minutes.

## 1. Get n8n

- **n8n Cloud** (easiest): sign up at n8n.io. Nothing to install, and connecting Google is one click.
- **Self-hosted** (free): run n8n on your own computer or server. Keep it updated: the kit uses current n8n nodes, so an old install may show "install this node" or version errors. Updating fixes that.

## 2. Get an OpenAI API key

Go to **platform.openai.com → API keys → Create new secret key**, and add a few dollars of credit under Billing. The kit uses **gpt-5-mini**, which is fast and cheap: sorting an email costs a fraction of a cent.

In n8n, the first time a workflow asks for it, choose **Create new credential → OpenAI**, paste the key and save. Every other workflow can reuse it.

## 3. Import a workflow

1. Download the kit from this page and unzip it.
2. In n8n, create a new workflow, open the **⋯** menu (top right) and choose **Import from File**. Pick a file from the *workflows* folder.
   *Shortcut:* open the .json file in a text editor, copy everything, click on an empty n8n canvas and paste.

## 4. Connect your accounts

Nodes with a small **red warning triangle** need an account. Double-click the node → **Credential to connect with** → **Create new credential** and sign in. On n8n Cloud, Google and Slack are a single sign-in.

## 5. Fill in ⚙️ Settings

Every workflow starts with a **⚙️ Settings** node. Double-click it and replace the example text with your own details: your name, your business, your tone, your sheet links. This is the only place you need to edit.

## 6. Test, then Publish

Click **Execute workflow** to run it once and check each node turns green. When you're happy, click **Publish** (top right) and it runs on its own from then on. On older n8n versions this is the **Active** switch.

## Google Sheets templates

Some workflows log to a sheet. In Google Drive choose **New → File upload**, pick the matching CSV from the *sheets* folder, open it with Google Sheets, and copy the URL from your browser into the workflow's ⚙️ Settings. Keep the **tab name** as it is (for example *Leads*), because the workflow looks for that name.$c$
  ),
  (
    1,
    '01 · AI Inbox Triage',
    $c$**What it does:** every new email is read by AI and sorted into **Urgent**, **Lead**, **Support** or **FYI**. It gets the matching Gmail label, and urgent ones send you a Slack message.

## Setup

1. In Gmail, create four labels: **AI/Urgent**, **AI/Lead**, **AI/Support** and **AI/FYI** (Settings → Labels → Create new label).
2. **New email**: connect your Gmail.
3. **⚙️ Settings**: describe what you do in *about_me*, so the AI knows what a lead looks like for you. Adjust *urgent_means* if you like.
4. Each **Label: …** node: connect Gmail, then pick the matching label from the list.
5. **Classify email · model**: choose your OpenAI credential.
6. **Alert me on Slack**: connect Slack and type your channel name, or delete the node if you don't use Slack.
7. Send yourself a test email, click **Execute workflow**, and check the label appears. Then **Publish**.

## Make it yours

- **Skip newsletters entirely**: the *New email* node's search already ignores Promotions and Social. Add more filters in *Search* using normal Gmail syntax, like `-from:news@`.
- **Different categories**: edit the list in the *Classify email* prompt and add a matching rule in **Route by category**.
- It checks for new mail every minute. Change that in *New email → Poll Times*.$c$
  ),
  (
    2,
    '02 · AI Reply Drafter',
    $c$**What it does:** when an email needs a personal reply, AI writes one in your voice and saves it as a **Gmail draft** in the same thread. It never sends anything. You open Drafts, tweak and hit send.

## Setup

1. **New email**: connect Gmail.
2. **⚙️ Settings**: your name, your sign-off, the tone you like, and *business_context*: prices, hours, links you often share, how you usually handle requests. The more you put here, the better the drafts.
3. **Draft reply · model**: choose your OpenAI credential.
4. **Save as Gmail draft**: connect Gmail.
5. Send yourself a test question, click **Execute workflow**, and check Gmail → Drafts. Then **Publish**.

## Good to know

- Receipts, notifications and automated emails are skipped automatically: the AI decides "no reply needed" and the workflow stops.
- If something isn't in your context (a date, a price), the draft leaves a placeholder like **[check date]** instead of making it up.
- Running it together with **01 · AI Inbox Triage** works well: one sorts, the other drafts.$c$
  ),
  (
    3,
    '03 · Lead Capture & Instant Follow-up',
    $c$**What it does:** gives you an enquiry form. Each new lead is scored 1–10 by AI, saved to a Google Sheets CRM, and sent a personal reply within a minute. Hot leads (8+) ping you on Slack.

## Setup

1. Upload **sheets/Leads.csv** to Google Drive, open it with Google Sheets and copy the URL.
2. **⚙️ Settings**: paste the URL into *crm_sheet_url*. Fill in your business name, your offer, your ideal client and your booking link.
3. **Qualify lead · model**: choose your OpenAI credential.
4. **Save to CRM**: connect Google Sheets.
5. **Reply to lead**: connect Gmail.
6. **Hot lead alert**: connect Slack, or delete the node.
7. Click **Publish**. Then open **Lead form** and copy the **Production URL**: that's your form. Link to it from your website, Instagram bio or email signature.

## Make it yours

- Change the questions in **Lead form** (keep the *Name* and *Email* fields).
- Want to approve replies first? Swap **Reply to lead** for a Gmail **Create draft** node.
- Prefer your own website form? Replace the form with a **Webhook** node and send the same fields to it.$c$
  ),
  (
    4,
    '04 · Content Repurposer',
    $c$**What it does:** paste a link to an article (or the text itself) into a simple form. You get a LinkedIn post, an X thread, a newsletter intro and five hooks, saved to your **Content Bank** sheet.

## Setup

1. Upload **sheets/Content-Bank.csv** to Google Drive, open it with Google Sheets and copy the URL.
2. **⚙️ Settings**: paste the URL into *content_sheet_url*, describe your *brand_voice* and your *audience*.
3. **Repurpose · model**: choose your OpenAI credential.
4. **Save to Content Bank**: connect Google Sheets.
5. Click **Publish**, open **Content form** and bookmark its **Production URL**.

## Tips

- Works best on **your own** content: blog posts, talk transcripts, podcast notes, long LinkedIn posts.
- Some sites block automated visits. If a link comes back empty, paste the text into the form instead.
- Add a column like *scheduled* to the sheet and use it as your posting calendar.$c$
  ),
  (
    5,
    '05 · Daily AI News Digest',
    $c$**What it does:** every morning it reads the latest posts from the sites you choose, keeps only the last 24 hours, and emails you a short digest of the 5–7 stories that matter to you, with a line on why each one matters.

## Setup

1. **⚙️ Settings**: your email in *send_to*, what you care about in *interests*, and your *feeds*: one RSS link per line. The defaults cover AI news; swap in your industry's.
2. **Write digest · model**: choose your OpenAI credential.
3. **Email me the digest**: connect Gmail.
4. **Every morning**: change the time if 8:00 doesn't suit you.
5. Click **Execute workflow** to get today's digest now, then **Publish**.

## Finding feeds

Most blogs and news sites have one. Try adding **/feed** or **/rss** to the site's address, or search for "*site name* RSS". For Hacker News on any topic: `https://hnrss.org/newest?q=YOUR+TOPIC&points=100`.

If one feed is broken, the digest still goes out with the others.$c$
  ),
  (
    6,
    '06 · Overdue Invoice Reminders',
    $c$**What it does:** every weekday at 9am it checks your **Invoices** sheet. Each unpaid invoice past its due date gets a polite, personal reminder: friendly in the first week, clearer after that, firm after 30 days. It never reminds the same client more than once every 3 days.

## Setup

1. Upload **sheets/Invoices.csv** to Google Drive, open it with Google Sheets, delete the two example rows, and copy the URL.
2. **⚙️ Settings**: paste the URL, add your name, business name and payment link. *remind_every_days* sets the gap between reminders.
3. **Load invoices** and **Mark as reminded**: connect Google Sheets.
4. **Write reminder · model**: choose your OpenAI credential.
5. **Send reminder**: connect Gmail.
6. **Publish**.

## Using the sheet

- Write dates as **2027-01-31** so they're read correctly.
- When money arrives, set **status** to **paid** and reminders stop.
- **last_reminded** is filled in for you.

**Test it safely first:** add a row with your own email as *client_email* and a due date in the past, then click **Execute workflow**.$c$
  ),
  (
    7,
    '07 · Meeting Notes → Recap & Tasks',
    $c$**What it does:** paste rough notes or a transcript from Zoom, Meet, Otter or Fathom into a form. AI writes a clean recap with decisions and action items, emails it to everyone, and adds each task to your **Tasks** sheet.

## Setup

1. Upload **sheets/Tasks.csv** to Google Drive, open it with Google Sheets and copy the URL.
2. **⚙️ Settings**: paste the URL and your name.
3. **Extract recap · model**: choose your OpenAI credential.
4. **Email the recap**: connect Gmail.
5. **Add tasks to sheet**: connect Google Sheets.
6. **Publish**, open **Meeting form** and bookmark its **Production URL**.

## Good to know

- List attendee emails separated by commas. Include yourself to get a copy.
- If the notes don't say who owns a task or when it's due, it's marked **TBD** rather than guessed.
- Long transcripts are fine. Very long ones (2+ hour meetings) are trimmed to the first ~20,000 characters.$c$
  ),
  (
    8,
    '08 · Website FAQ Chatbot',
    $c$**What it does:** a friendly assistant that answers visitors' questions using only **your** FAQ, remembers the conversation, and suggests emailing you when it doesn't know. It won't invent prices or policies.

## Setup

1. **⚙️ Settings**: your business name, contact email, and your FAQ. Paste anything a customer might ask: prices, hours, delivery times, refund policy, how to book.
2. **Chat model**: choose your OpenAI credential.
3. **Publish**.
4. Open **Chat with visitors** and copy the **Chat URL**. That's a ready-made chat page you can link to.

## Put it on your website

n8n has an embeddable chat widget (search "n8n chat widget" in n8n's docs). Point it at this workflow's chat URL and add your site's address to **Allowed Origins** in the *Chat with visitors* options. If you'd rather not touch code, linking to the chat page works well too.

## Tips

- Test it like a customer would: ask awkward questions and check it says "I'm not sure" rather than guessing.
- Update the FAQ in ⚙️ Settings whenever prices or policies change.$c$
  ),
  (
    9,
    '09 · Weekly Feedback Analyzer',
    $c$**What it does:** every Monday at 9am it reads the last 7 days of customer feedback from your **Feedback** sheet and emails you a one-page report: overall sentiment, top themes, the biggest complaints with real quotes, what people love, and three suggested fixes.

## Setup

1. Upload **sheets/Feedback.csv** to Google Drive, open it with Google Sheets and copy the URL.
2. **⚙️ Settings**: paste the URL, your email and your product name.
3. **Load feedback**: connect Google Sheets.
4. **Analyze feedback · model**: choose your OpenAI credential.
5. **Email the report**: connect Gmail.
6. **Publish**.

## Getting feedback into the sheet

- Paste reviews, support emails or survey answers in by hand, one per row.
- Or make a Google Form with the same questions and send its answers to this sheet.
- Write dates as **2027-01-31**. Only rows from the last 7 days are included.

Click **Execute workflow** any time for an instant report.$c$
  ),
  (
    10,
    '10 · Receipt & Expense Logger',
    $c$**What it does:** every receipt or invoice that arrives as a PDF in Gmail is read by AI. Vendor, date, amount, currency and category go straight into your **Expenses** sheet.

## Setup

1. Upload **sheets/Expenses.csv** to Google Drive, open it with Google Sheets and copy the URL.
2. **⚙️ Settings**: paste the URL and adjust *categories* to match how you (or your accountant) group expenses.
3. **New receipt email**: connect Gmail. Its search finds unread emails with a PDF that mention a receipt, invoice, order or payment. Tweak it if yours look different.
4. **Read the receipt · model**: choose your OpenAI credential.
5. **Log the expense**: connect Google Sheets.
6. **Publish**.

## Good to know

- If an email has no readable PDF (an image-only receipt, for example), it falls back to the email text.
- Forward old receipts to yourself to back-fill the sheet.
- Always double-check figures before filing taxes. AI is very good at this, not perfect.$c$
  ),
  (
    11,
    'Troubleshooting & swapping the AI model',
    $c$## A node has a red warning triangle

It needs an account or a choice. Double-click it and look for an empty **Credential** or a field marked in red.

## "Install this node" or "version not supported"

Your n8n is older than the kit. Update n8n (n8n Cloud is always current) and re-import the workflow.

## The AI output looks wrong

Open **⚙️ Settings** and add detail: who you are, what you sell, the tone you want. The AI only knows what you tell it there.

## A Google Sheets step fails

Check that the sheet URL in ⚙️ Settings is right, the **tab name** matches (for example *Leads*), and the **header row** is the same as in the template.

## Nothing happens after Publish

Gmail workflows check every minute for **unread** emails, so a test email you've already opened won't trigger them. Look in **Executions** (top of the editor) to see each run and where it stopped.

## Use Claude or Gemini instead of OpenAI

Every AI step has a small **model** node underneath it. Delete it, click the **+** where it was, and pick **Anthropic Chat Model** or **Google Gemini Chat Model**, then add that provider's API key. Nothing else changes.

## Still stuck?

Email us at support@usemakeready.com with the workflow name and a screenshot of the error. We're happy to help.$c$
  )
) as v(sort_order, title, content_md)
where p.slug = 'ai-automation-starter-kit'
on conflict (product_id, title) do update set
  sort_order = excluded.sort_order,
  content_md = excluded.content_md;
