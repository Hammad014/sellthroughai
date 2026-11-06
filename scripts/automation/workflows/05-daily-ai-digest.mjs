import { Workflow } from "../lib/workflow.mjs";
import {
  addAiStep,
  aggregateAll,
  code,
  gmailSend,
  rss,
  schedule,
  settings,
} from "../lib/nodes.mjs";

export const meta = {
  file: "05-Daily-AI-News-Digest",
  title: "Daily AI News Digest",
};

export function build() {
  const w = new Workflow("05 · Daily AI News Digest");

  w.sticky(
    "About this workflow",
    `## 05 · Daily AI News Digest
Every morning, the latest posts from the news sites you choose are read, the noise is filtered out, and a 2-minute email digest lands in your inbox with the stories that matter to *you*.

### Setup (about 3 minutes)
1. **⚙️ Settings**: your email, what you care about, and your feeds (any RSS feeds, one per line). The defaults cover AI news; swap in your industry's
2. **Write digest · model**: add your OpenAI API key
3. **Email me the digest**: connect Gmail
4. **Every morning**: change the time if 8:00 doesn't suit you
5. Click **Execute workflow** to get today's digest, then click **Publish**

Most blogs have a feed at /feed or /rss. Search "<site> RSS" to find it.`,
    [-520, -260],
    { width: 440 },
  );

  const trigger = w.node(
    schedule({
      name: "Every morning",
      at: [0, 0],
      interval: { field: "days", daysInterval: 1, triggerAtHour: 8 },
    }),
  );
  const cfg = w.node(
    settings({
      at: [220, 0],
      fields: [
        ["send_to", "you@example.com"],
        [
          "interests",
          "practical AI tools for small businesses, new model releases, automation",
        ],
        [
          "feeds",
          [
            "https://techcrunch.com/category/artificial-intelligence/feed/",
            "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
            "https://hnrss.org/newest?q=AI&points=100",
          ].join("\n"),
        ],
      ],
    }),
  );
  const list = w.node(
    code({
      name: "One item per feed",
      at: [440, 0],
      js: `
const feeds = String($input.first().json.feeds || "")
  .split(/[\\n,]+/)
  .map((url) => url.trim())
  .filter(Boolean);
return feeds.map((url) => ({ json: { url } }));
`,
    }),
  );
  const read = w.node({
    ...rss({ name: "Read feeds", at: [660, 0], url: "={{ $json.url }}" }),
    // One broken feed shouldn't stop the whole digest.
    extra: { onError: "continueRegularOutput" },
  });
  const recent = w.node(
    code({
      name: "Last 24 hours only",
      at: [880, 0],
      js: `
const since = Date.now() - 24 * 60 * 60 * 1000;
const seen = new Set();
const stories = [];
for (const [i, { json }] of $input.all().entries()) {
  if (!json.title || !json.link || seen.has(json.link)) continue;
  const published = Date.parse(json.isoDate || json.pubDate || "");
  if (Number.isFinite(published) && published < since) continue;
  seen.add(json.link);
  stories.push({
    json: {
      title: json.title,
      link: json.link,
      snippet: String(json.contentSnippet || json.content || "").slice(0, 400),
    },
    pairedItem: i,
  });
}
return stories.slice(0, 40);
`,
    }),
  );
  const all = w.node(
    aggregateAll({
      name: "Bundle the stories",
      at: [1100, 0],
      field: "stories",
    }),
  );
  const digest = addAiStep(w, {
    name: "Write digest",
    at: [1320, 0],
    system:
      "You write a short, skimmable morning news digest. Only use the stories provided and keep every link exactly as given.",
    prompt: `=Reader's interests: {{ $('⚙️ Settings').first().json.interests }}

Today's stories (JSON):
{{ JSON.stringify($json.stories) }}

Pick the 5–7 stories most relevant to the reader. For each, write a bold headline linked to the story and one or two sentences on why it matters to them. Skip duplicates and fluff. Finish with a one-line "Also worth a look" list of up to 3 more links.

Return only the email body as simple HTML (<p>, <b>, <a>, <ul>, <li>). No markdown, no code fences.`,
  });
  const send = w.node(
    gmailSend({
      name: "Email me the digest",
      at: [1620, 0],
      to: "={{ $('⚙️ Settings').first().json.send_to }}",
      subject: "=☕ Your AI digest · {{ $now.toFormat('ccc d LLL') }}",
      message: "={{ $json.text }}",
    }),
  );

  w.chain(trigger, cfg, list, read, recent, all, digest, send);
  return w;
}
