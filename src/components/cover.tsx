/* eslint-disable @next/next/no-img-element */
import { categoryGradient, getCategory } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * Programmatic product cover art. Uses the uploaded `coverImageUrl` when set,
 * otherwise falls back to the category gradient + glyph from the design.
 */
export function Cover({
  category,
  coverImageUrl,
  title,
  tag,
  className,
  badge,
}: {
  category: string;
  coverImageUrl?: string | null;
  title?: string;
  tag?: string;
  className?: string;
  badge?: string;
}) {
  const cat = getCategory(category);
  const Icon = cat?.icon;

  return (
    <div className={cn("cover", categoryGradient(category), className)}>
      {coverImageUrl ? (
        <img
          src={coverImageUrl}
          alt={title ?? ""}
          className="absolute inset-0 z-[3] size-full object-cover"
        />
      ) : (
        Icon && (
          <span className="cover-glyph">
            <Icon className="size-[34%]" strokeWidth={1.6} />
          </span>
        )
      )}
      {tag && <span className="cover-tag">{tag}</span>}
      {badge && (
        <span className="bg-primary text-primary-foreground text-2xs absolute top-3 right-3 z-[4] rounded-[6px] border border-transparent px-2 py-1 font-mono tracking-wider uppercase">
          {badge}
        </span>
      )}
    </div>
  );
}
