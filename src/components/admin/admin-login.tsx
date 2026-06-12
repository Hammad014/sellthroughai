"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Lock, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Admin sign-in. Credentials are provisioned in Supabase (no self sign-up,
 * no password reset, no social login). `signedInNotAdmin` is true when there
 * is an active session whose profile role is not 'admin'.
 */
export function AdminLogin({
  signedInNotAdmin = false,
}: {
  signedInNotAdmin?: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Re-render the server layout; it re-checks the admin role.
    router.refresh();
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <h1 className="font-display mt-6 text-2xl font-semibold tracking-tight">
            Admin sign in
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Restricted area. Use the credentials provisioned in Supabase.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-[var(--shadow-card)] sm:p-8">
          {signedInNotAdmin && (
            <div className="border-destructive/30 bg-destructive/10 text-destructive mb-5 flex items-start gap-2 rounded-md border px-3 py-2 text-sm">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              <span>
                This account isn&apos;t an admin.{" "}
                <button
                  type="button"
                  className="font-medium underline underline-offset-4"
                  onClick={signOut}
                >
                  Sign out
                </button>{" "}
                and use an admin account.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="h-11 w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Lock className="size-4" />
              )}
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
