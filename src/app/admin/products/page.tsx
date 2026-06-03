import Link from "next/link";
import { Plus } from "lucide-react";
import { listAllProducts } from "@/lib/admin/products";
import { categoryName, formatPrice } from "@/lib/catalog";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await listAllProducts();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Products
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {products.length} total
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className={cn(buttonVariants(), "gap-2")}
        >
          <Plus className="size-4" /> New product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-card rounded-xl border px-6 py-16 text-center">
          <p className="text-muted-foreground">
            No products yet.{" "}
            <Link href="/admin/products/new" className="text-primary underline">
              Create your first one
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="bg-card overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-text-faint font-mono text-xs">
                      {p.slug}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {categoryName(p.category)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatPrice(p.price_usd)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.status === "published" ? "default" : "secondary"
                      }
                    >
                      {p.status}
                    </Badge>
                    {p.featured && (
                      <Badge variant="secondary" className="ml-2">
                        Featured
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
