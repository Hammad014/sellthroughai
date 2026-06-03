/**
 * Storage bucket names.
 *
 * - product-covers: PUBLIC bucket for product cover images (shown on the
 *   public catalog, so served via public URL).
 * - product-files:  PRIVATE bucket for gated downloadables. Never public;
 *   access is brokered server-side with short-lived signed URLs.
 */
export const COVERS_BUCKET = "product-covers";
export const FILES_BUCKET = "product-files";
