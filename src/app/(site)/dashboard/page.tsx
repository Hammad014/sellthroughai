import type { Metadata } from "next";
import Link from "next/link";
import { Download, LibraryBig, PlayCircle, Sparkles } from "lucide-react";
import { requireUser, getProfile } from "@/lib/auth";
import { listLibrary } from "@/lib/entitlements";
import { Cover } from "@/components/cover";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categoryName } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Library",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ purchased?: string }>;
}) {
  const user = await requireUser("/dashboard");
  const [profile, library, { purchased }] = await Promise.all([
    getProfile(),
    listLibrary(user.id),
    searchParams,
  ]);

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-12 sm:px-6">
      <header className="mb-8">
        <p className="eyebrow">Your account</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
          My Library
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""} —
          everything you own lives here.
        </p>
      </header>

      {purchased && (
        <div className="border-brand-line bg-brand-tint text-foreground mb-8 rounded-xl border px-4 py-3 text-sm">
          🎉 Thanks for your purchase! It should appear below within a few
          seconds. Refresh if you don&apos;t see it yet.
        </div>
      )}

      {library.length === 0 ? (
        <div className="bg-card flex flex-col items-center rounded-xl border px-6 py-20 text-center">
          <div className="bg-secondary text-muted-foreground grid size-14 place-items-center rounded-xl">
            <LibraryBig className="size-6" />
          </div>
          <h2 className="font-display mt-5 text-xl font-semibold">
            Your library is empty
          </h2>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Browse the catalog and your purchases will show up here with instant
            downloads and lifetime access.
          </p>
          <Link href="/products" className={cn(buttonVariants(), "mt-6")}>
            Browse the catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {library.map(({ id, product, receiptUrl }) => {
            const delivery = product.delivery_type;
            const badgeLabel =
              delivery === "gated"
                ? "Course"
                : delivery === "prompts"
                  ? "Prompts"
                  : "License";
            return (
              <div
                key={id}
                className="bg-card flex flex-col overflow-hidden rounded-xl border"
              >
                <div className="p-3">
                  <Cover
                    category={product.category}
                    coverImageUrl={product.cover_image_url}
                    title={product.title}
                    className="aspect-[16/10]"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-text-faint text-2xs font-mono tracking-wider uppercase">
                      {categoryName(product.category)}
                    </span>
                    <Badge variant="secondary" className="ml-auto">
                      {badgeLabel}
                    </Badge>
                  </div>
                  <h3 className="font-display leading-snug font-semibold tracking-tight">
                    {product.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {product.short_desc}
                  </p>

                  <div className="mt-auto pt-3">
                    {delivery === "gated" ? (
                      <Link
                        href={`/dashboard/courses/${product.slug}`}
                        className={cn(buttonVariants(), "w-full")}
                      >
                        <PlayCircle className="size-4" /> Open course
                      </Link>
                    ) : delivery === "prompts" ? (
                      <Link
                        href={`/dashboard/prompts/${product.slug}`}
                        className={cn(buttonVariants(), "w-full")}
                      >
                        <Sparkles className="size-4" /> Open prompt library
                      </Link>
                    ) : receiptUrl ? (
                      <a
                        href={receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants(), "w-full")}
                      >
                        <Download className="size-4" /> Download / license
                      </a>
                    ) : (
                      <span
                        className={cn(
                          buttonVariants({ variant: "secondary" }),
                          "pointer-events-none w-full opacity-70",
                        )}
                      >
                        Finalizing…
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
