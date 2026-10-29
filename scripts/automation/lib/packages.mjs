/**
 * The n8n products built from this folder. Each package becomes
 * out/<id>/workflows/*.json + out/<id>/<zip>, with store images in store/<id>/.
 */
export const PACKAGES = {
  kit: {
    slug: "ai-automation-starter-kit",
    source: "workflows",
    extras: { dir: "sheets", folder: "sheets" },
    zip: "Makeready-AI-Automation-Kit.zip",
    folder: "AI-Automation-Kit",
    readme: (titles, guides) => `MAKEREADY · AI AUTOMATION STARTER KIT
=====================================

What's in this folder
---------------------
workflows/   ${titles.length} n8n workflows, ready to import:
${titles.map((t) => `               - ${t}`).join("\n")}
sheets/      Google Sheets templates (CSV) used by some workflows

Quick start
-----------
1. Open n8n (n8n Cloud, or self-hosted n8n kept up to date).
2. Workflows → Create → "..." menu → Import from file → pick a .json file.
3. Read the note on the canvas and follow its setup steps.
4. Connect your accounts, click "Execute workflow" to test, then click "Publish"
   (older n8n versions: flip the "Active" switch).

For Google Sheets: in Google Drive, File → Import the matching CSV from
sheets/ (or create a sheet with the same header row), then paste the
sheet's URL into the workflow's Settings node.

The full step-by-step guides are ${guides}.
Questions: support@usemakeready.com
`,
    /** Store screenshots: n8n import-id prefix + [workflow no., file, caption]. */
    screenshotIds: "kitreal",
    shots: [
      [
        "01",
        "01-inbox-triage",
        "AI Inbox Triage: every email sorted, labelled and urgent ones flagged",
      ],
      [
        "03",
        "02-lead-capture",
        "Lead Capture: AI scores each lead, logs it to your CRM and replies in a minute",
      ],
      [
        "08",
        "03-faq-chatbot",
        "Website FAQ Chatbot: answers visitors from your own FAQ",
      ],
      [
        "06",
        "04-invoice-reminders",
        "Overdue Invoice Reminders: polite follow-ups that get paid",
      ],
      [
        "04",
        "05-content-repurposer",
        "Content Repurposer: one article into posts, threads and hooks",
      ],
      [
        "07",
        "06-meeting-recap",
        "Meeting Notes: recap email and tasks from any transcript",
      ],
    ],
    cover: {
      shot: "01",
      eyebrow: "MAKEREADY · AUTOMATION KIT",
      title: ["AI Automation", "Starter Kit"],
      sub: "10 ready-to-import n8n workflows",
      bullets: [
        "Inbox, leads, content, invoices",
        "Setup guide for every workflow",
        "Google Sheets templates included",
      ],
    },
  },
  course: {
    slug: "build-your-first-ai-agent",
    source: "agents",
    extras: { dir: "course-files", folder: "" },
    zip: "Makeready-AI-Agent-Course-Files.zip",
    folder: "AI-Agent-Course",
    readme: (titles, guides) => `MAKEREADY · BUILD YOUR FIRST AI AGENT
=====================================

What's in this folder
---------------------
workflows/   ${titles.length} example agents to import into n8n:
${titles.map((t) => `               - ${t}`).join("\n")}
System-Prompt-Template.txt   the instructions template from lesson 5

How to use
----------
Follow the lessons (${guides}). Each agent matches a lesson:
import it (Workflows → Create → "..." → Import from file), read the note on
the canvas, add your OpenAI key and click "Open chat".

Questions: support@usemakeready.com
`,
    screenshotIds: "agentreal",
    shots: [
      [
        "01",
        "01-research-buddy",
        "Agent 01 · Research Buddy: Wikipedia, calculator and step-by-step thinking",
      ],
      [
        "02",
        "02-inbox-assistant",
        "Agent 02 · Inbox Assistant: searches your Gmail and writes drafts",
      ],
      [
        "03",
        "03-calendar-assistant",
        "Agent 03 · Calendar Assistant: checks your week and books with your OK",
      ],
    ],
    cover: {
      shot: "02",
      eyebrow: "MAKEREADY · MINI-COURSE",
      title: ["Build Your First", "AI Agent"],
      sub: "No code · built in n8n · 9 lessons",
      bullets: [
        "3 working agents to import",
        "Tools, memory & safe instructions",
        "Connect Gmail and Calendar",
      ],
    },
  },
};

/** Where buyers find the guides, as worded in each README. */
export const GUIDES_ON_SITE = "in your Makeready library";

/** Package ids named on the command line, or all of them. */
export function selected(argv = process.argv.slice(2)) {
  const ids = argv.filter((a) => PACKAGES[a]);
  return ids.length ? ids : Object.keys(PACKAGES);
}
