import { Workflow } from "../lib/workflow.mjs";
import {
  addAiStep,
  code,
  formTrigger,
  gmailSend,
  settings,
  sheetAppend,
} from "../lib/nodes.mjs";

export const meta = {
  file: "07-Meeting-Notes-to-Recap-and-Tasks",
  title: "Meeting Notes → Recap & Tasks",
};

export function build() {
  const w = new Workflow("07 · Meeting Notes → Recap & Tasks");

  w.sticky(
    "About this workflow",
    `## 07 · Meeting Notes → Recap & Tasks
Paste your rough notes or a transcript (Zoom, Meet, Otter, Fathom…) into a form. AI writes a clean recap with decisions and action items, emails it to everyone, and adds each task to your **Tasks** sheet.

### Setup (about 5 minutes)
1. Import **sheets/Tasks.csv** into Google Sheets and copy its URL
2. **⚙️ Settings**: paste the URL and your name
3. **Extract recap · model**: add your OpenAI API key
4. **Email the recap**: connect Gmail
5. **Add tasks to sheet**: connect Google Sheets
6. Click **Publish** and bookmark **Meeting form** → *Production URL*`,
    [-520, -240],
    { width: 440 },
  );

  const form = w.node(
    formTrigger({
      name: "Meeting form",
      at: [0, 0],
      title: "Turn meeting notes into a recap",
      description:
        "Paste notes or a transcript. Everyone listed gets the recap by email.",
      path: "meeting-recap",
      button: "Send recap",
      thanks: "Recap sent! Tasks are in your sheet.",
      fields: [
        { label: "Meeting title", placeholder: "Weekly sync with Acme" },
        {
          label: "Attendee emails",
          placeholder: "sam@acme.com, priya@acme.com",
        },
        { label: "Notes or transcript", type: "textarea" },
      ],
    }),
  );
  const cfg = w.node(
    settings({
      at: [220, 0],
      fields: [
        ["your_name", "Alex"],
        [
          "tasks_sheet_url",
          "https://docs.google.com/spreadsheets/d/PASTE-YOUR-SHEET-ID/edit",
        ],
      ],
    }),
  );
  const extract = addAiStep(w, {
    name: "Extract recap",
    at: [460, 0],
    system:
      'You turn messy meeting notes into a crisp recap. Only include what was actually said. If an owner or due date isn\'t mentioned, use "TBD".',
    prompt: `=Meeting: {{ $json["Meeting title"] }}
Notes / transcript:
{{ $json["Notes or transcript"].slice(0, 20000) }}

Return a 3–5 sentence summary, the decisions made, and every action item with owner and due date.`,
    example: {
      summary: "We agreed the launch moves to March 3...",
      decisions: ["Launch moves to March 3"],
      action_items: [
        { task: "Send revised timeline", owner: "Sam", due: "Friday" },
      ],
    },
  });
  const email = w.node(
    code({
      name: "Build recap email",
      at: [760, 0],
      perItem: true,
      js: `
const { summary, decisions = [], action_items = [] } = $json.output;
const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const list = (items) => items.length ? "<ul>" + items.map((i) => "<li>" + i + "</li>").join("") + "</ul>" : "<p>None.</p>";
const html = [
  "<p>" + esc(summary) + "</p>",
  "<p><b>Decisions</b></p>",
  list(decisions.map(esc)),
  "<p><b>Action items</b></p>",
  list(action_items.map((a) => "<b>" + esc(a.owner) + "</b>: " + esc(a.task) + " <i>(" + esc(a.due) + ")</i>")),
  "<p>Reply if anything's missing.<br>" + esc($('⚙️ Settings').item.json.your_name) + "</p>",
].join("");
return { json: { html } };
`,
    }),
  );
  const send = w.node(
    gmailSend({
      name: "Email the recap",
      at: [980, 0],
      to: `={{ $('Meeting form').item.json["Attendee emails"] }}`,
      subject: `=Recap: {{ $('Meeting form').item.json["Meeting title"] }}`,
      message: "={{ $json.html }}",
    }),
  );
  const split = w.node(
    code({
      name: "One row per task",
      at: [1200, 0],
      js: `
const items = $('Extract recap').first().json.output.action_items || [];
const meeting = $('Meeting form').first().json["Meeting title"];
return items.map((a) => ({ json: { meeting, task: a.task, owner: a.owner, due: a.due } }));
`,
    }),
  );
  const add = w.node(
    sheetAppend({
      name: "Add tasks to sheet",
      at: [1420, 0],
      doc: "={{ $('⚙️ Settings').first().json.tasks_sheet_url }}",
      sheet: "Tasks",
      map: {
        date: "={{ $now.toISODate() }}",
        meeting: "={{ $json.meeting }}",
        task: "={{ $json.task }}",
        owner: "={{ $json.owner }}",
        due: "={{ $json.due }}",
        status: "open",
      },
    }),
  );

  w.chain(form, cfg, extract, email, send, split, add);
  return w;
}
