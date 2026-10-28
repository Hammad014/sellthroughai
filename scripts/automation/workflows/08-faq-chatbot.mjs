import { Workflow } from "../lib/workflow.mjs";
import { openAiModel, settings } from "../lib/nodes.mjs";

export const meta = {
  file: "08-Website-FAQ-Chatbot",
  title: "Website FAQ Chatbot",
};

export function build() {
  const w = new Workflow("08 · Website FAQ Chatbot");

  w.sticky(
    "About this workflow",
    `## 08 · Website FAQ Chatbot
A friendly AI assistant that answers visitors' questions from **your** FAQ, remembers the conversation, and hands over to your email when it doesn't know. Share it as a chat page or embed it on your site.

### Setup (about 10 minutes)
1. **⚙️ Settings**: your business name, contact email, and your FAQ (paste prices, hours, policies, delivery times: the more the better)
2. **Chat model**: add your OpenAI API key
3. Click **Publish**
4. Open **Chat with visitors** → copy the *Chat URL* to share it, or embed it on your site with n8n's chat widget (see the guide)

It only answers from your FAQ and won't make up prices or policies.`,
    [-520, -260],
    { width: 440 },
  );

  const trigger = w.node({
    name: "Chat with visitors",
    type: "@n8n/n8n-nodes-langchain.chatTrigger",
    version: 1.5,
    at: [0, 0],
    params: {
      public: true,
      mode: "hostedChat",
      authentication: "none",
      initialMessages:
        "Hi there! 👋\nAsk me anything about our services, prices or bookings.",
      options: {
        title: "Questions? Ask us",
        subtitle: "Usually answers in seconds",
        inputPlaceholder: "Type your question…",
        loadPreviousSession: "memory",
      },
    },
  });
  const cfg = w.node(
    settings({
      at: [340, 0],
      fields: [
        ["business_name", "Studio North"],
        ["contact_email", "hello@example.com"],
        [
          "faq",
          `What do you do? Brand identity and websites for small businesses.
How much does it cost? Logos from $1,500. Websites from $3,000.
How long does a website take? Usually 4–6 weeks.
Where are you based? Remote, working with clients worldwide.
How do I start? Book a free 20-minute call at https://cal.com/your-link`,
        ],
      ],
    }),
  );
  const agent = w.node({
    name: "FAQ assistant",
    type: "@n8n/n8n-nodes-langchain.agent",
    version: 3.1,
    at: [580, 0],
    params: {
      promptType: "define",
      text: "={{ $('Chat with visitors').item.json.chatInput }}",
      options: {
        systemMessage: `=You are the friendly website assistant for {{ $json.business_name }}.

Answer ONLY using the FAQ below. Keep answers short (1–3 sentences), warm and helpful.
If the answer isn't in the FAQ, say you're not sure and suggest emailing {{ $json.contact_email }}. Never invent prices, dates or policies.

FAQ:
{{ $json.faq }}`,
      },
    },
  });
  const model = w.node(openAiModel({ name: "Chat model", at: [540, 240] }));
  const memory = w.node({
    name: "Remember the conversation",
    type: "@n8n/n8n-nodes-langchain.memoryBufferWindow",
    version: 1.4,
    at: [720, 240],
    params: {
      sessionIdType: "customKey",
      sessionKey: "={{ $('Chat with visitors').item.json.sessionId }}",
      contextWindowLength: 10,
    },
  });

  w.chain(trigger, cfg, agent);
  w.connect(model, agent, { kind: "ai_languageModel" });
  w.connect(memory, agent, { kind: "ai_memory" });
  // The chat trigger restores earlier messages from the same memory.
  w.connect(memory, trigger, { kind: "ai_memory" });
  return w;
}
