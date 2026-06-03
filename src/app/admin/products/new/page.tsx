import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <Link
        href="/admin/products"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Back to products
      </Link>
      <h1 className="font-display mb-6 text-2xl font-semibold tracking-tight">
        New product
      </h1>
      <p className="text-muted-foreground -mt-4 mb-8 text-sm">
        Create the product first, then add gated files on the edit screen.
      </p>
      <ProductForm />
    </div>
  );
}
