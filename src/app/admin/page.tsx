import Link from "next/link";
import { DollarSign, Package, Plus, Receipt, TrendingUp } from "lucide-react";
import { countProducts } from "@/lib/admin/products";
import {
  getRecentOrders,
  getSalesSummary,
  getTopProducts,
} from "@/lib/admin/sales";
import { formatPrice } from "@/lib/catalog";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReconcilePanel } from "@/components/admin/reconcile-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const [{ total, published }, summary, top, recent] = await Promise.all([
    countProducts(),
    getSalesSummary(),
    getTopProducts(5),
    getRecentOrders(8),
  ]);

  const stats = [
    {
      label: "Revenue",
      value: formatPrice(summary.revenue),
      icon: DollarSign,
    },
    { label: "Orders", value: String(summary.orders), icon: Receipt },
    { label: "Units sold", value: String(summary.units), icon: TrendingUp },
    {
      label: "Products",
      value: `${published}/${total}`,
      sub: "published / total",
      icon: Package,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sales at a glance.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className={cn(buttonVariants(), "gap-2")}
        >
          <Plus className="size-4" /> New product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border p-5">
            <p className="text-text-faint text-2xs flex items-center gap-2 font-mono tracking-wider uppercase">
              <s.icon className="text-primary size-3.5" />
              {s.label}
            </p>
            <p className="font-display mt-2 text-3xl font-semibold">
              {s.value}
            </p>
            {s.sub && <p className="text-text-faint mt-1 text-xs">{s.sub}</p>}
          </div>
        ))}
      </div>

      <ReconcilePanel />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top sellers */}
        <section className="bg-card overflow-hidden rounded-xl border">
          <h2 className="font-display border-b px-5 py-4 text-sm font-semibold">
            Top sellers
          </h2>
          {top.length === 0 ? (
            <p className="text-muted-foreground px-5 py-8 text-center text-sm">
              No sales yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top.map((p) => (
                  <TableRow key={p.productId}>
                    <TableCell className="font-medium">
                      {p.slug ? (
                        <Link
                          href={`/products/${p.slug}`}
                          className="hover:text-primary"
                        >
                          {p.title}
                        </Link>
                      ) : (
                        p.title
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {p.units}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatPrice(p.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>

        {/* Recent orders */}
        <section className="bg-card overflow-hidden rounded-xl border">
          <h2 className="font-display border-b px-5 py-4 text-sm font-semibold">
            Recent orders
          </h2>
          {recent.length === 0 ? (
            <p className="text-muted-foreground px-5 py-8 text-center text-sm">
              No orders yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <div className="max-w-[180px] truncate font-medium">
                        {o.email}
                      </div>
                      <div className="text-text-faint text-xs">
                        {new Date(o.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{o.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatPrice(o.total_usd)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </div>
    </div>
  );
}
