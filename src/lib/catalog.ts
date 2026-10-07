import {
  Sparkles,
  Layers,
  PlayCircle,
  Zap,
  BookOpen,
  Package,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";

/**
 * Catalog category metadata. The DB `products.category` column stores the
 * category `slug`; everything visual (label, gradient, icon) is resolved here
 * so the database stays presentation-agnostic.
 */
export type CategorySlug =
  | "prompts"
  | "templates"
  | "courses"
  | "automation"
  | "ebooks"
  | "planners"
  | "bundles";

export interface Category {
  slug: CategorySlug;
  name: string;
  /** CSS gradient class defined in globals.css (cover art). */
  gradient: string;
  icon: LucideIcon;
  blurb: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: "prompts",
    name: "Prompt Packs",
    gradient: "grad-prompts",
    icon: Sparkles,
    blurb: "Battle-tested prompt libraries for ChatGPT, Claude & Gemini.",
  },
  {
    slug: "templates",
    name: "Notion & Templates",
    gradient: "grad-templates",
    icon: Layers,
    blurb: "Plug-and-play systems to run your work and life.",
  },
  {
    slug: "courses",
    name: "AI Mini-Courses",
    gradient: "grad-courses",
    icon: PlayCircle,
    blurb: "Short, practical courses — go from curious to capable.",
  },
  {
    slug: "automation",
    name: "Automation Kits",
    gradient: "grad-automation",
    icon: Zap,
    blurb: "Done-for-you Zapier, Make & n8n workflows.",
  },
  {
    slug: "ebooks",
    name: "Ebooks & Guides",
    gradient: "grad-ebooks",
    icon: BookOpen,
    blurb: "Deep, skimmable playbooks you'll actually finish.",
  },
  {
    slug: "planners",
    name: "Digital Planners",
    gradient: "grad-planners",
    icon: CalendarDays,
    blurb: "Hyperlinked planners for iPad & tablet — tap, plan, done.",
  },
  {
    slug: "bundles",
    name: "Bundles",
    gradient: "grad-prompts",
    icon: Package,
    blurb: "Our best value — multiple products at one discounted price.",
  },
];

const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function getCategory(slug: string): Category | undefined {
  return CATEGORY_MAP.get(slug as CategorySlug);
}

export function categoryName(slug: string): string {
  return getCategory(slug)?.name ?? slug;
}

export function categoryGradient(slug: string): string {
  return getCategory(slug)?.gradient ?? "grad-prompts";
}

/** Format a USD amount the way the design shows prices (e.g. $39, $19.50). */
export function formatPrice(value: number): string {
  const hasCents = Math.round(value * 100) % 100 !== 0;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
