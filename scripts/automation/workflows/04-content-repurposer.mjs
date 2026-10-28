import { Workflow } from "../lib/workflow.mjs";
import {
  addAiStep,
  code,
  formTrigger,
  httpGet,
  ifNode,
  settings,
  sheetAppend,
} from "../lib/nodes.mjs";

export const meta = {
  file: "04-Content-Repurposer",
  title: "Content Repurposer",
};

export function build() {
  const w = new Workflow("04 · Content Repurposer");

  w.sticky(
    "About this workflow",
    `## 04 · Content Repurposer
Paste a link to an article (or the text itself) into a simple form and get a LinkedIn post, an X thread, a newsletter intro and 5 hooks, saved to your **Content Bank** sheet.

### Setup (about 5 minutes)
1. Import **sheets/Content-Bank.csv** into Google Sheets and copy its URL
2. **⚙️ Settings**: paste the URL and describe your brand voice
3. **Repurpose · model**: add your OpenAI API key
4. **Save to Content Bank**: connect Google Sheets
5. Click **Publish** and bookmark **Content form** → *Production URL*

Works best with your own blog posts, talks or podcast transcripts.`,
    [-520, -260],
    { width: 440 },
  );

  const form = w.node(
    formTrigger({
      name: "Content form",
      at: [0, 0],
      title: "Repurpose a piece of content",
      description:
        "Paste a link OR the text. You'll find the results in your Content Bank sheet.",
      path: "repurpose",
      button: "Repurpose it",
      thanks: "Done! Your new posts are in the Content Bank sheet.",
      fields: [
        { label: "Article URL", required: false, placeholder: "https://…" },
        { label: "Or paste the text", type: "textarea", required: false },
      ],
    }),
  );
  const cfg = w.node(
    settings({
      at: [220, 0],
      fields: [
        [
          "brand_voice",
          "Friendly and practical. Short sentences, concrete examples, no hype words like 'game-changer'.",
        ],
        ["audience", "small business owners who are new to AI"],
        [
          "content_sheet_url",
          "https://docs.google.com/spreadsheets/d/PASTE-YOUR-SHEET-ID/edit",
        ],
      ],
    }),
  );
  const hasUrl = w.node(
    ifNode({
      name: "Got a link?",
      at: [440, 0],
      when: [['={{ $json["Article URL"] }}', "notEmpty"]],
    }),
  );
  const fetch = w.node(
    httpGet({
      name: "Fetch the article",
      at: [660, -100],
      url: '={{ $json["Article URL"] }}',
    }),
  );
  const clean = w.node(
    code({
      name: "Clean up the page",
      at: [880, -100],
      perItem: true,
      js: `
// Turn the fetched HTML into plain readable text for the AI.
const html = String($json.data ?? "");
const text = html
  .replace(/<(script|style|nav|header|footer|svg)[\\s\\S]*?<\\/\\1>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&#39;|&rsquo;/g, "'")
  .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
  .replace(/\\s+/g, " ")
  .trim();
return { json: { source_text: text.slice(0, 12000) } };
`,
    }),
  );

  const repurpose = addAiStep(w, {
    name: "Repurpose",
    at: [1120, 0],
    system:
      "You are a content strategist who turns long-form content into platform-native posts. Keep the author's ideas and facts; never invent statistics.",
    prompt: `=Brand voice: {{ $('⚙️ Settings').item.json.brand_voice }}
Audience: {{ $('⚙️ Settings').item.json.audience }}

Source content:
{{ $json.source_text || $('Content form').item.json["Or paste the text"] }}

Create:
- linkedin_post: 120–200 words, strong first line, short paragraphs, 3 hashtags at the end
- x_thread: 5–7 posts, each under 270 characters, first post is the hook
- newsletter_intro: 60–90 words that make readers want to click
- hooks: 5 alternative opening lines for short videos or posts`,
    example: {
      linkedin_post: "Most people use AI like a search engine...",
      x_thread: ["Hook post", "Second post", "Third post"],
      newsletter_intro: "This week I...",
      hooks: ["Hook 1", "Hook 2", "Hook 3", "Hook 4", "Hook 5"],
    },
  });

  const out = (f) => `={{ $json.output.${f} }}`;
  const save = w.node(
    sheetAppend({
      name: "Save to Content Bank",
      at: [1420, 0],
      doc: "={{ $('⚙️ Settings').item.json.content_sheet_url }}",
      sheet: "Content-Bank",
      map: {
        date: "={{ $now.toISODate() }}",
        source: `={{ $('Content form').item.json["Article URL"] || "pasted text" }}`,
        linkedin_post: out("linkedin_post"),
        x_thread: '={{ ($json.output.x_thread || []).join("\\n\\n") }}',
        newsletter_intro: out("newsletter_intro"),
        hooks: '={{ ($json.output.hooks || []).join("\\n") }}',
        status: "draft",
      },
    }),
  );

  w.chain(form, cfg, hasUrl);
  w.connect(hasUrl, fetch, { output: 0 });
  w.chain(fetch, clean, repurpose);
  w.connect(hasUrl, repurpose, { output: 1 });
  w.connect(repurpose, save);
  return w;
}
