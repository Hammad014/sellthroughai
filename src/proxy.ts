import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Refreshes the auth session and gates the private areas.
 * (Next 16 renamed the `middleware` convention to `proxy`.)
 *
 * The USER area (/dashboard) bounces to the user login (/login) when signed
 * out. The ADMIN area (/admin) is intentionally NOT redirected here: its
 * layout renders its own email+password admin login in-place and does the
 * role check server-side (it needs to read the profiles table).
 */
export default async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isUserProtected = pathname.startsWith("/dashboard");

  if (isUserProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Run on everything except Next internals and static assets, so the
     * session cookie stays fresh across the app.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
