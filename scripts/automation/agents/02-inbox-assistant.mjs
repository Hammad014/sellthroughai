import { Workflow } from "../lib/workflow.mjs";
import {
  agent,
  appTool,
  chatTrigger,
  fromAI,
  openAiModel,
  windowMemory,
} from "../lib/nodes.mjs";

export const meta = {
  file: "Agent-02-Inbox-Assistant",
  title: "Agent 02 · Inbox Assistant",
};

export function build() {
  const w = new Workflow("Agent 02 · Inbox Assistant");

  w.sticky(
    "About this agent",
    `## Agent 02 · Inbox Assistant
An agent that works with your real Gmail (course lesson 6). Ask *"What did Sam email me about this week?"* or *"Draft a polite reply to the latest invoice email"*. It searches and reads your email and writes **drafts only**: it can't send anything.

### Setup (5 minutes)
1. **Model**: add your OpenAI API key
2. **Search my email** and **Create a draft**: connect your Gmail
3. **⚙️ Instructions** live in the agent: open **Inbox Assistant** → *Options* → *System message* to change your name and tone
4. Click **Open chat** and try it

Safety: there is deliberately no "send" tool. Add one only once you trust it.`,
    [-560, -300],
    { width: 440 },
  );

  const trigger = w.node(chatTrigger({ at: [0, 0] }));
  const brain = w.node(
    agent({
      name: "Inbox Assistant",
      at: [260, 0],
      system: `=You are Alex's email assistant. Today is {{ $now.toFormat('cccc d LLLL yyyy') }}.

You can:
- Search Alex's Gmail with the "Search my email" tool, using normal Gmail search syntax (from:, subject:, newer_than:7d, is:unread…).
- Write replies with the "Create a draft" tool. Drafts are saved in Gmail for Alex to review. You cannot send email.

Rules:
- Search before you answer questions about emails. Quote the sender, date and subject so Alex can find it.
- Before creating a draft, show Alex the text and ask "Shall I save this as a draft?". Only create it after a yes.
- Write like Alex: warm, short, no corporate phrases. Sign off "Best, Alex".
- Never invent facts, prices or dates. If something is missing, leave a placeholder like [check date].`,
    }),
  );
  const model = w.node(openAiModel({ name: "Model", at: [80, 260] }));
  const memory = w.node(windowMemory({ at: [240, 260] }));
  const search = w.node(
    appTool({
      name: "Search my email",
      type: "n8n-nodes-base.gmailTool",
      version: 2.2,
      at: [400, 260],
      description:
        "Search the user's Gmail. Returns matching emails with sender, subject, date and a snippet.",
      params: {
        resource: "message",
        operation: "getAll",
        returnAll: false,
        limit: fromAI("limit", "How many emails to return, 1 to 20", "number"),
        simple: true,
        filters: {
          q: fromAI(
            "search",
            "Gmail search query, e.g. from:sam newer_than:7d",
          ),
        },
      },
    }),
  );
  const draft = w.node(
    appTool({
      name: "Create a draft",
      type: "n8n-nodes-base.gmailTool",
      version: 2.2,
      at: [560, 260],
      description:
        "Save an email as a Gmail draft for the user to review. Does NOT send it.",
      params: {
        resource: "draft",
        operation: "create",
        subject: fromAI("subject", "Email subject, e.g. Re: Invoice INV-1001"),
        emailType: "text",
        message: fromAI(
          "message",
          "The full email body, including the sign-off",
        ),
        options: {
          sendTo: fromAI("to", "Recipient email address"),
        },
      },
    }),
  );

  w.connect(trigger, brain);
  w.connect(model, brain, { kind: "ai_languageModel" });
  w.connect(memory, brain, { kind: "ai_memory" });
  w.connect(search, brain, { kind: "ai_tool" });
  w.connect(draft, brain, { kind: "ai_tool" });
  return w;
}
