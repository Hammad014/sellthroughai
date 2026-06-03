"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function MobileNav({
  account,
}: {
  account: { email: string; isAdmin: boolean } | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open menu"
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
      >
        <Menu className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem render={<Link href="/products" />}>
          Browse all
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-text-faint text-2xs font-mono tracking-wider uppercase">
          Categories
        </DropdownMenuLabel>
        {CATEGORIES.map((c) => (
          <DropdownMenuItem
            key={c.slug}
            render={<Link href={`/products?category=${c.slug}`} />}
          >
            <c.icon className="size-4" />
            {c.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {account ? (
          <>
            <DropdownMenuItem render={<Link href="/dashboard" />}>
              My Library
            </DropdownMenuItem>
            {account.isAdmin && (
              <DropdownMenuItem render={<Link href="/admin" />}>
                Admin
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem render={<Link href="/login" />}>
            Log in
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
