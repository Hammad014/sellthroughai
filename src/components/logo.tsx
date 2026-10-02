import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "bg-primary text-primary-foreground grid size-7 place-items-center rounded-[8px] shadow-[0_4px_16px_var(--brand-tint)]",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-[17px]"
      >
        <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" opacity="0.25" />
        <path d="M12 7l-4 2.2v4.6L12 16l4-2.2V9.2L12 7z" />
      </svg>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "font-display inline-flex items-center gap-2 text-lg font-bold tracking-tight",
        className,
      )}
      aria-label="Promptory home"
    >
      <LogoMark />
      <span>
        <b>Prompt</b><b className="text-primary">ory</b>
      </span>
    </Link>
  );
}
