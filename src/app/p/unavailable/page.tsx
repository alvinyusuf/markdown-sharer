import { notFound } from "next/navigation";
import type { Metadata } from "next";

/**
 * The proxy rewrites unavailable public links here.
 *
 * The route is static, so the 404 status is decided while the app is built
 * instead of while the response is already streaming.
 */
export const metadata: Metadata = {
  title: "Document not found",
  robots: { index: false, follow: false },
};

export default function PublicDocumentUnavailablePage() {
  notFound();
}
