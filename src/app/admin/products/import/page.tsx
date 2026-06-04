import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ImportForm } from "@/components/admin/import-form";

const COLUMNS = [
  ["slug", "URL slug (auto from title if blank)"],
  ["title", "required"],
  ["short_desc", "card / header line"],
  ["long_desc", "full description (use \\n\\n for paragraphs)"],
  ["category", "prompts | templates | courses | automation | ebooks"],
  ["price_usd", "e.g. 39 or 19.50"],
  ["delivery_type", "license | gated"],
  ["ls_variant_id", "Lemon Squeezy variant id (license products)"],
  ["status", "draft | published"],
  ["featured", "true | false"],
  ["cover_image_url", "optional public image URL"],
];

export default function ImportProductsPage() {
  return (
    <div>
      <Link
        href="/admin/products"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Back to products
      </Link>
      <h1 className="font-display mb-2 text-2xl font-semibold tracking-tight">
        Bulk import products
      </h1>
      <p className="text-muted-foreground mb-8 max-w-2xl text-sm">
        Upload or paste a CSV. Rows are matched to existing products by{" "}
        <span className="font-mono">slug</span> — existing ones are updated, new
        ones are created.
      </p>

      <div className="mb-8 max-w-2xl">
        <ImportForm />
      </div>

      <section className="bg-card max-w-2xl rounded-xl border p-5">
        <h2 className="font-display text-sm font-semibold">Columns</h2>
        <dl className="mt-3 space-y-1.5 text-sm">
          {COLUMNS.map(([name, desc]) => (
            <div key={name} className="flex gap-3">
              <dt className="text-primary w-36 shrink-0 font-mono text-xs">
                {name}
              </dt>
              <dd className="text-muted-foreground">{desc}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
