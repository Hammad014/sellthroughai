"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/** Compact nav search — routes to the catalog with a `q` query. */
export function NavSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <form
      onSubmit={submit}
      className={cnSearch(className)}
      role="search"
      aria-label="Search products"
    >
      <Search className="text-text-faint size-[15px] shrink-0" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products…"
        className="placeholder:text-text-faint w-full bg-transparent text-sm outline-none"
      />
    </form>
  );
}

function cnSearch(extra?: string) {
  return [
    "bg-card border-border hover:border-border-strong flex h-9 min-w-[220px] items-center gap-2 rounded-md border px-3 transition-colors",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}
