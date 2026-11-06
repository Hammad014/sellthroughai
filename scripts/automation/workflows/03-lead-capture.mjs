import { Workflow } from "../lib/workflow.mjs";
import {
  addAiStep,
  formTrigger,
  gmailSend,
  ifNode,
  settings,
  sheetAppend,
  slackPost,
} from "../lib/nodes.mjs";

export const meta = {
  file: "03-Lead-Capture-and-Instant-Follow-up",
  title: "Lead Capture & Instant Follow-up",
};

export function build() {
  const w = new Workflow("03 · Lead Capture & Instant Follow-up");

  w.sticky(
    "About this workflow",
    `## 03 · Lead Capture & Instant Follow-up
A ready-made enquiry form. Each new lead is scored by AI, saved to your Google Sheets CRM, sent a personal reply within a minute, and hot leads ping you on Slack.

### Setup (about 10 minutes)
1. Import **sheets/Leads.csv** into Google Sheets and copy the sheet's URL
2. **⚙️ Settings**: paste that URL as *crm_sheet_url*, then describe your business, offer and ideal client
3. **Qualify lead · model**: add your OpenAI API key
4. **Save to CRM**: connect Google Sheets
5. **Reply to lead**: connect Gmail
6. **Hot lead alert**: connect Slack or delete it
7. Click **Publish**, open **Lead form** → *Production URL*, and link to it from your site

Speed wins deals: leads replied to within 5 minutes convert far better.`,
    [-520, -280],
    { width: 440 },
  );

  const form = w.node(
    formTrigger({
      name: "Lead form",
      at: [0, 0],
      title: "Let's work together",
      description:
        "Tell us a little about what you need. We'll get back to you today.",
      path: "work-with-us",
      button: "Send enquiry",
      thanks: "Thanks! Check your inbox: we've just sent you a reply.",
      fields: [
        { label: "Name", placeholder: "Jane Smith" },
        { label: "Email", type: "email", placeholder: "jane@company.com" },
        { label: "Company", required: false },
        { label: "What do you need help with?", type: "textarea" },
        {
          label: "Budget",
          type: "dropdown",
          options: [
            "Under $1k",
            "$1k–$5k",
            "$5k–$20k",
            "$20k+",
            "Not sure yet",
          ],
        },
      ],
    }),
  );
  const cfg = w.node(
    settings({
      at: [220, 0],
      fields: [
        ["business_name", "Studio North"],
        ["your_name", "Alex"],
        [
          "offer",
          "Brand identity and websites for small businesses, from $3k.",
        ],
        [
          "ideal_client",
          "Small businesses with a $3k+ budget who want to launch within 3 months.",
        ],
        ["booking_link", "https://cal.com/your-link"],
        [
          "crm_sheet_url",
          "https://docs.google.com/spreadsheets/d/PASTE-YOUR-SHEET-ID/edit",
        ],
      ],
    }),
  );
  const qualify = addAiStep(w, {
    name: "Qualify lead",
    at: [460, 0],
    system:
      "You qualify inbound leads for a small business and write the first reply. Be honest: a poor fit gets a polite, helpful reply, not a hard sell.",
    prompt: `=Business: {{ $json.business_name }}
Offer: {{ $json.offer }}
Ideal client: {{ $json.ideal_client }}
Booking link: {{ $json.booking_link }}

New enquiry:
Name: {{ $json.Name }}
Company: {{ $json.Company || "not given" }}
Budget: {{ $json.Budget }}
Need: {{ $json["What do you need help with?"] }}

1. Score the lead 1–10 for fit and intent.
2. Segment it: hot (8–10), warm (5–7) or cold (1–4).
3. Summarise the need in one line.
4. Write a short, personal first reply from {{ $json.your_name }} (plain text, under 120 words). Hot and warm leads get the booking link.`,
    example: {
      score: 8,
      segment: "hot",
      summary: "Bakery needs a new logo and website before a May opening.",
      reply_subject: "Your new website: next steps",
      reply_body: "Hi Jane,\n\nThanks for getting in touch...",
    },
  });

  const lead = (field) => `={{ $('Lead form').item.json["${field}"] }}`;
  const ai = (field) => `={{ $('Qualify lead').item.json.output.${field} }}`;
  const save = w.node(
    sheetAppend({
      name: "Save to CRM",
      at: [760, 0],
      doc: "={{ $('⚙️ Settings').item.json.crm_sheet_url }}",
      sheet: "Leads",
      map: {
        date: "={{ $now.toISODate() }}",
        name: lead("Name"),
        email: lead("Email"),
        company: lead("Company"),
        need: lead("What do you need help with?"),
        budget: lead("Budget"),
        score: ai("score"),
        segment: ai("segment"),
        summary: ai("summary"),
        status: "new",
      },
    }),
  );
  const reply = w.node(
    gmailSend({
      name: "Reply to lead",
      at: [1000, 0],
      to: lead("Email"),
      subject: ai("reply_subject"),
      message: ai("reply_body"),
      html: false,
    }),
  );
  const hot = w.node(
    ifNode({
      name: "Hot lead?",
      at: [1240, 0],
      when: [
        ["={{ $('Qualify lead').item.json.output.score }}", "gte", 8, "number"],
      ],
    }),
  );
  const alert = w.node(
    slackPost({
      name: "Hot lead alert",
      at: [1480, -80],
      channel: "#leads",
      text: `=🔥 *Hot lead ({{ $('Qualify lead').item.json.output.score }}/10)*: {{ $('Lead form').item.json.Name }} · {{ $('Lead form').item.json.Budget }}
{{ $('Qualify lead').item.json.output.summary }}
{{ $('Lead form').item.json.Email }}`,
    }),
  );

  w.chain(form, cfg, qualify, save, reply, hot);
  w.connect(hot, alert, { output: 0 });
  return w;
}
