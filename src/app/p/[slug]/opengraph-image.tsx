import { ImageResponse } from "next/og";

import { getPublishedDocument } from "@/lib/documents/public-queries";

export const alt = "A document shared with Readmeo";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

/**
 * Open Graph preview for a published document.
 *
 * Only the title and description are rendered. The document body is never
 * included, so a long document cannot blow up the image.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = await getPublishedDocument(slug);

  const title = document?.title ?? "Shared with Readmeo";
  const description = document?.description ?? undefined;

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#faf9f6",
        backgroundImage:
          "radial-gradient(circle at 12% 0%, rgba(59, 99, 235, 0.22), transparent 55%)",
        padding: "72px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            backgroundColor: "#2450E6",
            color: "#faf9f6",
            fontSize: "26px",
            fontWeight: 700,
          }}
        >
          R
        </div>
        <div style={{ display: "flex", fontSize: "26px", color: "#5d5a52" }}>
          Readmeo
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 60 ? "56px" : "68px",
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#1f1c18",
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              display: "flex",
              marginTop: "24px",
              fontSize: "30px",
              lineHeight: 1.4,
              color: "#5d5a52",
            }}
          >
            {description.length > 160 ? `${description.slice(0, 159)}…` : description}
          </div>
        ) : null}
      </div>
    </div>,
    { ...size },
  );
}
