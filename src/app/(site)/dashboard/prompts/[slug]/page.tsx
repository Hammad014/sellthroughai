import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { requireUser, getProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { getProductPrompts, hasEntitlement } from "@/lib/entitlements";
import { categoryName } from "@/lib/catalog";
import { PromptItem } from "@/components/prompts/prompt-item";
import type { Product } from "@/lib/supabase/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Prompts · ${slug}` };
}

export default async function PromptLibraryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser(`/dashboard/prompts/${slug}`);

  const supabase = createServiceClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<Product>();
  if (!product) notFound();

  // Must own it — or be an admin previewing. Otherwise → sales page.
  const owns = await hasEntitlement(user.id, product.id);
  const adminPreview = owns ? false : isAdmin(await getProfile());
  if (!owns && !adminPreview) redirect(`/products/${slug}`);

  const prompts = await getProductPrompts(product.id);

  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-12 sm:px-6">
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Back to library
      </Link>

      {adminPreview && (
        <div className="border-brand-line bg-brand-tint text-foreground mb-6 rounded-lg border px-4 py-2 text-sm">
          Admin preview — you&apos;re viewing this content without owning it.
        </div>
      )}

      <p className="eyebrow">{categoryName(product.category)}</p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {product.title}
      </h1>
      <p className="text-muted-foreground mt-3 text-lg">{product.short_desc}</p>

      <div className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
        <Sparkles className="text-primary size-4" />
        {prompts.length} {prompts.length === 1 ? "prompt" : "prompts"} · copy any
        one with a click. Replace the{" "}
        <span className="font-mono">[BRACKETED]</span> parts with your details.
      </div>

      <div className="mt-10 space-y-5">
        {prompts.length === 0 ? (
          <p className="text-muted-foreground">
            Prompts are being added — check back soon.
          </p>
        ) : (
          prompts.map((prompt, i) => (
            <PromptItem key={prompt.id} prompt={prompt} index={i} />
          ))
        )}
      </div>
    </main>
  );
}
