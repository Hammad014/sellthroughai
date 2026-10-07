"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Cover } from "@/components/cover";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/lib/supabase/types";

/**
 * Sales-page media: the cover plus any gallery images, with a thumbnail strip.
 * Falls back to the plain <Cover> (gradient or uploaded image) when the product
 * has no gallery.
 */
export function ProductGallery({
  category,
  title,
  tag,
  coverImageUrl,
  gallery,
}: {
  category: string;
  title: string;
  tag: string;
  coverImageUrl: string | null;
  gallery: GalleryImage[];
}) {
  const images: GalleryImage[] = [
    ...(coverImageUrl ? [{ url: coverImageUrl, alt: title }] : []),
    ...gallery,
  ];
  const [active, setActive] = useState(0);

  if (gallery.length === 0) {
    return (
      <Cover
        category={category}
        coverImageUrl={coverImageUrl}
        title={title}
        tag={tag}
        className="aspect-[16/11] rounded-xl"
      />
    );
  }

  const current = images[active] ?? images[0];
  return (
    <div>
      <div className="bg-card relative aspect-[16/11] overflow-hidden rounded-xl border">
        <img
          src={current.url}
          alt={current.alt}
          className="size-full object-cover"
        />
      </div>
      {current.alt && current.alt !== title && (
        <p className="text-muted-foreground mt-3 text-sm">{current.alt}</p>
      )}
      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-9">
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1}: ${img.alt}`}
            aria-current={i === active}
            className={cn(
              "bg-card aspect-[4/3] overflow-hidden rounded-md border transition-all",
              i === active
                ? "border-primary ring-primary/40 ring-2"
                : "opacity-70 hover:opacity-100",
            )}
          >
            <img
              src={img.url}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
