import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavSearch } from "@/components/site/nav-search";
import { AccountMenu } from "@/components/site/account-menu";
import { MobileNav } from "@/components/site/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/products", label: "Browse" },
  { href: "/products?category=courses", label: "Courses" },
  { href: "/products?category=automation", label: "Automation" },
  { href: "/about", label: "About" },
];

export async function SiteNav() {
  const profile = await getProfile();
  const account = profile
    ? { email: profile.email, isAdmin: profile.role === "admin" }
    : null;

  return (
    <header className="bg-background/80 sticky top-0 z-50 h-16 border-b backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-full max-w-[1320px] items-center gap-6 px-4 sm:px-6">
        <Logo />

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <NavSearch className="hidden md:flex" />
          <ThemeToggle />

          {account ? (
            <AccountMenu email={account.email} isAdmin={account.isAdmin} />
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "hidden sm:inline-flex",
              )}
            >
              Log in
            </Link>
          )}

          <div className="lg:hidden">
            <MobileNav account={account} />
          </div>
        </div>
      </div>
    </header>
  );
}
