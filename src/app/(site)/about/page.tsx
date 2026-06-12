import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Aiselling exists: tested, ready-to-use AI products that close the gap between AI hype and AI actually helping you today.",
};

const VALUES = [
  {
    title: "Results over hype",
    body: "Every product is something you can use the same day you buy it. No filler, no “coming soon.”",
  },
  {
    title: "Buy once, own forever",
    body: "One-time pricing with lifetime access and free updates. No surprise subscriptions.",
  },
  {
    title: "Made for non-technical pros",
    body: "Clear, jargon-free AI products that help you do more — no code required.",
  },
];

const STANDARDS = [
  {
    title: "Tested before it ships",
    body: "If it hasn't earned its place in a real workflow, it doesn't go on the shelf. We sell systems we'd use ourselves.",
  },
  {
    title: "Outcomes, not volume",
    body: "We'd rather sell you 10 prompts that change how you work than 500 you'll never open. Specific beats big.",
  },
  {
    title: "Kept current",
    body: "Models and tools move fast. When they change, we update the products you already own — for free.",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-[860px] px-4 py-16 sm:px-6">
      <p className="eyebrow">Our story</p>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
        AI products that just work, for people who&apos;d rather ship.
      </h1>
      <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
        Aiselling is a curated storefront for premium AI products — prompt
        packs, automation kits, Notion systems, mini-courses and ebooks. We
        started it because the gap between &quot;AI is amazing&quot; and
        &quot;AI actually helped me today&quot; was full of noise. We fill that
        gap with tested, practical products.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className="bg-card rounded-xl border p-6">
            <h3 className="font-display font-semibold tracking-tight">
              {v.title}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {v.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          What we hold ourselves to
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Anyone can dump a prompt list online. Here&apos;s the bar every
          product on Aiselling has to clear before it earns your money.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {STANDARDS.map((s) => (
            <div key={s.title} className="bg-card rounded-xl border p-6">
              <h3 className="font-display font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-border-accent bg-card mt-16 flex flex-col items-start gap-4 rounded-2xl border p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Ready to find your next unfair advantage?
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Browse the catalog — instant delivery, lifetime access.
          </p>
        </div>
        <Link href="/products" className={cn(buttonVariants())}>
          Browse the catalog
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </main>
  );
}
