import Link from "next/link";
import { Eye, EyeOff, Plus, Upload } from "lucide-react";
import { listAllProducts } from "@/lib/admin/products";
import { toggleProductStatus } from "@/app/admin/products/actions";
import { categoryName, formatPrice } from "@/lib/catalog";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/admin/submit-button";
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
        <div className="flex gap-2">
          <Link
            href="/admin/products/import"
            className={cn(buttonVariants({ variant: "secondary" }), "gap-2")}
          >
            <Upload className="size-4" /> Import CSV
          </Link>
          <Link
            href="/admin/products/new"
            className={cn(buttonVariants(), "gap-2")}
          >
            <Plus className="size-4" /> New product
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-card rounded-xl border px-6 py-16 text-center">
          <p className="text-muted-foreground">
            No products yet.{" "}
            <Link href="/admin/products/new" className="text-primary underline">
              Create one
            </Link>{" "}
            or{" "}
            <Link
              href="/admin/products/import"
              className="text-primary underline"
            >
              import a CSV
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="bg-card overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const published = p.status === "published";
                return (
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
                      <Badge variant={published ? "default" : "secondary"}>
                        {p.status}
                      </Badge>
                      {p.featured && (
                        <Badge variant="secondary" className="ml-2">
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <form
                          action={toggleProductStatus.bind(
                            null,
                            p.id,
                            p.status,
                          )}
                        >
                          <SubmitButton variant="ghost" size="sm">
                            {published ? (
                              <>
                                <EyeOff className="size-4" /> Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="size-4" /> Publish
                              </>
                            )}
                          </SubmitButton>
                        </form>
                        <Link
                          href={`/admin/products/${p.id}`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                          )}
                        >
                          Edit
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
