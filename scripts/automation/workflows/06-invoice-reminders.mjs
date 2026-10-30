import { Workflow } from "../lib/workflow.mjs";
import {
  addAiStep,
  code,
  gmailSend,
  schedule,
  settings,
  sheetRead,
  sheetUpdate,
} from "../lib/nodes.mjs";

export const meta = {
  file: "06-Overdue-Invoice-Reminders",
  title: "Overdue Invoice Reminders",
};

export function build() {
  const w = new Workflow("06 · Overdue Invoice Reminders");

  w.sticky(
    "About this workflow",
    `## 06 · Overdue Invoice Reminders
Every weekday it checks your **Invoices** sheet. Each unpaid invoice past its due date gets a polite, personal reminder that gets firmer the longer it's overdue, and the sheet records when you last reminded them.

### Setup (about 10 minutes)
1. Import **sheets/Invoices.csv** into Google Sheets (delete the 2 example rows) and copy its URL
2. **⚙️ Settings**: paste the URL, your name, business and payment link
3. **Load invoices** and **Mark as reminded**: connect Google Sheets
4. **Write reminder · model**: add your OpenAI API key
5. **Send reminder**: connect Gmail
6. Click **Publish** to switch it on

In the sheet, set *status* to **paid** when money arrives and reminders stop. Use dates like 2027-01-31.`,
    [-520, -260],
    { width: 440 },
  );

  const trigger = w.node(
    schedule({
      name: "Every weekday 9am",
      at: [0, 0],
      interval: { field: "cronExpression", expression: "0 9 * * 1-5" },
    }),
  );
  const cfg = w.node(
    settings({
      at: [220, 0],
      fields: [
        [
          "invoices_sheet_url",
          "https://docs.google.com/spreadsheets/d/PASTE-YOUR-SHEET-ID/edit",
        ],
        ["your_name", "Alex"],
        ["business_name", "Studio North"],
        ["payment_link", "https://pay.example.com/studio-north"],
        ["remind_every_days", 3, "number"],
      ],
    }),
  );
  const load = w.node(
    sheetRead({
      name: "Load invoices",
      at: [440, 0],
      doc: "={{ $json.invoices_sheet_url }}",
      sheet: "Invoices",
    }),
  );
  const overdue = w.node(
    code({
      name: "Find overdue invoices",
      at: [660, 0],
      js: `
const cfg = $('⚙️ Settings').first().json;
const day = 24 * 60 * 60 * 1000;
const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
const every = Number(cfg.remind_every_days) || 3;

const due = [];
for (const [i, { json: row }] of $input.all().entries()) {
  if (!row.invoice_number || !row.client_email) continue;
  if (String(row.status || "").trim().toLowerCase() === "paid") continue;
  const dueDate = Date.parse(row.due_date);
  if (!Number.isFinite(dueDate) || dueDate >= today) continue;
  const last = Date.parse(row.last_reminded);
  if (Number.isFinite(last) && today - last < every * day) continue;
  due.push({
    json: { ...row, days_overdue: Math.round((today - dueDate) / day) },
    pairedItem: i,
  });
}
return due;
`,
    }),
  );
  const write = addAiStep(w, {
    name: "Write reminder",
    at: [900, 0],
    system:
      "You write payment reminder emails for a small business. Always polite and professional, never threatening. Keep the client relationship intact.",
    prompt: `=From: {{ $('⚙️ Settings').first().json.your_name }}, {{ $('⚙️ Settings').first().json.business_name }}
Payment link: {{ $('⚙️ Settings').first().json.payment_link }}

Invoice {{ $json.invoice_number }} for {{ $json.client_name }}
Amount: {{ $json.amount }} {{ $json.currency }}
Due: {{ $json.due_date }} ({{ $json.days_overdue }} days overdue)
Notes: {{ $json.notes || "none" }}

Write a short reminder (under 120 words, plain text).
Tone by days overdue: 1–7 friendly nudge, 8–30 clear and direct, over 30 firm final reminder that asks for a payment date.
Include the amount, invoice number and payment link.`,
    example: {
      subject: "Quick reminder: invoice INV-1001",
      body: "Hi Acme team,\n\nJust a friendly reminder...",
    },
  });
  const send = w.node(
    gmailSend({
      name: "Send reminder",
      at: [1200, 0],
      to: "={{ $('Find overdue invoices').item.json.client_email }}",
      subject: "={{ $json.output.subject }}",
      message: "={{ $json.output.body }}",
      html: false,
    }),
  );
  const mark = w.node(
    sheetUpdate({
      name: "Mark as reminded",
      at: [1420, 0],
      doc: "={{ $('⚙️ Settings').first().json.invoices_sheet_url }}",
      sheet: "Invoices",
      match: "invoice_number",
      map: {
        invoice_number:
          "={{ $('Find overdue invoices').item.json.invoice_number }}",
        last_reminded: "={{ $now.toISODate() }}",
      },
    }),
  );

  w.chain(trigger, cfg, load, overdue, write, send, mark);
  return w;
}
