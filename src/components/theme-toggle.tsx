"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // Icons are swapped via the `dark:` variant (driven by the .dark class
  // next-themes sets before hydration), so there's no hydration mismatch and
  // no need for a mounted flag.
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="hidden size-[18px] dark:block" />
      <Moon className="block size-[18px] dark:hidden" />
    </Button>
  );
}
