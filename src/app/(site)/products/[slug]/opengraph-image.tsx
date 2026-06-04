import { ImageResponse } from "next/og";
import { createServiceClient } from "@/lib/supabase/service";
import { categoryName, formatPrice } from "@/lib/catalog";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Aiselling — AI product";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let title = "Aiselling";
  let category = "AI products";
  let price = "";
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("products")
      .select("title, category, price_usd, status")
      .eq("slug", slug)
      .maybeSingle();
    if (data && data.status === "published") {
      title = data.title;
      category = categoryName(data.category);
      price = formatPrice(data.price_usd);
    }
  } catch {
    // fall back to brand defaults
  }

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        background: "linear-gradient(135deg, #0a1322 0%, #0e1f33 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 26,
          color: "#7cc4ff",
          textTransform: "uppercase",
          letterSpacing: 4,
        }}
      >
        aiselling · {category}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            fontSize: 66,
            fontWeight: 700,
            lineHeight: 1.08,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        {price && <div style={{ fontSize: 40, color: "#7cc4ff" }}>{price}</div>}
      </div>
      <div style={{ fontSize: 26, color: "#9fb3c8" }}>
        Instant delivery · Lifetime access
      </div>
    </div>,
    { ...size },
  );
}
