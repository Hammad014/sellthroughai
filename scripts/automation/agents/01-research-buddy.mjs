import { Workflow } from "../lib/workflow.mjs";
import {
  agent,
  chatTrigger,
  openAiModel,
  windowMemory,
} from "../lib/nodes.mjs";

export const meta = {
  file: "Agent-01-Research-Buddy",
  title: "Agent 01 · Research Buddy",
};

export function build() {
  const w = new Workflow("Agent 01 · Research Buddy");

  w.sticky(
    "About this agent",
    `## Agent 01 · Research Buddy
Your first AI agent (course lessons 3 and 4). Chat with it in n8n: it looks things up on Wikipedia, does maths with a calculator instead of guessing, and thinks step by step before answering.

### Setup (2 minutes)
1. **Model**: add your OpenAI API key
2. Click **Open chat** at the bottom and ask something like *"How much older is the Eiffel Tower than the Golden Gate Bridge, in years?"*
3. Open **Logs** to watch which tools it chose and why

No other accounts needed.`,
    [-560, -280],
    { width: 440 },
  );

  const trigger = w.node(chatTrigger({ at: [0, 0] }));
  const brain = w.node(
    agent({
      name: "Research Buddy",
      at: [260, 0],
      system: `You are a careful research assistant.

How to work:
- For facts about people, places, history or science, look them up with the Wikipedia tool instead of relying on memory.
- For any arithmetic (dates, prices, percentages), use the Calculator tool. Never do maths in your head.
- For questions with several steps, use the Think tool first to plan.

How to answer:
- Lead with the answer in one or two sentences, then the key facts you found.
- Say where facts came from ("According to Wikipedia…").
- If you couldn't find something, say so. Don't guess.`,
    }),
  );
  const model = w.node(openAiModel({ name: "Model", at: [120, 240] }));
  const memory = w.node(windowMemory({ at: [260, 240] }));
  const calc = w.node({
    name: "Calculator",
    type: "@n8n/n8n-nodes-langchain.toolCalculator",
    version: 1,
    at: [400, 240],
  });
  const wiki = w.node({
    name: "Wikipedia",
    type: "@n8n/n8n-nodes-langchain.toolWikipedia",
    version: 1,
    at: [540, 240],
  });
  const think = w.node({
    name: "Think",
    type: "@n8n/n8n-nodes-langchain.toolThink",
    version: 1.1,
    at: [680, 240],
    params: {
      description:
        "Use this to plan multi-step questions before answering. Write out the steps you will take.",
    },
  });

  w.connect(trigger, brain);
  w.connect(model, brain, { kind: "ai_languageModel" });
  w.connect(memory, brain, { kind: "ai_memory" });
  for (const tool of [calc, wiki, think])
    w.connect(tool, brain, { kind: "ai_tool" });
  return w;
}
