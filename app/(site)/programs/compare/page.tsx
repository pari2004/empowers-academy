import type { Metadata } from "next";
import Link from "next/link";

import { siteUrl, siteName } from "@/lib/seo";
import { getCoursesForComparison, listPublishedCourseOptions } from "@/lib/services/courseService";
import { programs as staticPrograms } from "@/lib/content";
import { getNavData, getFooterData } from "@/lib/cms/siteChrome";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import RequestCallbackModal from "@/components/RequestCallbackModal";
import EligibilityQuiz from "@/components/EligibilityQuiz";
import { IconGradientDefs } from "@/components/Icons";
import CompareProgramsPicker from "@/components/CompareProgramsPicker";
import CompareProgramsTable from "@/components/CompareProgramsTable";

export const revalidate = 60;

const description = "Compare Empowers Academy programs side by side — duration, fees, certification, and placement support.";

export function generateMetadata(): Metadata {
  return {
    title: "Compare Programs",
    description,
    alternates: { canonical: `${siteUrl}/programs/compare` },
    openGraph: { type: "website", url: `${siteUrl}/programs/compare`, siteName, title: "Compare Programs", description },
  };
}

export default async function ComparePage(props: { searchParams: Promise<{ slugs?: string }> }) {
  const searchParams = await props.searchParams;
  const slugs: string[] = (searchParams.slugs ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const [nav, { footer, contactBar }, options, courses] = await Promise.all([
    getNavData(),
    getFooterData(),
    listPublishedCourseOptions().catch(() => []),
    getCoursesForComparison(slugs).catch(() => []),
  ]);

  const resolvedOptions = options?.length > 0
    ? options
    : staticPrograms.map((p) => ({ slug: p.slug, title: p.title, category: p.tag ?? null }));

  const fallbackCourses = slugs
    .map((slug: string) => {
      const p = staticPrograms.find((sp) => sp.slug === slug);
      if (!p) return null;
      return {
        slug: p.slug,
        title: p.title,
        thumbnail: p.image ?? null,
        category: p.tag ?? null,
        duration: p.format ?? null,
        level: "ALL_LEVELS" as const,
        price: p.details?.price ?? p.price ?? null,
        discountPrice: p.details?.discountPrice ?? p.discountPrice ?? null,
        tags: p.stack,
        programmeDetail: {
          mode: "ONLINE" as const,
          certification: p.details?.certifications?.[0] ?? null,
          placementSupport: p.details?.placementSupport?.join(", ") ?? null,
          emiAvailable: p.details?.emiAvailable ?? true,
          placementRate: p.details?.placementRate ?? null,
          avgSalaryHikePct: p.details?.avgSalaryHikePct ?? null,
          avgPackageLpa: p.details?.avgPackageLpa ?? null,
        },
      };
    })
    .filter(Boolean) as unknown as typeof courses;

  const resolvedCourses = courses?.length > 0 ? courses : fallbackCourses;

  return (
    <>
      <IconGradientDefs />
      <Nav nav={nav} />
      <main className="article-page">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/#programs">Programs</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Compare</span>
          </nav>

          <div className="section-head">
            <span className="eyebrow">Not sure which to pick?</span>
            <h1>Compare Programs</h1>
            <p>Pick 2-4 programs to see fees, format, certification, and placement support side by side.</p>
          </div>

          <CompareProgramsPicker options={resolvedOptions} selectedSlugs={slugs} />

          {!!resolvedCourses.length && <CompareProgramsTable courses={resolvedCourses} />}
          {!!slugs.length && !resolvedCourses.length && (
            <p>None of the selected programs are currently published — pick different ones above.</p>
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
