import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getProfile, isAdmin } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminLogin } from "@/components/admin/admin-login";
import { Badge } from "@/components/ui/badge";

// Admin is always rendered per-request and gated by role server-side.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate in-place: show the admin sign-in screen until an admin is logged in,
  // so /admin itself is the login entry point (no redirect to the user login).
  const profile = await getProfile();
  if (!isAdmin(profile)) {
    return <AdminLogin signedInNotAdmin={Boolean(profile)} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-3 px-4 sm:px-6">
          <Logo />
          <Badge variant="secondary">Admin</Badge>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"
            >
              View store <ArrowUpRight className="size-3.5" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:gap-8">
        <aside className="w-full shrink-0 md:w-56">
          <AdminSidebar />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
