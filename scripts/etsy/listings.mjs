/**
 * Etsy listing details per product: what goes in the listing form (title,
 * tags, price) and how the files are packaged. The description is built
 * from the product's own copy (catalog.mjs).
 *
 * Etsy limits: title ≤ 140 chars, 13 tags of ≤ 20 chars, 5 files ≤ 20 MB.
 */

/** kind: prompts | ebook | planner | n8n | bundle */
export const LISTINGS = {
  // ---- Prompt packs ------------------------------------------------------
  "founder-content-engine": {
    kind: "prompts",
    price: 14.99,
    title:
      "Founder Content Engine: 10 ChatGPT & Claude Prompts to Turn One Idea Into a Week of LinkedIn, X and Newsletter Content",
    tags: [
      "chatgpt prompts",
      "ai prompts",
      "linkedin content",
      "content creation",
      "social media plan",
      "founder tools",
      "claude prompts",
      "content calendar",
      "personal brand",
      "small business ai",
      "newsletter ideas",
      "digital download",
      "prompt engineering",
    ],
  },
  "cold-outreach-engine": {
    kind: "prompts",
    price: 14.99,
    title:
      "Cold Outreach Engine: 10 ChatGPT & Claude Prompts for Cold Emails, LinkedIn DMs and Follow-ups That Book Calls",
    tags: [
      "chatgpt prompts",
      "cold email",
      "sales prompts",
      "lead generation",
      "linkedin outreach",
      "ai prompts",
      "b2b sales",
      "email templates",
      "claude prompts",
      "freelancer tools",
      "sales script",
      "digital download",
      "small business ai",
    ],
  },
  "ai-chief-of-staff": {
    kind: "prompts",
    price: 14.99,
    title:
      "AI Chief of Staff: 10 ChatGPT & Claude Prompts for Email, Meetings, Planning and Decisions, Productivity Prompt Pack",
    tags: [
      "chatgpt prompts",
      "productivity",
      "ai assistant",
      "email prompts",
      "meeting notes",
      "ai prompts",
      "claude prompts",
      "time management",
      "executive tools",
      "work planner",
      "decision making",
      "digital download",
      "prompt pack",
    ],
  },
  "marketing-ads-engine": {
    kind: "prompts",
    price: 14.99,
    title:
      "Marketing & Ads Engine: 10 ChatGPT & Claude Prompts for Ad Copy, Landing Pages and Email Funnels, Marketing Prompt Pack",
    tags: [
      "chatgpt prompts",
      "marketing prompts",
      "ad copy",
      "facebook ads",
      "copywriting",
      "landing page",
      "email marketing",
      "ai prompts",
      "claude prompts",
      "small business",
      "sales funnel",
      "digital download",
      "prompt pack",
    ],
  },
  "freelancer-client-engine": {
    kind: "prompts",
    price: 14.99,
    title:
      "Freelancer Client Engine: 10 ChatGPT & Claude Prompts for Proposals, Pricing and Client Emails, Freelance Business Tools",
    tags: [
      "chatgpt prompts",
      "freelancer tools",
      "proposal template",
      "client emails",
      "freelance business",
      "ai prompts",
      "pricing guide",
      "claude prompts",
      "small business",
      "consultant tools",
      "side hustle",
      "digital download",
      "prompt pack",
    ],
  },
  "prompt-power-bundle": {
    kind: "bundle",
    price: 49.99,
    title:
      "AI Prompt Bundle: 50 ChatGPT & Claude Prompts for Content, Sales, Marketing, Productivity and Freelancing, 5 Prompt Packs",
    tags: [
      "chatgpt prompts",
      "ai prompt bundle",
      "prompt pack",
      "marketing prompts",
      "sales prompts",
      "content creation",
      "productivity",
      "claude prompts",
      "small business ai",
      "freelancer tools",
      "copywriting",
      "digital download",
      "prompt engineering",
    ],
  },

  // ---- Courses & guides (PDF ebooks) -------------------------------------
  "chatgpt-claude-for-beginners": {
    kind: "ebook",
    price: 12.99,
    title:
      "ChatGPT & Claude for Total Beginners: Plain-English AI Guide, 7 Lessons With Exercises, Printable PDF Ebook",
    tags: [
      "chatgpt guide",
      "ai for beginners",
      "chatgpt ebook",
      "learn ai",
      "claude ai",
      "ai course",
      "beginner guide",
      "printable ebook",
      "tech for seniors",
      "ai tutorial",
      "productivity",
      "digital download",
      "pdf guide",
    ],
  },
  "prompt-engineering-fundamentals": {
    kind: "ebook",
    price: 14.99,
    title:
      "Prompt Engineering Fundamentals: Write Better ChatGPT & Claude Prompts, 7-Lesson PDF Course With Templates",
    tags: [
      "prompt engineering",
      "chatgpt guide",
      "ai course",
      "prompt templates",
      "learn chatgpt",
      "claude ai",
      "ai ebook",
      "chatgpt prompts",
      "ai skills",
      "work smarter",
      "pdf course",
      "digital download",
      "ai tutorial",
    ],
  },
  "ai-at-work-playbook": {
    kind: "ebook",
    price: 9.99,
    title:
      "The AI-at-Work Playbook: Practical ChatGPT & Claude Guide for Busy Professionals, 8 Chapters, PDF Ebook",
    tags: [
      "ai at work",
      "chatgpt guide",
      "ai ebook",
      "productivity",
      "work smarter",
      "office skills",
      "claude ai",
      "career guide",
      "business ebook",
      "ai for work",
      "time saving",
      "digital download",
      "pdf guide",
    ],
  },
  "build-your-first-ai-agent": {
    kind: "n8n",
    package: "course",
    guideTitle: "Course Lessons",
    price: 24.99,
    title:
      "Build Your First AI Agent, No Code: n8n Mini Course, 9 Lessons + 3 AI Agents (Research, Gmail, Calendar) PDF + Files",
    tags: [
      "ai agent",
      "n8n",
      "no code",
      "ai automation",
      "chatgpt",
      "ai course",
      "workflow",
      "gmail automation",
      "openai",
      "small business ai",
      "ai assistant",
      "digital download",
      "automation",
    ],
  },

  // ---- n8n kit -----------------------------------------------------------
  "ai-automation-starter-kit": {
    kind: "n8n",
    package: "kit",
    guideTitle: "Setup Guide",
    price: 24.99,
    title:
      "AI Automation Starter Kit: 10 n8n Workflow Templates for Gmail, Leads, Invoices and Content + Setup Guide, No Code",
    tags: [
      "n8n templates",
      "n8n workflow",
      "ai automation",
      "workflow template",
      "no code",
      "gmail automation",
      "chatgpt",
      "small business",
      "lead generation",
      "invoice reminder",
      "ai tools",
      "digital download",
      "automation",
    ],
  },
  "ai-automation-bundle": {
    kind: "bundle",
    price: 39.99,
    title:
      "AI Automation Bundle: 10 n8n Workflow Templates + Build Your First AI Agent Course, No Code Automation for Small Business",
    tags: [
      "n8n templates",
      "ai automation",
      "ai agent",
      "n8n workflow",
      "no code",
      "workflow template",
      "chatgpt",
      "small business",
      "ai course",
      "gmail automation",
      "automation bundle",
      "digital download",
      "openai",
    ],
  },

  // ---- Planners ----------------------------------------------------------
  "clarity-digital-planner": {
    kind: "planner",
    price: 12.99,
    title:
      "2027 Digital Planner, Hyperlinked iPad Planner for GoodNotes & Notability, Undated Option, Daily Weekly Monthly, Light & Dark",
    tags: [
      "digital planner",
      "2027 planner",
      "goodnotes planner",
      "ipad planner",
      "hyperlinked planner",
      "undated planner",
      "daily planner",
      "weekly planner",
      "notability planner",
      "dark mode planner",
      "minimalist planner",
      "goal planner",
      "android planner",
    ],
  },
  "focus-adhd-digital-planner": {
    kind: "planner",
    price: 11.99,
    title:
      "ADHD Digital Planner 2027, Hyperlinked GoodNotes Planner, Brain Dump, Time Blocks, Task Breakdown, Undated, Light & Dark",
    tags: [
      "adhd planner",
      "digital planner",
      "adhd digital planner",
      "goodnotes planner",
      "ipad planner",
      "2027 planner",
      "undated planner",
      "brain dump",
      "time blocking",
      "neurodivergent",
      "focus planner",
      "habit tracker",
      "daily planner",
    ],
  },
  "budget-digital-planner": {
    kind: "planner",
    price: 9.99,
    title:
      "Digital Budget Planner 2027, Hyperlinked GoodNotes Finance Planner, Bill Tracker, Savings & Debt Payoff, Undated Option",
    tags: [
      "budget planner",
      "digital budget",
      "finance planner",
      "goodnotes planner",
      "ipad planner",
      "bill tracker",
      "savings tracker",
      "debt payoff",
      "expense tracker",
      "2027 planner",
      "money planner",
      "no spend challenge",
      "undated planner",
    ],
  },
  "new-year-planner-bundle": {
    kind: "bundle",
    price: 24.99,
    title:
      "2027 Digital Planner Bundle: Life Planner + ADHD Planner + Budget Planner, Hyperlinked GoodNotes iPad Planners, Light & Dark",
    tags: [
      "planner bundle",
      "digital planner",
      "2027 planner",
      "adhd planner",
      "budget planner",
      "goodnotes planner",
      "ipad planner",
      "hyperlinked planner",
      "daily planner",
      "finance planner",
      "dark mode planner",
      "android planner",
      "new year planner",
    ],
  },
};

/** Fail loudly if a listing breaks Etsy's limits. */
export function checkListing(slug, l) {
  const errors = [];
  if (l.title.length > 140) errors.push(`title is ${l.title.length} chars`);
  if (l.tags.length !== 13) errors.push(`${l.tags.length} tags (need 13)`);
  for (const t of l.tags)
    if (t.length > 20) errors.push(`tag "${t}" is ${t.length} chars`);
  if (new Set(l.tags).size !== l.tags.length) errors.push("duplicate tags");
  if (errors.length) throw new Error(`${slug}: ${errors.join("; ")}`);
}
