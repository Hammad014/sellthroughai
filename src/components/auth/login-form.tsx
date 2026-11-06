"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRound, Loader2, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Mode = "signin" | "signup" | "forgot";

export function LoginForm({
  next,
  initialMode = "signin",
}: {
  next: string;
  initialMode?: Mode;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Which "check your inbox" screen to show, if any.
  const [sent, setSent] = useState<"confirm" | "reset" | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    // Password reset — also how guest buyers (whose account was created at
    // checkout, with no password) set their first password.
    if (mode === "forgot") {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/dashboard/set-password?next=${encodeURIComponent(next)}`)}`,
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      setSent("reset");
      return;
    }

    if (!password) return;
    setLoading(true);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      // When email confirmation is enabled, no session is returned yet.
      if (!data.session) {
        setSent("confirm");
        return;
      }
      router.push(next);
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="bg-brand-tint text-primary mx-auto grid size-12 place-items-center rounded-full">
          <Mail className="size-5" />
        </div>
        <h2 className="font-display mt-4 text-xl font-semibold">
          {sent === "confirm" ? "Confirm your email" : "Check your inbox"}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {sent === "confirm" ? (
            <>
              We sent a confirmation link to{" "}
              <span className="text-foreground">{email}</span>. Click it to
              activate your account, then sign in.
            </>
          ) : (
            <>
              If an account exists for{" "}
              <span className="text-foreground">{email}</span>, we&apos;ve sent
              a link to set your password. Open it in this browser. Nothing
              after a minute? Check spam, or try again.
            </>
          )}
        </p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => {
            setSent(null);
            setMode("signin");
          }}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  const linkClass =
    "text-foreground font-medium underline-offset-4 hover:underline";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === "forgot" && (
        <p className="text-muted-foreground text-sm">
          Enter the email you signed up or bought with and we&apos;ll send you a
          link to set a new password.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {mode !== "forgot" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {mode === "signin" && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
                onClick={() => setMode("forgot")}
              >
                Forgot password?
              </button>
            )}
          </div>
          <Input
            id="password"
            type="password"
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            placeholder="••••••••"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      )}

      <Button type="submit" className="h-11 w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : mode === "forgot" ? (
          <KeyRound className="size-4" />
        ) : (
          <Lock className="size-4" />
        )}
        {mode === "signup"
          ? "Create account"
          : mode === "forgot"
            ? "Send password link"
            : "Sign in"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className={linkClass}
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>
          </>
        ) : mode === "forgot" ? (
          <>
            Remembered it?{" "}
            <button
              type="button"
              className={linkClass}
              onClick={() => setMode("signin")}
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            New here?{" "}
            <button
              type="button"
              className={linkClass}
              onClick={() => setMode("signup")}
            >
              Create an account
            </button>
          </>
        )}
      </p>

      <p className="text-text-faint text-center text-xs">
        By continuing you agree to our{" "}
        <a href="/terms" className="hover:text-foreground underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="hover:text-foreground underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
