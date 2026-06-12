import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

/** True when Supabase env vars are present. */
function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Emails granted admin access via the `ADMIN_EMAILS` allowlist (comma-sep). */
function adminEmailAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Whether a profile is an admin. True if the DB role is 'admin' OR the email
 * is in the ADMIN_EMAILS allowlist. The allowlist lets you make an admin by
 * just creating the user in Supabase and adding their email to the env var —
 * no SQL needed. (Admin pages/actions use the service-role client, so this
 * app-level check is what actually gates the panel.)
 */
export function isAdmin(
  profile: Pick<Profile, "role" | "email"> | null,
): boolean {
  if (!profile) return false;
  if (profile.role === "admin") return true;
  return adminEmailAllowlist().includes((profile.email ?? "").toLowerCase());
}

/** Current authenticated user (server), or null. */
export async function getUser(): Promise<User | null> {
  // Let the public site render before Supabase is configured.
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Profile for the current user. The DB trigger creates the row on first
 * sign-in; this also upserts defensively in case the trigger ever misses
 * (e.g. a user created before the trigger existed).
 */
export async function getProfile(): Promise<Profile | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) return profile;

  // Fallback: create it from the user's session (allowed by "insert own").
  const { data: created } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? "",
      full_name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        null,
    })
    .select("*")
    .single();

  return created ?? null;
}

/** Redirect to /login unless signed in. Returns the user otherwise. */
export async function requireUser(next?: string): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }
  return user;
}

/** Redirect unless signed in AND recognized as an admin. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  // /admin renders its own email+password login when not authenticated.
  if (!profile) redirect("/admin");
  if (!isAdmin(profile)) redirect("/");
  return profile;
}
