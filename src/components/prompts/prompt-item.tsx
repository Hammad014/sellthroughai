"use client";

import { useState } from "react";
import { Check, Copy, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductPrompt } from "@/lib/supabase/types";

/**
 * A single prompt in the buyer's in-app library: the parameterized body with a
 * one-click copy button, plus a collapsible worked example.
 */
export function PromptItem({
  prompt,
  index,
}: {
  prompt: ProductPrompt;
  index: number;
}) {
  const [copied, setCopied] = useState(false);
  const [showExample, setShowExample] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt.prompt_body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (e.g. insecure context) — no-op.
    }
  }

  const hasExample = Boolean(prompt.example_input || prompt.example_output);

  return (
    <article className="bg-card rounded-xl border p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="text-text-faint mt-1 font-mono text-sm">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold tracking-tight">
              {prompt.title}
            </h3>
            {prompt.model && (
              <Badge variant="secondary" className="font-mono text-xs">
                {prompt.model}
              </Badge>
            )}
          </div>
          {prompt.description && (
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {prompt.description}
            </p>
          )}
        </div>
      </div>

      <div className="relative mt-4">
        <pre className="bg-bg-subtle text-foreground/90 max-h-80 overflow-auto rounded-lg border p-4 pr-12 font-mono text-sm whitespace-pre-wrap">
          {prompt.prompt_body}
        </pre>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          onClick={copy}
          aria-label="Copy prompt"
          className="absolute top-3 right-3"
        >
          {copied ? (
            <Check className="text-success size-4" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      </div>

      {hasExample && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowExample((v) => !v)}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                showExample && "rotate-180",
              )}
            />
            {showExample ? "Hide example" : "See a worked example"}
          </button>

          {showExample && (
            <div className="mt-3 space-y-4 border-t pt-4">
              {prompt.example_input && (
                <div>
                  <p className="text-text-faint text-2xs font-mono tracking-wider uppercase">
                    Example input
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                    {prompt.example_input}
                  </p>
                </div>
              )}
              {prompt.example_output && (
                <div>
                  <p className="text-text-faint text-2xs font-mono tracking-wider uppercase">
                    Example output
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                    {prompt.example_output}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
