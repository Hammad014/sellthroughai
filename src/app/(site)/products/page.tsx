import type { Metadata } from "next";
import { PackageOpen } from "lucide-react";
import { getPublishedProducts } from "@/lib/products";
import { categoryName } from "@/lib/catalog";
import { CatalogFilters } from "@/components/catalog-filters";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = {
  title: "Catalog",
  description:
    "Browse prompt packs, templates, courses, automation kits and ebooks.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "" } = await searchParams;
  const products = await getPublishedProducts({ q, category });

  const heading = category ? categoryName(category) : "All products";

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-12 sm:px-6">
      <header className="mb-8">
        <p className="eyebrow">Catalog</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {heading}
        </h1>
        <p className="text-muted-foreground mt-1">
          {q
            ? `Results for “${q}”`
            : "Curated AI tools — instant delivery, lifetime access."}
        </p>
      </header>

      <div className="mb-10">
        <CatalogFilters initialQuery={q} activeCategory={category} />
      </div>

      {products.length === 0 ? (
        <div className="bg-card flex flex-col items-center rounded-xl border px-6 py-20 text-center">
          <div className="bg-secondary text-muted-foreground grid size-14 place-items-center rounded-xl">
            <PackageOpen className="size-6" />
          </div>
          <h2 className="font-display mt-5 text-xl font-semibold">
            No products found
          </h2>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Try a different category or search term. New products are added
            regularly.
          </p>
        </div>
      ) : (
        <>
          <p className="text-text-faint text-2xs mb-5 font-mono tracking-wider uppercase">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
