import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Browser Supabase client (Client Components).
 * Uses the public anon key — safe to ship to the browser; RLS enforces access.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
