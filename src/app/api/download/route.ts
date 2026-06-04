import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { FILES_BUCKET } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Gated download broker.  GET /api/download?file=<product_files.id>
 *
 * 1. Authenticate the user.
 * 2. Verify they hold an entitlement for the file's product.
 * 3. Mint a 60-second Supabase signed URL and log a download_event.
 * 4. Redirect to it. The storage path is never exposed to the client.
 */
export async function GET(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fileId = new URL(req.url).searchParams.get("file");
  if (!fileId) {
    return NextResponse.json({ error: "Missing file id" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: file } = await supabase
    .from("product_files")
    .select("id, product_id, storage_path")
    .eq("id", fileId)
    .maybeSingle();
  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", file.product_id)
    .maybeSingle();
  if (!entitlement) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: signed, error } = await supabase.storage
    .from(FILES_BUCKET)
    .createSignedUrl(file.storage_path, 60, { download: true });
  if (error || !signed) {
    return NextResponse.json(
      { error: "Could not create download link" },
      { status: 500 },
    );
  }

  // Best-effort audit log (don't block the download if it fails).
  await supabase.from("download_events").insert({
    user_id: user.id,
    product_id: file.product_id,
    file_id: file.id,
  });

  return NextResponse.redirect(signed.signedUrl, { status: 307 });
}
