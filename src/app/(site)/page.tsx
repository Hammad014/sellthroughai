import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { CATEGORIES } from "@/lib/catalog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Premium AI tools storefront",
};

export default function Home() {
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
              Content Engine for n8n just dropped
            </span>
            <h1 className="font-display mt-6 text-5xl leading-[0.98] font-semibold tracking-tight sm:text-6xl">
              AI tools that <span className="text-primary">just work</span>
              <br />— no code required.
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg leading-relaxed">
              Prompt packs, Notion systems, mini-courses and automation kits —
              curated for professionals who want results, not a research
              project.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Browse the catalog
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/products?category=courses"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                )}
              >
                See the courses
              </Link>
            </div>
            <div className="text-muted-foreground mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="text-primary size-4" /> Lifetime access
              </span>
              <span>120k+ happy buyers</span>
              <span>4.8/5 average rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-6">
        <div className="mb-10">
          <p className="eyebrow">Shop by category</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight">
            Find your next unfair advantage
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

      {/* CTA band */}
      <section className="mx-auto w-full max-w-[1320px] px-4 pb-20 sm:px-6">
        <div className="border-border-accent bg-card relative overflow-hidden rounded-3xl border p-10 text-center sm:p-16">
          <p className="eyebrow justify-center">Aiselling for teams</p>
          <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Equip your whole team to work with AI
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
            Bundle any products into a team license with shared seats,
            onboarding and volume pricing. One invoice, lifetime access.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/products"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Browse bundles
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
