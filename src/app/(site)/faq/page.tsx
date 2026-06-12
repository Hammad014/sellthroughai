import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "FAQ" };

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "How do I get my products after buying?",
    a: "Everything lands instantly in your library at /dashboard. Downloads are there to grab, prompt libraries open in the browser, and courses open in the player. You'll also get an email receipt.",
  },
  {
    q: "What exactly is a prompt library?",
    a: "Some products are in-app prompt libraries: a curated set of prompts you browse right inside your dashboard and copy with one click. Each prompt tells you when to use it, has the spots you fill in marked like [THIS], and includes a worked example so you can see what good output looks like.",
  },
  {
    q: "Will the prompts work with my AI tool?",
    a: "Yes. The prompts are written to work with any modern assistant — ChatGPT, Claude, Gemini and others. Where a specific model does noticeably better, the prompt says so.",
  },
  {
    q: "Do I need an account?",
    a: (
      <>
        Yes — a free account holds your purchases. Create one with your{" "}
        <Link href="/login">email and a password</Link> at checkout or sign-in.
      </>
    ),
  },
  {
    q: "Is it a one-time purchase or a subscription?",
    a: "One-time. You buy a product once and keep lifetime access, including the free updates we ship as models and tools change.",
  },
  {
    q: "What formats do products come in?",
    a: "It depends on the product — in-app prompt libraries, Notion templates, PDFs, automation blueprints (Make / Zapier / n8n) and video lessons. Each product page lists exactly what's inside.",
  },
  {
    q: "Can I share or resell what I buy?",
    a: "Your purchase is for you (or your business). You're welcome to use the outputs you create however you like — but please don't redistribute or resell the products themselves. Need multiple seats? See team pricing below.",
  },
  {
    q: "Can I get a refund?",
    a: (
      <>
        Yes, within 14 days, no questions asked — see our{" "}
        <Link href="/refund-policy">refund policy</Link>. If a product
        doesn&apos;t help you, you shouldn&apos;t pay for it.
      </>
    ),
  },
  {
    q: "Do you offer team or volume pricing?",
    a: "Yes — reach out and we'll bundle products into a team license with shared seats and one invoice.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-16 sm:px-6">
      <p className="eyebrow">Help center</p>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">
        Frequently asked questions
      </h1>
      <p className="text-muted-foreground mt-4">
        Can&apos;t find what you need? Email{" "}
        <a
          href="mailto:[support@yourdomain.com]"
          className="text-primary underline"
        >
          [support@yourdomain.com]
        </a>
        .
      </p>

      <div className="mt-10 space-y-4">
        {FAQS.map((item) => (
          <div key={item.q} className="bg-card rounded-xl border p-6">
            <h2 className="font-display font-semibold tracking-tight">
              {item.q}
            </h2>
            <p className="text-muted-foreground [&_a]:text-primary mt-2 leading-relaxed [&_a]:underline">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
