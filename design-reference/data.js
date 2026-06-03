/* AISELLING — product catalog + content. Plain JS, attaches to window. */
(function () {
  const CATEGORIES = [
    { id: "prompts",    name: "Prompt Packs",        grad: "grad-prompts",    icon: "sparkles", count: 48, blurb: "Battle-tested prompt libraries for ChatGPT, Claude & Gemini." },
    { id: "templates",  name: "Notion & Productivity Templates", grad: "grad-templates", icon: "layers", count: 36, blurb: "Plug-and-play systems to run your work and life." },
    { id: "courses",    name: "AI Mini-Courses",      grad: "grad-courses",    icon: "play",     count: 21, blurb: "Short, practical courses — go from curious to capable." },
    { id: "automation", name: "Automation Kits",      grad: "grad-automation", icon: "bolt",     count: 29, blurb: "Done-for-you Zapier, Make & n8n workflows." },
    { id: "ebooks",     name: "Ebooks & Guides",      grad: "grad-ebooks",     icon: "book",     count: 18, blurb: "Deep, skimmable playbooks you'll actually finish." },
  ];

  const P = (o) => o;
  const PRODUCTS = [
    P({ id: "operator-vault", cat: "prompts", grad: "grad-prompts", glyph: "sparkles",
        title: "The Operator's Prompt Vault", author: "Maya Okafor", initials: "MO", authorHue: 240,
        price: 39, was: 59, rating: 4.9, reviews: 1284, sales: 9200, badge: "Bestseller",
        desc: "520+ copy-paste prompts for marketing, ops, research and writing — organized by job, not by hype.",
        lead: "A curated vault of 520+ production prompts, organized by the job you're actually trying to do — so you stop prompt-guessing and start shipping.",
        format: ["Notion database", "PDF", "Plain-text pack"],
        includes: [
          { icon: "grid", h: "520+ structured prompts", p: "Across 14 role-based categories." },
          { icon: "layers", h: "Notion vault included", p: "Filter by tool, role and use-case." },
          { icon: "bolt", h: "Prompt chaining recipes", p: "Multi-step flows for complex work." },
          { icon: "refresh", h: "Free lifetime updates", p: "New prompts added monthly." },
        ] }),
    P({ id: "second-brain", cat: "templates", grad: "grad-templates", glyph: "layers",
        title: "Second Brain OS", author: "Liam Verstraete", initials: "LV", authorHue: 210,
        price: 59, was: 0, rating: 4.8, reviews: 743, sales: 5400, badge: "Editor's pick",
        desc: "An all-in-one Notion workspace for notes, projects, goals and AI-assisted weekly reviews.",
        lead: "One Notion workspace to capture everything, connect it, and let AI surface what matters in your weekly review.",
        format: ["Notion template"],
        includes: [
          { icon: "layers", h: "12 connected databases", p: "Notes, tasks, projects, goals & more." },
          { icon: "sparkles", h: "AI weekly review", p: "Auto-prompts that summarize your week." },
          { icon: "grid", h: "8 dashboard views", p: "Today, week, quarter and life areas." },
          { icon: "book", h: "Setup video + guide", p: "Up and running in under 20 minutes." },
        ] }),
    P({ id: "ai-in-7", cat: "courses", grad: "grad-courses", glyph: "play",
        title: "AI in 7 Days", author: "Priya Nair", initials: "PN", authorHue: 160,
        price: 89, was: 129, rating: 4.9, reviews: 2106, sales: 14800, badge: "Bestseller",
        desc: "A 7-day, no-fluff course that takes non-technical pros from AI-curious to AI-fluent.",
        lead: "Seven focused days, ~30 minutes each. By the end you'll use AI confidently across writing, research, analysis and automation — no jargon, no code.",
        format: ["12 video lessons", "Workbook PDF", "Prompt cheatsheet"],
        includes: [
          { icon: "play", h: "12 video lessons", p: "~3.5 hours, mobile-friendly." },
          { icon: "book", h: "Action workbook", p: "Exercises after every lesson." },
          { icon: "sparkles", h: "Starter prompt kit", p: "80 prompts to use day one." },
          { icon: "shield", h: "Certificate of completion", p: "Share it on LinkedIn." },
        ] }),
    P({ id: "inbox-zero", cat: "automation", grad: "grad-automation", glyph: "bolt",
        title: "Inbox Zero Autopilot", author: "Dani Brooks", initials: "DB", authorHue: 60,
        price: 49, was: 0, rating: 4.7, reviews: 512, sales: 3100, badge: "New",
        desc: "A Make + Zapier kit that triages, drafts and files your email with AI — set up in an afternoon.",
        lead: "Pre-built automation blueprints that let AI triage your inbox, draft replies in your voice, and file the rest — works with Gmail & Outlook.",
        format: ["Make blueprint", "Zapier templates", "Setup guide"],
        includes: [
          { icon: "bolt", h: "6 ready blueprints", p: "Import and connect your accounts." },
          { icon: "sparkles", h: "AI reply drafting", p: "Replies written in your tone." },
          { icon: "grid", h: "Smart triage rules", p: "Auto-label, snooze and archive." },
          { icon: "refresh", h: "Works with free tiers", p: "No premium plan required." },
        ] }),
    P({ id: "nocode-ai", cat: "ebooks", grad: "grad-ebooks", glyph: "book",
        title: "The No-Code AI Playbook", author: "Sofia Marín", initials: "SM", authorHue: 330,
        price: 19, was: 29, rating: 4.8, reviews: 968, sales: 7600, badge: "",
        desc: "A 140-page field guide to building real AI workflows without writing a single line of code.",
        lead: "140 pages of practical, screenshot-rich playbooks for shipping AI workflows using only no-code tools.",
        format: ["PDF", "EPUB"],
        includes: [
          { icon: "book", h: "140 pages, 9 chapters", p: "Skimmable, with real examples." },
          { icon: "grid", h: "30+ workflow recipes", p: "Copy the patterns that fit you." },
          { icon: "layers", h: "Tool comparison matrix", p: "Pick the right stack fast." },
          { icon: "refresh", h: "Lifetime updates", p: "Revised every quarter." },
        ] }),
    P({ id: "content-engine", cat: "automation", grad: "grad-automation", glyph: "bolt",
        title: "Content Engine (n8n)", author: "Dani Brooks", initials: "DB", authorHue: 40,
        price: 69, was: 0, rating: 4.6, reviews: 341, sales: 2200, badge: "",
        desc: "A self-hosted n8n pipeline that turns one idea into a week of posts across every channel.",
        lead: "A complete n8n content pipeline: one input idea fans out into platform-native posts, scheduled and on-brand.",
        format: ["n8n workflow JSON", "Setup guide"],
        includes: [
          { icon: "bolt", h: "End-to-end pipeline", p: "Idea → draft → schedule." },
          { icon: "sparkles", h: "Brand voice presets", p: "Tune tone per channel." },
          { icon: "grid", h: "5 channel adapters", p: "LinkedIn, X, IG, blog, email." },
          { icon: "shield", h: "Self-hosted & private", p: "Your data never leaves." },
        ] }),
    P({ id: "client-portal", cat: "templates", grad: "grad-templates", glyph: "layers",
        title: "Client Portal OS", author: "Liam Verstraete", initials: "LV", authorHue: 200,
        price: 45, was: 0, rating: 4.7, reviews: 287, sales: 1900, badge: "",
        desc: "A polished Notion portal to onboard clients, share deliverables and collect feedback.",
        lead: "Give every client a clean, branded Notion portal — onboarding, files, status and feedback in one shareable link.",
        format: ["Notion template"],
        includes: [
          { icon: "layers", h: "Client-ready portal", p: "Duplicate per client in seconds." },
          { icon: "grid", h: "Onboarding checklist", p: "Never miss a kickoff step." },
          { icon: "book", h: "Deliverables hub", p: "Versioned files & approvals." },
          { icon: "sparkles", h: "AI status updates", p: "Draft weekly notes instantly." },
        ] }),
    P({ id: "mj-mastery", cat: "prompts", grad: "grad-prompts", glyph: "sparkles",
        title: "Midjourney Mastery Pack", author: "Maya Okafor", initials: "MO", authorHue: 285,
        price: 29, was: 39, rating: 4.8, reviews: 654, sales: 4300, badge: "",
        desc: "300+ Midjourney prompts and parameter recipes for product, brand and editorial imagery.",
        lead: "300+ tuned Midjourney prompts plus a parameter playbook, so you get the look you want on the first render.",
        format: ["Notion gallery", "PDF"],
        includes: [
          { icon: "sparkles", h: "300+ visual prompts", p: "Grouped by style & use." },
          { icon: "grid", h: "Parameter playbook", p: "Aspect, stylize, chaos explained." },
          { icon: "layers", h: "Reference gallery", p: "See every prompt's output." },
          { icon: "refresh", h: "Updated for v7", p: "Kept current with releases." },
        ] }),
  ];

  const TESTIMONIALS = [
    { quote: "I replaced three subscriptions with one prompt pack and a Notion template. My team actually uses these.", name: "Elena Rossi", role: "Ops Lead, Northwind", initials: "ER", hue: 240 },
    { quote: "The 7-day course finally made AI click for me. No code, no jargon — just things I now do every single day.", name: "Marcus Bell", role: "Founder, Bell & Co.", initials: "MB", hue: 160 },
    { quote: "Inbox Zero Autopilot saved me an hour a day in week one. Setup was genuinely an afternoon, like they promised.", name: "Aïcha Diallo", role: "Consultant", initials: "AD", hue: 40 },
  ];

  const LIBRARY = [
    { ...PRODUCTS[2], progress: 57, status: "In progress", meta: "7 of 12 lessons" },
    { ...PRODUCTS[0], progress: 100, status: "Downloaded", meta: "Updated 2 days ago" },
    { ...PRODUCTS[1], progress: 100, status: "Installed", meta: "Duplicated to workspace" },
    { ...PRODUCTS[3], progress: 30, status: "Setup started", meta: "2 of 6 blueprints" },
    { ...PRODUCTS[4], progress: 100, status: "Downloaded", meta: "PDF + EPUB" },
    { ...PRODUCTS[7], progress: 100, status: "Downloaded", meta: "Updated for v7" },
  ];

  window.AISELLING = { CATEGORIES, PRODUCTS, TESTIMONIALS, LIBRARY };
})();
