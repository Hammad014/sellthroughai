import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Promptory — Premium AI products storefront";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 28,
        padding: "80px",
        background: "linear-gradient(135deg, #0a1322 0%, #0e1f33 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 30,
          color: "#7cc4ff",
          textTransform: "uppercase",
          letterSpacing: 6,
        }}
      >
        promptory
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.05,
        }}
      >
        <span>Premium AI products,</span>
        <span>ready to use.</span>
      </div>
      <div style={{ fontSize: 30, color: "#9fb3c8", maxWidth: 900 }}>
        Prompt packs · automation kits · Notion systems · mini-courses · ebooks
      </div>
    </div>,
    { ...size },
  );
}
