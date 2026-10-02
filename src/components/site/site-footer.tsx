import Link from "next/link";
import { Logo } from "@/components/logo";

type Col = { heading: string; links: { label: string; href: string }[] };

const COLUMNS: Col[] = [
  {
    heading: "Products",
    links: [
      { label: "Prompt Packs", href: "/products?category=prompts" },
      { label: "Notion Templates", href: "/products?category=templates" },
      { label: "Mini-Courses", href: "/products?category=courses" },
      { label: "Automation Kits", href: "/products?category=automation" },
      { label: "Ebooks", href: "/products?category=ebooks" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Browse catalog", href: "/products" },
      { label: "My Library", href: "/dashboard" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Refund policy", href: "/refund-policy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-bg-subtle mt-auto border-t">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-[1.6fr_repeat(4,1fr)] md:py-16">
          <div className="col-span-2 max-w-[30ch] md:col-span-1">
            <Logo />
            <p className="text-muted-foreground mt-4 text-sm">
              Premium AI products — prompts, automations, templates and courses
              for people who want results. Buy once, own forever.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-text-faint text-2xs font-mono tracking-wider uppercase">
                {col.heading}
              </h4>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-text-faint flex flex-wrap items-center justify-between gap-4 border-t py-6 text-xs">
          <p>
            © {new Date().getFullYear()} Promptory — Crafted for the
            AI-curious.
          </p>
          <p className="font-mono tracking-wider uppercase">
            Made with Next.js + Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
