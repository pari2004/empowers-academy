import type { Metadata } from "next";
import Link from "next/link";

import { siteUrl, siteName } from "@/lib/seo";
import { getPublishedBrochures } from "@/lib/services/brochureService";
import { getNavData, getFooterData } from "@/lib/cms/siteChrome";
import { getSeoOverride } from "@/lib/seoOverride";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import RequestCallbackModal from "@/components/RequestCallbackModal";
import EligibilityQuiz from "@/components/EligibilityQuiz";
import { IconGradientDefs } from "@/components/Icons";

export const revalidate = 60;

const description = "Download detailed brochures for our programs — curriculum, format, fees, and outcomes.";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoOverride("static", "brochures");
  const title = seo.title ?? "Brochures";
  const desc = seo.description ?? description;

  return {
    title,
    description: desc,
    keywords: seo.keywords,
    alternates: { canonical: seo.canonicalUrl ?? "/brochures" },
    robots: seo.robots,
    openGraph: {
      type: "website",
      url: `${siteUrl}/brochures`,
      siteName,
      title: `${title} | ${siteName}`,
      description: desc,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
  };
}

export default async function BrochuresPage() {
  const [brochures, nav, { footer, contactBar }] = await Promise.all([
    getPublishedBrochures().catch((err) => {
      console.error("DB error in getPublishedBrochures:", err);
      return [];
    }),
    getNavData(),
    getFooterData(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/brochures#page`,
        name: "Brochures",
        description,
        url: `${siteUrl}/brochures`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Brochures", item: `${siteUrl}/brochures` },
        ],
      },
    ],
  };

  return (
    <>
      <IconGradientDefs />
      <Nav nav={nav} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <main className="article-page">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Brochures</span>
          </nav>

          <div className="section-head">
            <span className="eyebrow">Brochures</span>
            <h1>Program brochures</h1>
            <p>{description}</p>
          </div>

          <div className="resource-grid resource-grid-index">
            {brochures.map((b) => (
              <div className="resource-card glass-panel" key={b.slug}>
                <span className="chip">{b.category?.name ?? "Brochure"}</span>
                <h2>{b.title}</h2>
                <p>{b.shortDescription}</p>
                <a className="btn btn-primary" href={b.fileUrl} download>
                  {b.downloadButtonText || "Download Brochure"}
                </a>
              </div>
            ))}
          </div>

          {brochures.length === 0 && <p>No brochures are available yet — check back soon.</p>}
        </div>
      </main>
      <Footer footer={footer} contactBar={contactBar} />
      <RequestCallbackModal />
      <EligibilityQuiz />
      <ChatWidget phone={contactBar.phone} whatsapp={contactBar.whatsapp} />
    </>
  );
}
