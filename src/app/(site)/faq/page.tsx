import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "FAQ" };

// PLACEHOLDER COPY — edit freely.
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "How do I get my products after buying?",
    a: "Purchases appear instantly in your library at /dashboard, with downloads and any course lessons. You'll also get an email receipt.",
  },
  {
    q: "Do I need an account?",
    a: (
      <>
        Yes — a free account holds your purchases. You can sign in with a{" "}
        <Link href="/login">magic link or Google</Link>; no password to
        remember.
      </>
    ),
  },
  {
    q: "Is it a one-time purchase or a subscription?",
    a: "One-time. You buy a product once and keep lifetime access, including free updates where noted on the product page.",
  },
  {
    q: "What formats do products come in?",
    a: "It depends on the product — Notion templates, PDFs, plain-text prompt packs, automation blueprints (Make / Zapier / n8n) and video lessons. Each product page lists its formats.",
  },
  {
    q: "Can I get a refund?",
    a: (
      <>
        Yes, within 14 days under our{" "}
        <Link href="/refund-policy">refund policy</Link>.
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
