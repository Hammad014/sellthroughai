import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { requireUser, getProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { getCourseContent, hasEntitlement } from "@/lib/entitlements";
import { FILES_BUCKET } from "@/lib/storage";
import { Markdown } from "@/components/markdown";
import { categoryName } from "@/lib/catalog";
import type { Product } from "@/lib/supabase/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Library · ${slug}` };
}

export default async function CoursePlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser(`/dashboard/courses/${slug}`);

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

  const { lessons, files } = await getCourseContent(product.id);
  const isPlanner = product.category === "planners";
  const stepLabel = isPlanner
    ? "Step"
    : product.category === "ebooks"
      ? "Chapter"
      : "Lesson";

  // Sign lesson videos (longer-lived for streaming inside the player).
  const lessonsWithVideo = await Promise.all(
    lessons.map(async (lesson) => {
      let videoUrl: string | null = null;
      if (lesson.video_path) {
        const { data } = await supabase.storage
          .from(FILES_BUCKET)
          .createSignedUrl(lesson.video_path, 60 * 60 * 2);
        videoUrl = data?.signedUrl ?? null;
      }
      return { ...lesson, videoUrl };
    }),
  );

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

      {/* Planner downloads — the product itself, so they lead the page */}
      {isPlanner && files.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Your planner files
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Download the version you like (or all of them) and open it in
            GoodNotes, Notability, Noteshelf, Xodo or Samsung Notes. New to
            digital planners? The setup guide below walks you through it.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {files.map((f) => (
              <li key={f.id}>
                <a
                  href={`/api/download?file=${f.id}`}
                  className="bg-card hover:border-border-accent group flex items-center gap-3 rounded-xl border p-4 transition-colors"
                >
                  <span className="bg-brand-tint text-primary grid size-10 shrink-0 place-items-center rounded-lg">
                    <FileText className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {plannerFileLabel(f.file_name)}
                    </span>
                    <span className="text-text-faint block truncate font-mono text-xs">
                      {f.file_name}
                    </span>
                  </span>
                  <Download className="text-muted-foreground group-hover:text-primary size-4 shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Downloadable resources */}
      {!isPlanner && files.length > 0 && (
        <section className="bg-card mt-8 rounded-xl border p-5">
          <h2 className="font-display flex items-center gap-2 text-sm font-semibold">
            <Download className="size-4" /> Resources
          </h2>
          <ul className="mt-3 space-y-2">
            {files.map((f) => (
              <li key={f.id}>
                <a
                  href={`/api/download?file=${f.id}`}
                  className="text-primary inline-flex items-center gap-2 text-sm hover:underline"
                >
                  <FileText className="size-4" /> {f.file_name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Lessons */}
      <div className="mt-10 space-y-12">
        {lessonsWithVideo.length === 0 ? (
          <p className="text-muted-foreground">
            Lessons are being added — check back soon.
          </p>
        ) : (
          lessonsWithVideo.map((lesson, i) => (
            <article
              key={lesson.id}
              className="border-t pt-8 first:border-t-0 first:pt-0"
            >
              <p className="text-text-faint text-2xs font-mono tracking-wider uppercase">
                {stepLabel} {i + 1}
              </p>
              <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight">
                {lesson.title}
              </h2>

              {lesson.videoUrl && (
                <video
                  controls
                  preload="metadata"
                  src={lesson.videoUrl}
                  className="border-border mt-4 aspect-video w-full rounded-xl border bg-black"
                />
              )}

              {lesson.content_md && (
                <div className="mt-4">
                  <Markdown>{lesson.content_md}</Markdown>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </main>
  );
}

/** "Clarity-Planner-2027-Monday-Paper.pdf" → "2027 · Monday start · Paper". */
function plannerFileLabel(fileName: string): string {
  const parts = fileName.replace(/\.pdf$/i, "").split("-");
  const tail = parts.slice(2); // drop "<Name>-Planner"
  if (tail[0] === "Undated") return `Undated · ${tail.slice(1).join(" ")}`;
  if (tail.length === 3) return `${tail[0]} · ${tail[1]} start · ${tail[2]}`;
  return tail.join(" ") || fileName;
}
