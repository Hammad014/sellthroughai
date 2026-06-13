import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileDown,
  Package,
  Sparkles,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import {
  getAdminProductById,
  listAllProducts,
  listBundleItems,
  listProductFiles,
  listProductLessons,
  listProductPrompts,
} from "@/lib/admin/products";
import {
  addBundleItem,
  addLesson,
  addPrompt,
  deleteLesson,
  deletePrompt,
  deleteProduct,
  deleteProductFile,
  removeBundleItem,
  updateLesson,
  updatePrompt,
  uploadProductFile,
} from "@/app/admin/products/actions";
import { formatPrice } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/product-form";
import { SubmitButton } from "@/components/admin/submit-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getAdminProductById(id);
  if (!product) notFound();

  const isGated = product.delivery_type === "gated";
  const isPrompts = product.delivery_type === "prompts";
  const isBundle = product.category === "bundles";

  const [files, lessons, prompts, bundleItems, allProducts] = await Promise.all([
    listProductFiles(id),
    isGated ? listProductLessons(id) : Promise.resolve([]),
    isPrompts ? listProductPrompts(id) : Promise.resolve([]),
    isBundle ? listBundleItems(id) : Promise.resolve([]),
    isBundle ? listAllProducts() : Promise.resolve([]),
  ]);

  const bundleItemsTotal = bundleItems.reduce(
    (sum, x) => sum + Number(x.product.price_usd),
    0,
  );

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Back to products
      </Link>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Edit product
        </h1>
        <Link
          href={`/products/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
        >
          <ExternalLink className="size-4" /> View live page
        </Link>
      </div>

      <ProductForm product={product} />

      {/* Bundle contents (bundle category) */}
      {isBundle && (
        <section className="mt-12 max-w-2xl border-t pt-8">
          <h2 className="font-display flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Package className="size-4" /> Bundle contents
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Buyers who purchase this bundle are granted every product below.
            {bundleItems.length > 0 && (
              <>
                {" "}
                Items total{" "}
                <span className="font-mono">
                  {formatPrice(bundleItemsTotal)}
                </span>{" "}
                · bundle price{" "}
                <span className="font-mono">
                  {formatPrice(product.price_usd)}
                </span>{" "}
                ({formatPrice(Math.max(0, bundleItemsTotal - product.price_usd))}{" "}
                saved).
              </>
            )}
          </p>

          <div className="mt-5 space-y-2">
            {bundleItems.length === 0 ? (
              <p className="text-text-faint text-sm">No products in this bundle yet.</p>
            ) : (
              bundleItems.map((x) => (
                <div
                  key={x.id}
                  className="bg-card flex items-center gap-3 rounded-md border px-3 py-2"
                >
                  <span className="truncate text-sm font-medium">
                    {x.product.title}
                  </span>
                  <span className="text-text-faint ml-auto font-mono text-xs">
                    {formatPrice(x.product.price_usd)}
                  </span>
                  <form action={removeBundleItem.bind(null, x.id, product.id)}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${x.product.title}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              ))
            )}
          </div>

          <form
            action={addBundleItem.bind(null, product.id)}
            className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <select
              name="item_product_id"
              required
              className="bg-card border-input h-10 w-full rounded-md border px-3 text-sm sm:max-w-sm"
            >
              <option value="">Choose a product to add…</option>
              {allProducts
                .filter(
                  (p) => p.id !== product.id && p.category !== "bundles",
                )
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({formatPrice(p.price_usd)})
                  </option>
                ))}
            </select>
            <SubmitButton variant="secondary">Add to bundle</SubmitButton>
          </form>
        </section>
      )}

      {/* Gated files (private bucket) */}
      <section className="mt-12 max-w-2xl border-t pt-8">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Gated files
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Uploaded to the private{" "}
          <span className="font-mono">product-files</span> bucket. Buyers reach
          these through signed links — they are never public. Use{" "}
          <strong>Download</strong> to verify an upload.
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
                <a
                  href={`/api/download?file=${f.id}`}
                  className="text-primary ml-auto inline-flex items-center gap-1 text-sm hover:underline"
                >
                  <Download className="size-4" /> Download
                </a>
                <form
                  action={deleteProductFile.bind(
                    null,
                    f.id,
                    product.id,
                    f.storage_path,
                  )}
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

      {/* Course lessons (gated products only) — view / edit / add */}
      {isGated && (
        <section className="mt-12 max-w-2xl border-t pt-8">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Course lessons
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Shown in the player at{" "}
            <span className="font-mono">/dashboard/courses/{product.slug}</span>.
            Click a lesson to view and edit it.
          </p>

          <div className="mt-5 space-y-2">
            {lessons.length === 0 ? (
              <p className="text-text-faint text-sm">No lessons yet.</p>
            ) : (
              lessons.map((lesson, i) => (
                <details
                  key={lesson.id}
                  className="bg-card overflow-hidden rounded-md border"
                >
                  <summary className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm">
                    <span className="text-text-faint font-mono text-xs">
                      {i + 1}
                    </span>
                    <span className="truncate font-medium">{lesson.title}</span>
                    {lesson.video_path && (
                      <Video className="text-muted-foreground size-4 shrink-0" />
                    )}
                  </summary>
                  <div className="space-y-3 border-t px-3 py-4">
                    <form
                      action={updateLesson.bind(null, lesson.id, product.id)}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex flex-col gap-2">
                        <Label>Lesson title</Label>
                        <Input
                          name="title"
                          defaultValue={lesson.title}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Content (markdown)</Label>
                        <Textarea
                          name="content_md"
                          rows={8}
                          defaultValue={lesson.content_md ?? ""}
                        />
                      </div>
                      <SubmitButton variant="secondary">
                        Save changes
                      </SubmitButton>
                    </form>
                    <form
                      action={deleteLesson.bind(
                        null,
                        lesson.id,
                        product.id,
                        lesson.video_path,
                      )}
                    >
                      <SubmitButton variant="ghost">
                        <Trash2 className="size-4" /> Delete lesson
                      </SubmitButton>
                    </form>
                  </div>
                </details>
              ))
            )}
          </div>

          <form
            action={addLesson.bind(null, product.id)}
            className="mt-6 flex flex-col gap-3 border-t pt-6"
          >
            <p className="text-sm font-medium">Add a lesson</p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lesson-title">Lesson title</Label>
              <Input id="lesson-title" name="title" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lesson-content">Content (markdown)</Label>
              <Textarea id="lesson-content" name="content_md" rows={4} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lesson-video">Video (optional)</Label>
              <Input
                id="lesson-video"
                name="video"
                type="file"
                accept="video/*"
              />
            </div>
            <div>
              <SubmitButton variant="secondary">Add lesson</SubmitButton>
            </div>
          </form>
        </section>
      )}

      {/* Prompt library (prompts products only) — view / edit / add */}
      {isPrompts && (
        <section className="mt-12 max-w-2xl border-t pt-8">
          <h2 className="font-display flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Sparkles className="size-4" /> Prompt library
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Buyers browse and copy these at{" "}
            <span className="font-mono">/dashboard/prompts/{product.slug}</span>.
            Click a prompt to view and edit it. Use{" "}
            <span className="font-mono">[BRACKETS]</span> for the parts the buyer
            fills in.
          </p>

          <div className="mt-5 space-y-2">
            {prompts.length === 0 ? (
              <p className="text-text-faint text-sm">No prompts yet.</p>
            ) : (
              prompts.map((p, i) => (
                <details
                  key={p.id}
                  className="bg-card overflow-hidden rounded-md border"
                >
                  <summary className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm">
                    <span className="text-text-faint font-mono text-xs">
                      {i + 1}
                    </span>
                    <span className="truncate font-medium">{p.title}</span>
                    {p.model && (
                      <span className="text-text-faint ml-auto truncate font-mono text-xs">
                        {p.model}
                      </span>
                    )}
                  </summary>
                  <div className="space-y-3 border-t px-3 py-4">
                    <form
                      action={updatePrompt.bind(null, p.id, product.id)}
                      className="flex flex-col gap-3"
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <Label>Title</Label>
                          <Input name="title" defaultValue={p.title} required />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>Suggested model</Label>
                          <Input name="model" defaultValue={p.model ?? ""} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>When to use it</Label>
                        <Input
                          name="description"
                          defaultValue={p.description ?? ""}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Prompt</Label>
                        <Textarea
                          name="prompt_body"
                          rows={8}
                          defaultValue={p.prompt_body}
                          required
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <Label>Example input</Label>
                          <Textarea
                            name="example_input"
                            rows={3}
                            defaultValue={p.example_input ?? ""}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>Example output</Label>
                          <Textarea
                            name="example_output"
                            rows={3}
                            defaultValue={p.example_output ?? ""}
                          />
                        </div>
                      </div>
                      <SubmitButton variant="secondary">
                        Save changes
                      </SubmitButton>
                    </form>
                    <form action={deletePrompt.bind(null, p.id, product.id)}>
                      <SubmitButton variant="ghost">
                        <Trash2 className="size-4" /> Delete prompt
                      </SubmitButton>
                    </form>
                  </div>
                </details>
              ))
            )}
          </div>

          <form
            action={addPrompt.bind(null, product.id)}
            className="mt-6 flex flex-col gap-3 border-t pt-6"
          >
            <p className="text-sm font-medium">Add a prompt</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="prompt-title">Title</Label>
                <Input id="prompt-title" name="title" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="prompt-model">Suggested model (optional)</Label>
                <Input
                  id="prompt-model"
                  name="model"
                  placeholder="Claude / GPT-4o"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="prompt-desc">When to use it (optional)</Label>
              <Input id="prompt-desc" name="description" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="prompt-body">Prompt</Label>
              <Textarea id="prompt-body" name="prompt_body" rows={6} required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="prompt-input">Example input (optional)</Label>
                <Textarea id="prompt-input" name="example_input" rows={3} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="prompt-output">Example output (optional)</Label>
                <Textarea id="prompt-output" name="example_output" rows={3} />
              </div>
            </div>
            <div>
              <SubmitButton variant="secondary">Add prompt</SubmitButton>
            </div>
          </form>
        </section>
      )}

      {/* Danger zone */}
      <section className="border-destructive/30 mt-12 max-w-2xl rounded-xl border p-6">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Danger zone
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Deleting a product removes its files, lessons and prompts. This cannot
          be undone.
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
