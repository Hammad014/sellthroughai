"use client";

import { useActionState } from "react";
import {
  importProductsCsv,
  type ImportState,
} from "@/app/admin/products/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/admin/submit-button";

export function ImportForm() {
  const [state, action] = useActionState<ImportState, FormData>(
    importProductsCsv,
    {},
  );

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="file">CSV file</Label>
        <Input id="file" name="file" type="file" accept=".csv,text/csv" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="csv">…or paste CSV</Label>
        <Textarea
          id="csv"
          name="csv"
          rows={8}
          placeholder="slug,title,short_desc,long_desc,category,price_usd,delivery_type,ls_variant_id,status,featured"
          className="font-mono text-xs"
        />
      </div>

      <div>
        <SubmitButton>Import products</SubmitButton>
      </div>

      {state.done && (
        <div className="border-success/30 bg-success/10 rounded-md border px-4 py-3 text-sm">
          <p className="text-foreground font-medium">
            Imported: {state.created ?? 0} created, {state.updated ?? 0}{" "}
            updated.
          </p>
          {state.errors && state.errors.length > 0 && (
            <ul className="text-destructive mt-2 list-disc space-y-0.5 pl-5">
              {state.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!state.done && state.errors && state.errors.length > 0 && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {state.errors.join(" ")}
        </p>
      )}
    </form>
  );
}
