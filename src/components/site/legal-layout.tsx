/**
 * Shared shell for long-form static/legal pages. Children are plain HTML
 * elements (h2, p, ul, li, a) — styled here so the pages stay readable copy.
 */
export function LegalLayout({
  eyebrow = "Legal",
  title,
  updated,
  children,
}: {
  eyebrow?: string;
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-16 sm:px-6">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">
        {title}
      </h1>
      {updated && (
        <p className="text-text-faint mt-2 text-sm">Last updated {updated}</p>
      )}
      <div className="text-muted-foreground [&_a]:text-primary [&_h2]:font-display [&_h2]:text-foreground mt-10 leading-relaxed [&_a]:underline [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_li]:mt-1 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </main>
  );
}
