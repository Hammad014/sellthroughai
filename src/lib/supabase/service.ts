import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Service-role Supabase client — SERVER ONLY.
 *
 * Uses the secret service-role key, which BYPASSES Row Level Security.
 * Never import this into a Client Component or expose the key to the browser.
 * Use it only for trusted server work: admin mutations, reading gated
 * `product_files` / `course_lessons`, fulfilling orders, granting entitlements.
 *
 * The `server-only` import makes the build fail loudly if this module is ever
 * pulled into a client bundle.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase service-role env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).",
    );
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
