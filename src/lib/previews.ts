import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import type { CourseLesson, ProductPrompt } from "@/lib/supabase/types";

/**
 * Public "what's inside" previews for sales pages.
 *
 * product_prompts / course_lessons have no client RLS policies (service-role
 * only), so these run server-side and return ONLY teaser-safe fields — titles,
 * descriptions, the count — plus a single intentional free sample. The full
 * paid content is never sent to non-buyers except that one sample.
 */

export type PromptPreview = Pick<
  ProductPrompt,
  "id" | "title" | "description" | "model"
>;

/** Titles + descriptions for every prompt (no bodies/examples). */
export async function getPromptPreviews(
  productId: string,
): Promise<PromptPreview[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("product_prompts")
    .select("id, title, description, model")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

/** The first prompt in full — shown publicly as a free sample. */
export async function getSamplePrompt(
  productId: string,
): Promise<ProductPrompt | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("product_prompts")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

export type LessonPreview = Pick<CourseLesson, "id" | "title">;

/** Lesson/chapter titles only (the curriculum). */
export async function getLessonPreviews(
  productId: string,
): Promise<LessonPreview[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("course_lessons")
    .select("id, title")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

/** The first lesson in full — shown publicly as a free preview. */
export async function getSampleLesson(
  productId: string,
): Promise<Pick<CourseLesson, "id" | "title" | "content_md"> | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("course_lessons")
    .select("id, title, content_md")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}
