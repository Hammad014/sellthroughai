"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "signup";

export function LoginForm({ next }: { next: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
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
        setSent(true);
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
          Confirm your email
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          We sent a confirmation link to{" "}
          <span className="text-foreground">{email}</span>. Click it to activate
          your account, then sign in.
        </p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => {
            setSent(false);
            setMode("signin");
          }}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder="••••••••"
          minLength={6}
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
        {mode === "signup" ? "Create account" : "Sign in"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="text-foreground font-medium underline-offset-4 hover:underline"
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            New here?{" "}
            <button
              type="button"
              className="text-foreground font-medium underline-offset-4 hover:underline"
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
