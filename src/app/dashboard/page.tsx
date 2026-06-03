import type { Metadata } from "next";
import Link from "next/link";
import { LibraryBig } from "lucide-react";
import { requireUser, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Entitlement, Product } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "My Library",
};

type EntitlementWithProduct = Entitlement & { products: Product | null };

export default async function DashboardPage() {
  await requireUser("/dashboard");
  const profile = await getProfile();

  // Entitlements are granted by payments (added later). For now this is
  // wired up and will simply be empty until checkout exists.
  const supabase = await createClient();
  const { data } = await supabase
    .from("entitlements")
    .select("*, products(*)")
    .order("granted_at", { ascending: false });
  const entitlements = (data ?? []) as EntitlementWithProduct[];

  return (
    <main className="container mx-auto max-w-[1320px] px-6 py-12">
      <header className="mb-8">
        <p className="eyebrow">Your account</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
          My Library
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""} —
          everything you own lives here.
        </p>
      </header>

      {entitlements.length === 0 ? (
        <div className="bg-card flex flex-col items-center rounded-xl border px-6 py-20 text-center">
          <div className="bg-secondary text-muted-foreground grid size-14 place-items-center rounded-xl">
            <LibraryBig className="size-6" />
          </div>
          <h2 className="font-display mt-5 text-xl font-semibold">
            Your library is empty
          </h2>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Browse the catalog and your purchases will show up here with instant
            downloads and lifetime access.
          </p>
          <Link href="/products" className={cn(buttonVariants(), "mt-6")}>
            Browse the catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {entitlements.map((e) => (
            <div key={e.id} className="bg-card rounded-xl border p-5">
              <h3 className="font-display font-semibold">
                {e.products?.title ?? "Product"}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {e.products?.short_desc}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
