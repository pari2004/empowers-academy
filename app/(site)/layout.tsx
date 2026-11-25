import type { Metadata, Viewport } from "next";
import "../globals.css";
import StructuredData from "@/components/StructuredData";
import {
  siteUrl,
  siteName,
  siteTitle,
  siteDescription,
  keywords,
  geo,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords,
  authors: [{ name: siteName, url: siteUrl }],
  creator: "Fortivex.AI Pvt Ltd",
  publisher: siteName,
  category: "education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName,
    title: siteTitle,
    description: siteDescription,
    // og:image / twitter:image come from app/opengraph-image.tsx and
    // app/twitter-image.tsx via the file convention.
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/logo_icon_glow.png",
    shortcut: "/logo_icon_glow.png",
    apple: "/logo_icon_glow.png",
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "black-translucent",
  },
  // Local-SEO geo tags (Bengaluru / BTM Layout campus).
  other: {
    "geo.region": "IN-KA",
    "geo.placename": "Bengaluru",
    "geo.position": `${geo.lat};${geo.lng}`,
    ICBM: `${geo.lat}, ${geo.lng}`,
  },
  // When Google Search Console is set up, add:
  // verification: { google: "<token from Search Console>" },
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StructuredData />
        {/* Spatial depth: layer 1 (furthest) fixed gradient */}
        <div className="space-bg" aria-hidden="true" />
        {/* Layer 2: drifting glow blobs behind every section */}
        <div className="blob-field" aria-hidden="true">
          <span className="blob b1" />
          <span className="blob b2" />
          <span className="blob b3" />
        </div>
        {children}
      </body>
    </html>
  );
}
