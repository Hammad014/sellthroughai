"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import {
  reconcileWithLemon,
  type ReconcileResult,
} from "@/lib/actions/reconcile";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog";

export function ReconcilePanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReconcileResult | null>(null);

  async function run() {
    setLoading(true);
    setResult(await reconcileWithLemon());
    setLoading(false);
  }

  const mismatch =
    result?.ls && result?.db && result.ls.count !== result.db.count;

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-sm font-semibold">
            Reconcile with Lemon Squeezy
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Compare the LS API against orders recorded by the webhook.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={run} disabled={loading}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Reconcile
        </Button>
      </div>

      {result?.error && (
        <p className="text-destructive mt-4 text-sm">{result.error}</p>
      )}

      {result?.ls && result?.db && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="bg-secondary rounded-md p-3">
            <p className="text-text-faint text-2xs font-mono uppercase">
              Lemon Squeezy
            </p>
            <p className="mt-1 font-medium">{result.ls.count} orders</p>
            <p className="text-muted-foreground font-mono">
              {formatPrice(result.ls.revenue)}
            </p>
          </div>
          <div className="bg-secondary rounded-md p-3">
            <p className="text-text-faint text-2xs font-mono uppercase">
              Recorded (DB)
            </p>
            <p className="mt-1 font-medium">{result.db.count} orders</p>
            <p className="text-muted-foreground font-mono">
              {formatPrice(result.db.revenue)}
            </p>
          </div>
          <div className="col-span-2">
            {mismatch ? (
              <p className="text-warning">
                ⚠ {result.missingInDb?.length ?? 0} LS order(s) not recorded
                locally
                {result.missingInDb && result.missingInDb.length > 0 && (
                  <span className="text-text-faint font-mono">
                    {": "}
                    {result.missingInDb.slice(0, 10).join(", ")}
                    {result.missingInDb.length > 10 ? "…" : ""}
                  </span>
                )}
                . Re-send those webhooks from Lemon Squeezy.
              </p>
            ) : (
              <p className="text-success">✓ In sync.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
