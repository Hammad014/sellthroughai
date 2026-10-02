import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Flame,
  ShieldCheck,
  Search,
  CreditCard,
  Rocket,
  Clock,
  RefreshCw,
  Lock,
  Target,
} from "lucide-react";
import { CATEGORIES } from "@/lib/catalog";
import { getFeaturedProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Premium AI products — prompts, automations & more",
  description:
    "Buy ready-made AI products: prompt packs, automation kits, Notion systems, mini-courses and ebooks. Instant delivery, lifetime access.",
};

const WHO_ITS_FOR = [
  {
    title: "Founders & solopreneurs",
    body: "Wear every hat without hiring for each one. Ship marketing, ops and content with AI doing the heavy lifting.",
  },
  {
    title: "Marketers & creators",
    body: "Turn one idea into a week of content. Prompts and systems tuned for real campaigns, not demos.",
  },
  {
    title: "Freelancers & agencies",
    body: "Deliver more for clients in less time, and resell the output as premium work.",
  },
  {
    title: "Busy professionals",
    body: "Research, summarize, draft and plan faster — even if you've never written a prompt in your life.",
  },
];

const STEPS = [
  {
    icon: Search,
    title: "Find what fits",
    body: "Browse by category — prompts, automations, templates, courses, ebooks. Every product says exactly what it does and who it's for.",
  },
  {
    icon: CreditCard,
    title: "Buy in one click",
    body: "Secure one-time checkout. No subscription, no account hoops. Your purchase lands in your library instantly.",
  },
  {
    icon: Rocket,
    title: "Use it today",
    body: "Download the files or open the lessons and put it to work the same day — with free updates for life.",
  },
];

const BENEFITS = [
  {
    icon: Clock,
    title: "Save days of trial & error",
    body: "Skip the prompt-guessing and tutorial rabbit holes. Start from something proven.",
  },
  {
    icon: ShieldCheck,
    title: "Tested, not theoretical",
    body: "Every product is used in real workflows before it goes on sale. No filler.",
  },
  {
    icon: RefreshCw,
    title: "Buy once, updated forever",
    body: "One-time price, lifetime access, and free updates as tools and models change.",
  },
  {
    icon: Lock,
    title: "Risk-free",
    body: "Instant delivery and a 14-day no-questions refund. If it doesn't help, you don't pay.",
  },
];

export default async function Home() {
  const featured = await getFeaturedProducts(4);

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% -10%, var(--brand-tint), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-[1320px] px-4 pt-16 pb-20 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="border-border bg-card inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium">
              <span className="bg-brand-tint text-primary text-2xs rounded-[6px] px-2 py-0.5 font-mono uppercase">
                New
              </span>
              Fresh AI products added every week
            </span>
            <h1 className="font-display mt-6 text-5xl leading-[0.98] font-semibold tracking-tight sm:text-6xl">
              Premium AI products,{" "}
              <span className="text-primary">ready to use.</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg leading-relaxed">
              AI prompt packs, automation kits, Notion systems, mini-courses and
              ebooks — ready-made digital products for people who want results,
              not a research project.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Browse all products
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/products?category=prompts"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                )}
              >
                Explore prompt packs
              </Link>
            </div>
            <div className="text-muted-foreground mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="text-primary size-4" /> Instant delivery
              </span>
              <span>Lifetime access &amp; updates</span>
              <span>14-day refund</span>
            </div>
          </div>
        </div>
      </section>

      {/* What is this / who it's for */}
      <section className="border-y bg-card/40">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow">
              <Target className="size-3.5" /> What is Promptory?
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight">
              The gap between &ldquo;AI is amazing&rdquo; and &ldquo;AI actually
              helped me today.&rdquo;
            </h2>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              Everyone knows AI is powerful. Almost no one has time to figure out
              the right prompts, build the automations, or design the system.
              Promptory is a curated store of <strong>done-for-you AI products</strong>
              — built, tested, and ready to drop into your work the moment you buy.
              No subscriptions, no learning curve, no blank page.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {WHO_ITS_FOR.map((p) => (
              <div key={p.title} className="bg-card rounded-xl border p-5">
                <h3 className="font-display font-semibold tracking-tight">
                  {p.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <p className="eyebrow justify-center">How it works</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight">
            From &ldquo;I need this&rdquo; to using it — in minutes
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="bg-card relative rounded-xl border p-6">
              <span className="text-text-faint font-mono text-sm">
                0{i + 1}
              </span>
              <div className="bg-secondary text-primary mt-3 grid size-11 place-items-center rounded-md border">
                <s.icon className="size-5" />
              </div>
              <h3 className="font-display mt-4 text-lg font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products (from the database) */}
      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-[1320px] px-4 py-8 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">
                <Flame className="size-3.5" /> Trending now
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight">
                Featured products
              </h2>
            </div>
            <Link
              href="/products"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-6">
        <div className="mb-10">
          <p className="eyebrow">Shop by category</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight">
            Browse AI products by category
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="group bg-card hover:border-border-accent relative overflow-hidden rounded-xl border p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
            >
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -top-10 -right-10 size-40 rounded-full opacity-50 blur-3xl",
                  c.gradient,
                )}
              />
              <div className="bg-secondary text-primary relative grid size-12 place-items-center rounded-md border">
                <c.icon className="size-5" />
              </div>
              <h3 className="font-display relative mt-5 text-xl font-semibold tracking-tight">
                {c.name}
              </h3>
              <p className="text-muted-foreground relative mt-2 text-sm">
                {c.blurb}
              </p>
              <span className="text-text-faint text-2xs relative mt-4 inline-flex items-center gap-2 font-mono tracking-wider uppercase">
                Explore <ArrowRight className="size-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Why ready-made */}
      <section className="border-t bg-card/40">
        <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6">
          <div className="mb-10">
            <p className="eyebrow">Why buy ready-made</p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight">
              The fastest path is the one someone already walked
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
              You could spend weekends prompt-engineering and wiring up tools —
              or start from something that already works and spend that time on
              your actual work.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-card rounded-xl border p-6">
                <div className="bg-secondary text-primary grid size-11 place-items-center rounded-md border">
                  <b.icon className="size-5" />
                </div>
                <h3 className="font-display mt-4 font-semibold tracking-tight">
                  {b.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto w-full max-w-[1320px] px-4 py-20 sm:px-6">
        <div className="border-border-accent bg-card relative overflow-hidden rounded-3xl border p-10 text-center sm:p-16">
          <p className="eyebrow justify-center">Promptory for teams</p>
          <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Equip your whole team to work with AI
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
            Equip your whole team with AI products under one license — shared
            seats, onboarding and volume pricing. One invoice, lifetime access.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/products"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Browse all products
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
