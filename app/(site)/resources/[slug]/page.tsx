import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { siteUrl, siteName } from "@/lib/seo";
import { getPublishedBlogBySlug, getPublishedBlogs } from "@/lib/services/blogService";
import { getNavData, getFooterData } from "@/lib/cms/siteChrome";
import { getSeoOverride } from "@/lib/seoOverride";
import type { Block } from "@/lib/resources";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import RequestCallbackModal from "@/components/RequestCallbackModal";
import EligibilityQuiz from "@/components/EligibilityQuiz";
import ArticleBody from "@/components/ArticleBody";
import ResourceCta from "@/components/ResourceCta";
import { IconGradientDefs } from "@/components/Icons";

type Params = { slug: string };

// Posts render on first request and are then cached + revalidated
// (dynamicParams defaults to true), so admins never have to wait on a redeploy
// to see new content live.
export const revalidate = 60;

export async function generateStaticParams(): Promise<Params[]> {
  // Deliberately empty: rendered on-demand (ISR) rather than prerendered at
  // build, so `next build` doesn't depend on database reachability. Each post
  // generates on its first request and then caches per `revalidate`; the
  // sitemap still lists them for crawlers.
  return [];
}

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const params = await props.params;
  let article = null;
  try {
    article = await getPublishedBlogBySlug(params.slug);
  } catch (error) {
    console.error(`DB error in generateMetadata for blog ${params.slug}:`, error);
  }
  if (!article) return {};
  const seo = await getSeoOverride("blog", article.id);

  const url = `${siteUrl}/resources/${article.slug}`;
  const title = seo.title ?? article.title;
  const description = seo.description ?? article.excerpt ?? undefined;

  return {
    title,
    description,
    keywords: seo.keywords,
    alternates: { canonical: seo.canonicalUrl ?? `/resources/${article.slug}` },
    robots: seo.robots,
    openGraph: {
      type: "article",
      url,
      siteName,
      title,
      description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [siteName],
    },
    twitter: {
      card: (seo.twitterCard as "summary" | "summary_large_image" | undefined) ?? "summary_large_image",
      title,
      description,
    },
  };
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default async function ArticlePage(props: { params: Promise<Params> }) {
  const params = await props.params;
  let article = null;
  try {
    article = await getPublishedBlogBySlug(params.slug);
  } catch (error) {
    console.error(`DB error in ArticlePage for blog ${params.slug}:`, error);
  }
  if (!article) notFound();

  const [allPosts, nav, { footer, contactBar }] = await Promise.all([
    getPublishedBlogs().catch((err) => {
      console.error("DB error in getPublishedBlogs:", err);
      return [];
    }),
    getNavData(),
    getFooterData(),
  ]);
  const related = allPosts.filter((a) => a.slug !== article.slug);

  const url = `${siteUrl}/resources/${article.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: article.title,
        description: article.excerpt ?? "",
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        datePublished: article.publishedAt?.toISOString(),
        dateModified: article.updatedAt.toISOString(),
        inLanguage: "en",
        articleSection: article.category?.name,
        author: { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: siteName },
        publisher: {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          name: siteName,
          logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Resources", item: `${siteUrl}/resources` },
          { "@type": "ListItem", position: 3, name: article.title, item: url },
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
            <Link href="/resources">Resources</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{article.title}</span>
          </nav>

          <article className="article-card glass-panel">
            <header className="article-head">
              <div className="article-meta">
                <span className="chip">{article.category?.name ?? "Guide"}</span>
                {article.publishedAt && <time dateTime={article.publishedAt.toISOString()}>{formatDate(article.publishedAt)}</time>}
                <span>{article.readingTime}</span>
              </div>
              <h1>{article.title}</h1>
              <p className="article-standfirst">{article.excerpt}</p>
            </header>

            <ArticleBody blocks={article.body as unknown as Block[]} />

            <ResourceCta />
          </article>

          {related.length > 0 && (
            <aside className="article-related">
              <h2>Keep reading</h2>
              <div className="resource-grid">
                {related.map((a) => (
                  <Link className="resource-card glass-panel" href={`/resources/${a.slug}`} key={a.slug}>
                    <span className="chip">{a.category?.name ?? "Guide"}</span>
                    <h3>{a.title}</h3>
                    <p>{a.excerpt}</p>
                    <span className="resource-card-meta">{a.readingTime}</span>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      </main>
      <Footer footer={footer} contactBar={contactBar} />
      <RequestCallbackModal />
      <EligibilityQuiz />
      <ChatWidget phone={contactBar.phone} whatsapp={contactBar.whatsapp} />
    </>
  );
}
