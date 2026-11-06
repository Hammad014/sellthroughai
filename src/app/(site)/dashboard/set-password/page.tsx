import type { Metadata } from "next";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Set your password",
};

function sanitizeNext(next: string | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard";
}

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await requireUser("/dashboard/set-password");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Set your password
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            For <span className="text-foreground">{user.email}</span>.
            You&apos;ll use it to sign in to your library from now on.
          </p>
        </div>
        <div className="bg-card rounded-xl border p-6 shadow-[var(--shadow-card)] sm:p-8">
          <SetPasswordForm next={sanitizeNext(next)} />
        </div>
      </div>
    </main>
  );
}
