"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { CATEGORIES } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function CatalogFilters({
  initialQuery,
  activeCategory,
}: {
  initialQuery: string;
  activeCategory: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const firstRun = useRef(true);

  function buildUrl(query: string, category: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (query.trim()) params.set("q", query.trim());
    const qs = params.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  }

  // Debounce the search box → update the URL (server re-queries).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const t = setTimeout(() => {
      router.push(buildUrl(q, activeCategory));
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const chips = [{ slug: "", name: "All" }, ...CATEGORIES];

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-card border-border focus-within:border-border-strong flex h-11 items-center gap-2 rounded-md border px-3 transition-colors">
        <Search className="text-text-faint size-4 shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="placeholder:text-text-faint w-full bg-transparent text-sm outline-none"
          aria-label="Search products"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((c) => {
          const isActive = activeCategory === c.slug;
          return (
            <button
              key={c.slug || "all"}
              type="button"
              onClick={() => router.push(buildUrl(q, c.slug))}
              className={cn(
                "rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
