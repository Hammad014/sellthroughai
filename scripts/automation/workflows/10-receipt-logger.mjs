import { Workflow } from "../lib/workflow.mjs";
import {
  addAiStep,
  extractPdf,
  gmailTrigger,
  settings,
  sheetAppend,
} from "../lib/nodes.mjs";

export const meta = {
  file: "10-Receipt-and-Expense-Logger",
  title: "Receipt & Expense Logger",
};

export function build() {
  const w = new Workflow("10 · Receipt & Expense Logger");

  w.sticky(
    "About this workflow",
    `## 10 · Receipt & Expense Logger
Every receipt or invoice that arrives as a PDF in Gmail is read by AI: vendor, date, amount, currency and category go straight into your **Expenses** sheet. Tax time, sorted.

### Setup (about 5 minutes)
1. Import **sheets/Expenses.csv** into Google Sheets and copy its URL
2. **⚙️ Settings**: paste the URL and adjust your expense categories
3. **New receipt email**: connect Gmail. The search finds PDF receipts and invoices; tweak it if yours look different
4. **Read the receipt · model**: add your OpenAI API key
5. **Log the expense**: connect Google Sheets
6. Click **Publish** to switch it on

Forward old receipts to yourself to back-fill the sheet.`,
    [-520, -260],
    { width: 440 },
  );

  const trigger = w.node(
    gmailTrigger({
      name: "New receipt email",
      at: [0, 0],
      q: "has:attachment filename:pdf (receipt OR invoice OR order OR payment)",
      attachments: true,
    }),
  );
  const cfg = w.node(
    settings({
      at: [220, 0],
      fields: [
        [
          "expenses_sheet_url",
          "https://docs.google.com/spreadsheets/d/PASTE-YOUR-SHEET-ID/edit",
        ],
        [
          "categories",
          "Software, Hardware, Travel, Meals, Office, Marketing, Professional services, Other",
        ],
      ],
    }),
  );
  const pdf = w.node({
    ...extractPdf({ at: [440, 0], binary: "attachment_0" }),
    // Some receipts are images or protected PDFs — fall back to the email text.
    extra: { onError: "continueRegularOutput" },
  });
  const read = addAiStep(w, {
    name: "Read the receipt",
    at: [680, 0],
    system:
      "You extract expense data from receipts. Use only what's in the document. Dates as YYYY-MM-DD. Amount is the final total paid, as a number.",
    prompt: `=Categories to choose from: {{ $('⚙️ Settings').item.json.categories }}

Email subject: {{ $('New receipt email').item.json.subject }}
From: {{ $('New receipt email').item.json.from?.text }}

Receipt text:
{{ ($json.text || $('New receipt email').item.json.text || "").slice(0, 8000) }}`,
    example: {
      vendor: "Notion Labs",
      date: "2027-01-12",
      amount: 10,
      currency: "USD",
      category: "Software",
      description: "Notion Plus, monthly",
    },
  });
  const out = (f) => `={{ $json.output.${f} }}`;
  const log = w.node(
    sheetAppend({
      name: "Log the expense",
      at: [980, 0],
      doc: "={{ $('⚙️ Settings').item.json.expenses_sheet_url }}",
      sheet: "Expenses",
      map: {
        date: out("date"),
        vendor: out("vendor"),
        amount: out("amount"),
        currency: out("currency"),
        category: out("category"),
        description: out("description"),
        source_email: "={{ $('New receipt email').item.json.subject }}",
      },
    }),
  );

  w.chain(trigger, cfg, pdf, read, log);
  return w;
}
