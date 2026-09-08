import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";

import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

// Absolute URLs for Open Graph images. Netlify sets DEPLOY_PRIME_URL per deploy
// (preview or branch) and URL for the production site.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.DEPLOY_PRIME_URL ??
  process.env.URL ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "My Vanity — Everything You Love",
    template: "%s · My Vanity",
  },
  description:
    "A curated luxury beauty collection. Browse skincare, makeup, fragrance and hair, then order directly over WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
