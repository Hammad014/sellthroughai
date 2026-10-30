import { Workflow } from "../lib/workflow.mjs";
import {
  addAiStep,
  aggregateAll,
  code,
  gmailSend,
  schedule,
  settings,
  sheetRead,
} from "../lib/nodes.mjs";

export const meta = {
  file: "09-Weekly-Feedback-Analyzer",
  title: "Weekly Feedback Analyzer",
};

export function build() {
  const w = new Workflow("09 · Weekly Feedback Analyzer");

  w.sticky(
    "About this workflow",
    `## 09 · Weekly Feedback Analyzer
Every Monday it reads the last 7 days of customer feedback from your **Feedback** sheet and emails you a one-page report: overall sentiment, top themes, the biggest complaints with real quotes, and 3 suggested fixes.

### Setup (about 5 minutes)
1. Import **sheets/Feedback.csv** into Google Sheets and copy its URL. Collect feedback into it however you like: paste reviews in, or point a Google Form / Typeform at it
2. **⚙️ Settings**: paste the URL, your email and product name
3. **Load feedback**: connect Google Sheets
4. **Analyze feedback · model**: add your OpenAI API key
5. **Email the report**: connect Gmail
6. Click **Publish** to switch it on

Use dates like 2027-01-31 in the *date* column.`,
    [-520, -260],
    { width: 440 },
  );

  const trigger = w.node(
    schedule({
      name: "Every Monday 9am",
      at: [0, 0],
      interval: {
        field: "weeks",
        weeksInterval: 1,
        triggerAtDay: [1],
        triggerAtHour: 9,
      },
    }),
  );
  const cfg = w.node(
    settings({
      at: [220, 0],
      fields: [
        [
          "feedback_sheet_url",
          "https://docs.google.com/spreadsheets/d/PASTE-YOUR-SHEET-ID/edit",
        ],
        ["send_to", "you@example.com"],
        ["product_name", "our product"],
      ],
    }),
  );
  const load = w.node(
    sheetRead({
      name: "Load feedback",
      at: [440, 0],
      doc: "={{ $json.feedback_sheet_url }}",
      sheet: "Feedback",
    }),
  );
  const week = w.node(
    code({
      name: "Last 7 days only",
      at: [660, 0],
      js: `
const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
return $input.all().flatMap(({ json }, i) => {
  const t = Date.parse(json.date);
  if (!json.feedback || !Number.isFinite(t) || t < since) return [];
  return [{
    json: { date: json.date, source: json.source, rating: json.rating, feedback: String(json.feedback).slice(0, 1000) },
    pairedItem: i,
  }];
});
`,
    }),
  );
  const all = w.node(
    aggregateAll({
      name: "Bundle the feedback",
      at: [880, 0],
      field: "feedback",
    }),
  );
  const analyze = addAiStep(w, {
    name: "Analyze feedback",
    at: [1100, 0],
    system:
      "You are a customer insights analyst. Be specific, quote customers word for word, and never invent feedback.",
    prompt: `=Product: {{ $('⚙️ Settings').first().json.product_name }}
This week's feedback ({{ $json.feedback.length }} entries, JSON):
{{ JSON.stringify($json.feedback) }}

Write a one-page report as simple HTML (<h3>, <p>, <ul>, <li>, <b>, <i>; no markdown, no code fences):
1. Overall sentiment in one line, with the average rating if ratings exist
2. Top 3–5 themes, each with how many entries mention it
3. Biggest complaints, each with a short real quote
4. What customers love, with a quote
5. Three specific, practical fixes to try next week`,
  });
  const send = w.node(
    gmailSend({
      name: "Email the report",
      at: [1400, 0],
      to: "={{ $('⚙️ Settings').first().json.send_to }}",
      subject: "=📊 Weekly feedback report · {{ $now.toFormat('d LLL') }}",
      message: "={{ $json.text }}",
    }),
  );

  w.chain(trigger, cfg, load, week, all, analyze, send);
  return w;
}
