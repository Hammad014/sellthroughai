import Link from "next/link";
import { Package, Plus, ShoppingBag } from "lucide-react";
import { countProducts } from "@/lib/admin/products";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const { total, published } = await countProducts();

  const stats = [
    { label: "Total products", value: total },
    { label: "Published", value: published },
    { label: "Orders", value: 0 },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Overview
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your catalog and orders.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className={cn(buttonVariants(), "gap-2")}
        >
          <Plus className="size-4" /> New product
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border p-5">
            <p className="text-text-faint text-2xs font-mono tracking-wider uppercase">
              {s.label}
            </p>
            <p className="font-display mt-2 text-3xl font-semibold">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/products"
          className="bg-card hover:border-border-strong flex items-center gap-4 rounded-xl border p-5 transition-colors"
        >
          <div className="bg-secondary text-primary grid size-10 place-items-center rounded-md">
            <Package className="size-5" />
          </div>
          <div>
            <p className="font-medium">Products</p>
            <p className="text-muted-foreground text-sm">
              Create, edit and publish products.
            </p>
          </div>
        </Link>
        <Link
          href="/admin/orders"
          className="bg-card hover:border-border-strong flex items-center gap-4 rounded-xl border p-5 transition-colors"
        >
          <div className="bg-secondary text-primary grid size-10 place-items-center rounded-md">
            <ShoppingBag className="size-5" />
          </div>
          <div>
            <p className="font-medium">Orders</p>
            <p className="text-muted-foreground text-sm">
              View orders (populated once payments are live).
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
