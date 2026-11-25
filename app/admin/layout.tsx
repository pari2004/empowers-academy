import type { ReactNode } from "react";
import AdminProviders from "./providers";
import { siteUrl } from "@/lib/seo";
import "./admin.css";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Empowers Academy — CMS",
  robots: { index: false, follow: false },
};

// This is an independent root layout (its own <html>/<body>), separate from
// app/(site)/layout.tsx's public-site shell — see Next.js "multiple root
// layouts via route groups". Keeps the admin panel free of the public site's
// space-bg/StructuredData/fonts, and vice versa.
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="adm-root">
        <AdminProviders>{children}</AdminProviders>
      </body>
    </html>
  );
}
