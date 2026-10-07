"use client";

/* eslint-disable @next/next/no-img-element */
import { useActionState } from "react";
import {
  upsertProduct,
  type ProductFormState,
} from "@/app/admin/products/actions";
import { CATEGORIES } from "@/lib/catalog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/admin/submit-button";
import type { Product } from "@/lib/supabase/types";

const selectClass =
  "bg-card border-input h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ProductForm({ product }: { product?: Product }) {
  const [state, formAction] = useActionState<ProductFormState, FormData>(
    upsertProduct,
    {},
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      {state.error && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={product?.title}
          placeholder="The Operator's Prompt Vault"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={product?.slug}
          placeholder="auto-generated from title if left blank"
        />
        <p className="text-text-faint text-xs">
          Used in the URL: /products/<span className="font-mono">slug</span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="short_desc">Short description</Label>
        <Textarea
          id="short_desc"
          name="short_desc"
          rows={2}
          defaultValue={product?.short_desc}
          placeholder="One-line pitch shown on cards and the detail header."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="long_desc">Long description</Label>
        <Textarea
          id="long_desc"
          name="long_desc"
          rows={6}
          defaultValue={product?.long_desc ?? ""}
          placeholder={
            "Full description. Markdown supported — use ## headings, - lists, **bold** and `code`."
          }
        />
        <p className="text-text-faint text-xs">
          Rendered as markdown on the product page (headings, lists, bold, code
          blocks).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            className={selectClass}
            defaultValue={product?.category ?? "prompts"}
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="price_usd">Price (USD)</Label>
          <Input
            id="price_usd"
            name="price_usd"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={product?.price_usd ?? "0"}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="delivery_type">Delivery type</Label>
          <select
            id="delivery_type"
            name="delivery_type"
            className={selectClass}
            defaultValue={product?.delivery_type ?? "license"}
          >
            <option value="license">License (downloadable files)</option>
            <option value="gated">Gated (course / gated content)</option>
            <option value="prompts">
              Prompt library (in-app, copy-to-use)
            </option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            className={selectClass}
            defaultValue={product?.status ?? "draft"}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="ls_variant_id">
          Lemon Squeezy variant ID{" "}
          <span className="text-text-faint">(required to sell)</span>
        </Label>
        <Input
          id="ls_variant_id"
          name="ls_variant_id"
          defaultValue={product?.ls_variant_id ?? ""}
          placeholder="e.g. 123456 — from the variant's URL in Lemon Squeezy"
        />
        <p className="text-text-faint text-xs">
          Paste the variant ID from Lemon Squeezy (Products → your product →
          variant). Until it&apos;s set, the Buy button is disabled for this
          product. For a bundle, use the bundle&apos;s own variant.
        </p>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={product?.featured ?? false}
          className="border-input size-4 rounded border"
        />
        Feature this product on the landing page
      </label>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cover">Cover image</Label>
        {product?.cover_image_url && (
          <img
            src={product.cover_image_url}
            alt="Current cover"
            className="border-border h-32 w-auto rounded-md border object-cover"
          />
        )}
        <Input id="cover" name="cover" type="file" accept="image/*" />
        <p className="text-text-faint text-xs">
          Optional. Uploaded to the public product-covers bucket. Leave blank to
          keep the category gradient (or the current image).
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="gallery">Gallery images</Label>
        {product?.gallery && product.gallery.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.gallery.map((img) => (
              <img
                key={img.url}
                src={img.url}
                alt={img.alt}
                title={img.alt}
                className="border-border h-16 w-auto rounded-md border object-cover"
              />
            ))}
          </div>
        )}
        <Textarea
          id="gallery"
          name="gallery"
          rows={4}
          defaultValue={(product?.gallery ?? [])
            .map((img) => (img.alt ? `${img.url} | ${img.alt}` : img.url))
            .join("\n")}
          placeholder="https://…/preview-1.webp | Caption shown under the image"
          className="font-mono text-xs"
        />
        <Input
          id="gallery_files"
          name="gallery_files"
          type="file"
          accept="image/*"
          multiple
        />
        <p className="text-text-faint text-xs">
          Preview images shown on the sales page after the cover, one per line
          as <span className="font-mono">url | caption</span>. Reorder or delete
          lines to change the gallery; uploaded images are appended.
        </p>
      </div>

      <div className="flex items-center gap-3 border-t pt-6">
        <SubmitButton>
          {product ? "Save changes" : "Create product"}
        </SubmitButton>
      </div>
    </form>
  );
}
