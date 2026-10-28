import { Workflow } from "../lib/workflow.mjs";
import {
  addAiStep,
  gmailDraft,
  gmailTrigger,
  ifNode,
  settings,
} from "../lib/nodes.mjs";

export const meta = {
  file: "02-AI-Reply-Drafter",
  title: "AI Reply Drafter",
};

export function build() {
  const w = new Workflow("02 · AI Reply Drafter");

  w.sticky(
    "About this workflow",
    `## 02 · AI Reply Drafter
When an email needs a reply, AI writes one in your voice and saves it as a **Gmail draft** in the same thread. Nothing is ever sent without you: open Drafts, tweak, send.

### Setup (about 5 minutes)
1. **New email**: connect Gmail
2. **⚙️ Settings**: your name, sign-off, tone and a few lines about your business (prices, hours, links you often share)
3. **Draft reply · model**: add your OpenAI API key
4. **Save as Gmail draft**: connect Gmail
5. Run once with **Execute workflow**, then click **Publish**

Tip: the more detail in *business_context*, the better the drafts.`,
    [-520, -240],
    { width: 440 },
  );

  const trigger = w.node(
    gmailTrigger({
      at: [0, 0],
      q: "-category:promotions -category:social -category:updates -from:noreply -from:no-reply",
    }),
  );
  const cfg = w.node(
    settings({
      at: [220, 0],
      fields: [
        ["your_name", "Alex"],
        ["sign_off", "Best,\nAlex"],
        ["tone", "warm, clear and concise. No corporate fluff."],
        [
          "business_context",
          "I'm a freelance copywriter. Rates start at $500 per project. I reply within one business day. Booking link: https://cal.com/your-link",
        ],
      ],
    }),
  );
  const draft = addAiStep(w, {
    name: "Draft reply",
    at: [460, 0],
    system:
      "You draft email replies for a busy professional. Never invent facts, prices or commitments that aren't in the context. If something is unknown, write a short placeholder like [check date].",
    prompt: `=You are drafting a reply as {{ $json.your_name }}.
Tone: {{ $json.tone }}
What you know about the business: {{ $json.business_context }}

First decide if this email needs a personal reply. Receipts, notifications, automated messages and newsletters do not.
If it does, write the reply body (no subject line), ending with this sign-off:
{{ $json.sign_off }}

From: {{ $json.from?.text }}
Subject: {{ $json.subject }}
Email:
{{ ($json.text || $json.snippet || "").slice(0, 5000) }}`,
    example: {
      needs_reply: true,
      reply: "Hi Sam,\n\nThanks for reaching out! ...\n\nBest,\nAlex",
    },
  });
  const check = w.node(
    ifNode({
      name: "Needs a reply?",
      at: [760, 0],
      when: [["={{ $json.output.needs_reply }}", "true", undefined, "boolean"]],
    }),
  );
  const save = w.node(
    gmailDraft({
      name: "Save as Gmail draft",
      at: [1000, -80],
      to: "={{ $('New email').item.json.from?.value?.[0]?.address }}",
      subject: "=Re: {{ $('New email').item.json.subject }}",
      message: "={{ $json.output.reply }}",
      threadId: "={{ $('New email').item.json.threadId }}",
    }),
  );

  w.chain(trigger, cfg, draft, check);
  w.connect(check, save, { output: 0 });
  return w;
}
