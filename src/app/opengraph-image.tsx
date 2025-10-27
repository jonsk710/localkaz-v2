import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "64px",
        background: "linear-gradient(135deg, #00B894 0%, #55EFC4 50%, #74B9FF 100%)",
      }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: "#ffffff" }}>LocalKaz</div>
        <div style={{ marginTop: 12, fontSize: 36, color: "#ffffff" }}>Locations locales · Guadeloupe</div>
        <div style={{ marginTop: 24, fontSize: 28, color: "#ffffff" }}>Carte interactive • Hôtes locaux • Bons plans</div>
      </div>
    ),
    { ...size }
  );
}
