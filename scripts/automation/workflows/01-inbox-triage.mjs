import { Workflow } from "../lib/workflow.mjs";
import {
  addAiStep,
  gmailAddLabels,
  gmailTrigger,
  settings,
  slackPost,
  switchNode,
} from "../lib/nodes.mjs";

export const meta = {
  file: "01-AI-Inbox-Triage",
  title: "AI Inbox Triage",
};

export function build() {
  const w = new Workflow("01 · AI Inbox Triage");

  w.sticky(
    "About this workflow",
    `## 01 · AI Inbox Triage
Every new email is read by AI, sorted into **Urgent**, **Lead**, **Support** or **FYI**, labelled in Gmail, and urgent ones ping you on Slack.

### Setup (about 5 minutes)
1. In Gmail, create 4 labels: **AI/Urgent**, **AI/Lead**, **AI/Support**, **AI/FYI**
2. **New email**: connect your Gmail account
3. **⚙️ Settings**: describe what you do, so the AI knows what counts as a lead
4. Each **Label: …** node: connect Gmail, then pick the matching label
5. **Classify email · model**: add your OpenAI API key
6. **Alert me on Slack**: connect Slack and set the channel, or delete it
7. Run once with **Execute workflow**, then click **Publish**

Full guide: your Makeready library → AI Automation Starter Kit.`,
    [-520, -260],
    { width: 440 },
  );

  const trigger = w.node(
    gmailTrigger({
      at: [0, 0],
      q: "-category:promotions -category:social",
    }),
  );
  const cfg = w.node(
    settings({
      at: [220, 0],
      fields: [
        [
          "about_me",
          "I run a small design studio. Leads are people asking about new projects, pricing or availability.",
        ],
        [
          "urgent_means",
          "a client is blocked, something is broken, or there's a deadline within 48 hours",
        ],
      ],
    }),
  );
  const classify = addAiStep(w, {
    name: "Classify email",
    at: [460, 0],
    system:
      "You triage a busy professional's inbox. Be decisive and conservative with 'urgent'.",
    prompt: `=About me: {{ $json.about_me }}
Urgent means: {{ $json.urgent_means }}

Classify this email into exactly one category:
- urgent: needs my attention today
- lead: a potential new client or sales opportunity
- support: an existing customer or client needs help
- fyi: everything else (updates, receipts, newsletters, notifications)

From: {{ $json.from?.text }}
Subject: {{ $json.subject }}
Body:
{{ ($json.text || $json.snippet || "").slice(0, 4000) }}`,
    example: {
      category: "lead",
      summary: "Maria from Bloom Bakery wants a quote for a new logo by March.",
      reason: "Asks about pricing for a new project.",
    },
  });

  const route = w.node(
    switchNode({
      name: "Route by category",
      at: [760, 0],
      rules: [
        ["Urgent", ["={{ $json.output.category }}", "equals", "urgent"]],
        ["Lead", ["={{ $json.output.category }}", "equals", "lead"]],
        ["Support", ["={{ $json.output.category }}", "equals", "support"]],
        ["FYI", ["={{ $json.output.category }}", "equals", "fyi"]],
      ],
    }),
  );

  const msgId = "={{ $('New email').item.json.id }}";
  const labels = ["Urgent", "Lead", "Support", "FYI"].map((cat, i) =>
    w.node(
      gmailAddLabels({
        name: `Label: ${cat}`,
        at: [1040, -240 + i * 160],
        messageId: msgId,
        labelIds: [],
      }),
    ),
  );

  const alert = w.node(
    slackPost({
      name: "Alert me on Slack",
      at: [1300, -240],
      channel: "#inbox-alerts",
      text: `=🚨 *Urgent email* from {{ $('New email').item.json.from?.text }}
*{{ $('New email').item.json.subject }}*
{{ $('Classify email').item.json.output.summary }}`,
    }),
  );

  w.chain(trigger, cfg, classify, route);
  labels.forEach((label, i) => w.connect(route, label, { output: i }));
  w.connect(labels[0], alert);
  return w;
}
