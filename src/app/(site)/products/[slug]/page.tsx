import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight, ShieldCheck } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { categoryName, formatPrice } from "@/lib/catalog";
import { Cover } from "@/components/cover";
import { Markdown } from "@/components/markdown";
import { ProductCard } from "@/components/product-card";
import { BuyButton } from "@/components/buy-button";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.short_desc,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.title,
      description: product.short_desc,
      url: `/products/${product.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.short_desc,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const delivery = product.delivery_type;

  const deliveryBenefit =
    delivery === "gated"
      ? "Streamed lessons & gated content in your library"
      : delivery === "prompts"
        ? "Copy-and-go prompt library inside your dashboard"
        : "Downloadable files in your library";

  const benefits = [
    "Instant access — the moment you buy",
    "Lifetime access & free future updates",
    deliveryBenefit,
    "14-day no-questions refund",
  ];

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav className="text-text-faint mb-8 flex items-center gap-2 text-sm">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link
          href={`/products?category=${product.category}`}
          className="hover:text-foreground"
        >
          {categoryName(product.category)}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-muted-foreground">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        {/* Media */}
        <div>
          <Cover
            category={product.category}
            coverImageUrl={product.cover_image_url}
            title={product.title}
            tag={categoryName(product.category)}
            className="aspect-[16/11] rounded-xl"
          />
        </div>

        {/* Info + buy box */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.featured && <Badge>Featured</Badge>}
            <Badge variant="secondary">{categoryName(product.category)}</Badge>
          </div>
          <h1 className="font-display mt-3 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            {product.title}
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            {product.short_desc}
          </p>

          <div className="bg-card mt-8 rounded-xl border p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl font-semibold">
                {formatPrice(product.price_usd)}
              </span>
              <Badge variant="secondary">One-time</Badge>
            </div>

            <ul className="my-6 flex flex-col gap-3">
              {benefits.map((b) => (
                <li
                  key={b}
                  className="text-muted-foreground flex items-start gap-3 text-sm"
                >
                  <Check className="text-success mt-0.5 size-4 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3">
              <BuyButton productId={product.id} price={product.price_usd} />
              <AddToCartButton product={product} />
            </div>

            <p className="text-text-faint mt-4 flex items-center justify-center gap-2 text-xs">
              <ShieldCheck className="size-3.5" />
              Secure checkout · Powered by our merchant of record
            </p>
          </div>
        </div>
      </div>

      {/* About */}
      {product.long_desc && (
        <section className="mt-12 border-t pt-12">
          <h2 className="font-display mb-6 text-2xl font-semibold tracking-tight">
            About this product
          </h2>
          <Markdown>{product.long_desc}</Markdown>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12 border-t pt-12">
          <h2 className="font-display mb-6 text-2xl font-semibold tracking-tight">
            You might also like
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
