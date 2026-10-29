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
  file: "Agent-03-Calendar-Assistant",
  title: "Agent 03 · Calendar Assistant",
};

// "primary" = the account's main calendar. List mode: ID mode only accepts
// email-style calendar ids.
const calendar = {
  __rl: true,
  mode: "list",
  value: "primary",
  cachedResultName: "Main calendar",
};

export function build() {
  const w = new Workflow("Agent 03 · Calendar Assistant");

  w.sticky(
    "About this agent",
    `## Agent 03 · Calendar Assistant
Plans your week with your real Google Calendar (course lessons 6 to 8). Ask *"What's on Thursday?"*, *"Find me two free hours for deep work this week"* or *"Book lunch with Priya on Friday at 1pm"*. It always confirms before adding anything.

### Setup (5 minutes)
1. **Model**: add your OpenAI API key
2. **Check my calendar** and **Add an event**: connect Google Calendar (it uses your main calendar)
3. Change the time zone and working hours in **Calendar Assistant** → *Options* → *System message*
4. Click **Open chat** and try it`,
    [-560, -300],
    { width: 440 },
  );

  const trigger = w.node(chatTrigger({ at: [0, 0] }));
  const brain = w.node(
    agent({
      name: "Calendar Assistant",
      at: [260, 0],
      system: `=You are a friendly scheduling assistant. Right now it is {{ $now.toFormat("cccc d LLLL yyyy, HH:mm") }} (time zone: {{ $now.zoneName }}).
Working hours are 9:00 to 17:30, Monday to Friday.

You can:
- Read events with "Check my calendar" (give it a start and end date-time in ISO format).
- Create events with "Add an event".

Rules:
- Always check the calendar before suggesting times, so you never double-book.
- Before adding an event, repeat the title, day, start and end time and ask "Shall I add it?". Only add it after a yes.
- Use the time zone above for every time you mention or create.
- Keep answers short: a list of times is better than a paragraph.`,
    }),
  );
  const model = w.node(openAiModel({ name: "Model", at: [80, 260] }));
  const memory = w.node(windowMemory({ at: [240, 260] }));
  const read = w.node(
    appTool({
      name: "Check my calendar",
      type: "n8n-nodes-base.googleCalendarTool",
      version: 1.3,
      at: [400, 260],
      description:
        "List the user's calendar events between two date-times (ISO 8601).",
      params: {
        resource: "event",
        operation: "getAll",
        calendar,
        returnAll: false,
        limit: 50,
        timeMin: fromAI("after", "Start of the range, ISO 8601 date-time"),
        timeMax: fromAI("before", "End of the range, ISO 8601 date-time"),
        options: { orderBy: "startTime", recurringEventHandling: "expand" },
      },
    }),
  );
  const add = w.node(
    appTool({
      name: "Add an event",
      type: "n8n-nodes-base.googleCalendarTool",
      version: 1.3,
      at: [560, 260],
      description:
        "Create a calendar event. Only call this after the user has confirmed.",
      params: {
        resource: "event",
        operation: "create",
        calendar,
        start: fromAI("start", "Event start, ISO 8601 date-time"),
        end: fromAI("end", "Event end, ISO 8601 date-time"),
        useDefaultReminders: true,
        additionalFields: {
          summary: fromAI("title", "Short event title"),
          description: fromAI(
            "notes",
            "Optional notes for the event, or empty",
          ),
        },
      },
    }),
  );

  w.connect(trigger, brain);
  w.connect(model, brain, { kind: "ai_languageModel" });
  w.connect(memory, brain, { kind: "ai_memory" });
  w.connect(read, brain, { kind: "ai_tool" });
  w.connect(add, brain, { kind: "ai_tool" });
  return w;
}
