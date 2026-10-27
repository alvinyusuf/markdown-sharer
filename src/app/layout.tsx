import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { getSiteUrl } from "@/config/env";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Readmeo — Markdown, ready to share",
    template: "%s · Readmeo",
  },
  description:
    "Upload a Markdown file, preview it as a polished document, and share it with a link. No reader installs required.",
  applicationName: "Readmeo",
  openGraph: {
    type: "website",
    siteName: "Readmeo",
    title: "Readmeo — Markdown, ready to share",
    description:
      "Upload a Markdown file, preview it as a polished document, and share it with a link.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Readmeo — Markdown, ready to share",
    description:
      "Upload a Markdown file, preview it as a polished document, and share it with a link.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
