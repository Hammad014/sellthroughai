import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown, Trash2, Upload } from "lucide-react";
import { getAdminProductById, listProductFiles } from "@/lib/admin/products";
import {
  deleteProduct,
  deleteProductFile,
  uploadProductFile,
} from "@/app/admin/products/actions";
import { ProductForm } from "@/components/admin/product-form";
import { SubmitButton } from "@/components/admin/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getAdminProductById(id);
  if (!product) notFound();

  const files = await listProductFiles(id);

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Back to products
      </Link>
      <h1 className="font-display mb-8 text-2xl font-semibold tracking-tight">
        Edit product
      </h1>

      <ProductForm product={product} />

      {/* Gated files (private bucket) */}
      <section className="mt-12 max-w-2xl border-t pt-8">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Gated files
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Uploaded to the private{" "}
          <span className="font-mono">product-files</span> bucket. Buyers reach
          these through signed links — they are never public.
        </p>

        <div className="mt-5 space-y-2">
          {files.length === 0 ? (
            <p className="text-text-faint text-sm">No files yet.</p>
          ) : (
            files.map((f) => (
              <div
                key={f.id}
                className="bg-card flex items-center gap-3 rounded-md border px-3 py-2"
              >
                <FileDown className="text-muted-foreground size-4 shrink-0" />
                <span className="truncate text-sm">{f.file_name}</span>
                <form
                  action={deleteProductFile.bind(
                    null,
                    f.id,
                    product.id,
                    f.storage_path,
                  )}
                  className="ml-auto"
                >
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${f.file_name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </div>
            ))
          )}
        </div>

        <form
          action={uploadProductFile.bind(null, product.id)}
          className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Input name="file" type="file" required className="sm:max-w-sm" />
          <SubmitButton variant="secondary">
            <Upload className="size-4" /> Upload file
          </SubmitButton>
        </form>
      </section>

      {/* Danger zone */}
      <section className="border-destructive/30 mt-12 max-w-2xl rounded-xl border p-6">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Danger zone
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Deleting a product removes its files and lessons. This cannot be
          undone.
        </p>
        <form action={deleteProduct.bind(null, product.id)} className="mt-4">
          <SubmitButton variant="destructive">
            <Trash2 className="size-4" /> Delete product
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
