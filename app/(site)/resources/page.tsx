import type { Metadata } from "next";
import Link from "next/link";

import { siteUrl, siteName } from "@/lib/seo";
import { getPublishedBlogs } from "@/lib/services/blogService";
import { getNavData, getFooterData } from "@/lib/cms/siteChrome";
import { getSeoOverride } from "@/lib/seoOverride";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import RequestCallbackModal from "@/components/RequestCallbackModal";
import EligibilityQuiz from "@/components/EligibilityQuiz";
import { IconGradientDefs } from "@/components/Icons";

export const revalidate = 60;

const description =
  "Practical guides on AI engineering, LLM systems, and breaking into an AI career — written by the mentors who teach them.";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoOverride("static", "resources");
  const title = seo.title ?? "Resources";
  const desc = seo.description ?? description;

  return {
    title,
    description: desc,
    keywords: seo.keywords,
    alternates: { canonical: seo.canonicalUrl ?? "/resources" },
    robots: seo.robots,
    openGraph: {
      type: "website",
      url: `${siteUrl}/resources`,
      siteName,
      title: `${title} | ${siteName}`,
      description: desc,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
  };
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default async function ResourcesPage() {
  const [articles, nav, { footer, contactBar }] = await Promise.all([
    getPublishedBlogs().catch((err) => {
      console.error("DB error in getPublishedBlogs:", err);
      return [];
    }),
    getNavData(),
    getFooterData(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${siteUrl}/resources#blog`,
        name: `${siteName} Resources`,
        description,
        url: `${siteUrl}/resources`,
        inLanguage: "en",
        publisher: { "@type": "Organization", "@id": `${siteUrl}/#organization` },
        blogPost: articles.map((a) => ({
          "@type": "BlogPosting",
          headline: a.title,
          description: a.excerpt ?? "",
          url: `${siteUrl}/resources/${a.slug}`,
          datePublished: a.publishedAt?.toISOString(),
          dateModified: a.updatedAt.toISOString(),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Resources", item: `${siteUrl}/resources` },
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main className="article-page">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Resources</span>
          </nav>

          <div className="section-head">
            <span className="eyebrow">Resources</span>
            <h1>Guides from the people who teach this</h1>
            <p>{description}</p>
          </div>

          <div className="resource-grid resource-grid-index">
            {articles.map((a) => (
              <Link className="resource-card glass-panel" href={`/resources/${a.slug}`} key={a.slug}>
                <span className="chip">{a.category?.name ?? "Guide"}</span>
                <h2>{a.title}</h2>
                <p>{a.excerpt}</p>
                <span className="resource-card-meta">
                  {a.publishedAt && <time dateTime={a.publishedAt.toISOString()}>{formatDate(a.publishedAt)}</time>} ·{" "}
                  {a.readingTime}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer footer={footer} contactBar={contactBar} />
      <RequestCallbackModal />
      <EligibilityQuiz />
      <ChatWidget phone={contactBar.phone} whatsapp={contactBar.whatsapp} />
    </>
  );
}
