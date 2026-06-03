import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/logo";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
};

function sanitizeNext(next: string | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const target = sanitizeNext(next);

  // Already signed in → skip the login screen.
  const user = await getUser();
  if (user) redirect(target);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <h1 className="font-display mt-6 text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Sign in to access your library, courses and downloads.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-[var(--shadow-card)] sm:p-8">
          {error && (
            <p className="border-destructive/30 bg-destructive/10 text-destructive mb-5 rounded-md border px-3 py-2 text-sm">
              Something went wrong signing you in. Please try again.
            </p>
          )}
          <LoginForm next={target} />
        </div>
      </div>
    </main>
  );
}
