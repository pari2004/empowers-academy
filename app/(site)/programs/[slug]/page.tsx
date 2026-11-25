import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { Program } from "@/lib/content";
import { siteUrl, siteName } from "@/lib/seo";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import RequestCallbackModal from "@/components/RequestCallbackModal";
import EligibilityQuiz from "@/components/EligibilityQuiz";
import RevealController from "@/components/RevealController";
import ProgramContent from "@/components/ProgramContent";
import { IconGradientDefs } from "@/components/Icons";
import { getNavData, getFooterData } from "@/lib/cms/siteChrome";
import { getPublishedProgrammeDetailBySlug } from "@/lib/services/programmeDetailService";
import { getPublishedBrochures } from "@/lib/services/brochureService";
import { getFeaturedTestimonials } from "@/lib/services/testimonialService";
import { getUpcomingBatchForCourse } from "@/lib/services/publicBatchService";
import { getAlumniOutcomes } from "@/lib/cms/homepage";
import { getSeoOverride } from "@/lib/seoOverride";
import { resolveProgramBrochureUrl } from "@/lib/brochureUtils";

type Params = { slug: string };
type CourseWithProgramme = NonNullable<Awaited<ReturnType<typeof getPublishedProgrammeDetailBySlug>>>;
export type ProgramBrochure = Awaited<ReturnType<typeof getPublishedBrochures>>[number];
export type ProgramTestimonial = Awaited<ReturnType<typeof getFeaturedTestimonials>>[number];

// Every course is a static route, prerendered at build. A course published
// after the last build still renders on first request (dynamicParams
// defaults to true), so admins never wait on a redeploy to see it live.
export const revalidate = 60;

export async function generateStaticParams(): Promise<Params[]> {
  // Deliberately empty: rendered on-demand (ISR) rather than prerendered at
  // build. Enumerating every course here couples `next build` to database
  // reachability, and with 100+ programmes each firing several queries it
  // exhausts the connection pool. Returning [] lets each page generate on its
  // first request and then cache per `revalidate`; the sitemap still lists them
  // for crawlers.
  return [];
}

// Adapts a DB Course (+ optional ProgrammeDetail) into the legacy `Program`
// shape ProgramContent/ProgramCtas already render — keeps this migration to
// zero changes in those components. Courses without a published
// ProgrammeDetail still render via ProgramContent's `!d` fallback path.
import { programs as staticPrograms } from "@/lib/content";
import { nav as navFallback, footer as footerFallback, contactBar as contactBarFallback } from "@/lib/content";
import type { NavData } from "@/components/Nav";
import type { FooterData, ContactBarData } from "@/components/Footer";

function resolveProgramImage(course: CourseWithProgramme): string {
  const cover = course.coverImage;
  const thumb = course.thumbnail;
  const hero = course.programmeDetail?.heroImage;

  if (cover && !cover.includes("Full Stack Development.png") && !cover.includes("The Apex AI.jpg")) {
    return cover;
  }
  if (thumb && !thumb.includes("Full Stack Development.png") && !thumb.includes("The Apex AI.jpg")) {
    return thumb;
  }
  if (hero && !hero.includes("The Apex AI.jpg")) {
    return hero;
  }

  const s = (course.slug || "").toLowerCase();
  const t = (course.title || "").toLowerCase();

  if (s.includes("cloud") || t.includes("cloud")) {
    return "/Programs/Cloud Computing & DevOps.png";
  }
  if (s.includes("cyber") || s.includes("ceh") || t.includes("cybersecurity") || t.includes("ethical")) {
    return "/Programs/Cybersecurity (CEH v13).png";
  }
  if (s.includes("business") || t.includes("business analyst") || t.includes("ai program")) {
    return "/Programs/Business Analyst and Ai Program.png";
  }
  if (s.includes("executive") || t.includes("executive") || t.includes("agentic")) {
    return "/Programs/PG Executive Agentic AI & Generative AI.png";
  }
  if (s.includes("forward") || t.includes("forward deployed")) {
    return "/Programs/Forward Deployed Engineering Program.svg";
  }
  if (s.includes("apex") || s.includes("full-stack") || t.includes("full stack") || t.includes("apex")) {
    return "/Programs/Full Stack Development.png";
  }

  return "/Programs/Full Stack Development.png";
}

function toProgram(course: CourseWithProgramme, staticFallback?: Program): Program {
  const d = course.programmeDetail;
  const mentors = course.instructors.map((ci) => ci.instructor.name).join(", ") || undefined;
  const alreadyMentorLed = course.duration?.toLowerCase().includes("mentor-led") ?? false;
  const format = [
    course.duration,
    d?.mode ? d.mode.charAt(0) + d.mode.slice(1).toLowerCase() : undefined,
    alreadyMentorLed ? undefined : "mentor-led",
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    slug: course.slug,
    tag: course.category ?? staticFallback?.tag ?? "Program",
    title: course.title,
    goal: course.shortDescription ?? course.description,
    eligibility: d?.eligibility ?? staticFallback?.eligibility ?? undefined,
    format: format || staticFallback?.format || "",
    stack: course.tags?.length ? course.tags : (staticFallback?.stack ?? []),
    focus: course.learningOutcomes?.length ? course.learningOutcomes : (staticFallback?.focus ?? []),
    mentors,
    comingSoon: d?.admissionOpen === false ? true : undefined,
    image: resolveProgramImage(course) || staticFallback?.image,
    price: course.price ? Number(course.price) : staticFallback?.price,
    discountPrice: course.discountPrice ? Number(course.discountPrice) : staticFallback?.discountPrice,
    gstRate: staticFallback?.gstRate ?? 18,
    gstText: staticFallback?.gstText ?? "+ 18% GST",
    badge: staticFallback?.badge,
    applyCtaLabel: d?.applyCtaLabel ?? undefined,
    applyCtaHref: d?.applyCtaHref ?? undefined,
    details: d || staticFallback?.details
      ? {
        category: course.category ?? staticFallback?.details?.category ?? undefined,
        overview: d?.overview ?? course.description ?? staticFallback?.details?.overview,
        keyFeatures: d?.highlights?.length ? d.highlights : (staticFallback?.details?.keyFeatures ?? []),
        learningOutcomes: course.learningOutcomes?.length ? course.learningOutcomes : (staticFallback?.details?.learningOutcomes ?? []),
        learningPath: course.curriculum?.length ? course.curriculum.map((section) => section.title) : (staticFallback?.details?.learningPath ?? []),
        curriculum: (course.curriculum?.some((s) => s.lessons && s.lessons.length > 0)
          ? course.curriculum.map((section) => ({
              title: section.title,
              lessons: section.lessons.map((lesson) => ({
                title: lesson.title,
                duration: lesson.duration ?? undefined,
              })),
            }))
          : staticFallback?.details?.curriculum) ?? (course.curriculum?.length ? course.curriculum.map((s) => ({ title: s.title, lessons: [] })) : undefined),
        skills: staticFallback?.details?.skills?.length
          ? staticFallback.details.skills
          : (course.tags?.length ? course.tags : []),
        tools: staticFallback?.details?.tools?.length
          ? staticFallback.details.tools
          : (course.toolsCovered?.length ? course.toolsCovered : []),
        toolCategorized: staticFallback?.details?.toolCategorized,
        projectCategories: (d?.projects as Array<{ title: string }> | null)?.map((p) => p.title) ?? staticFallback?.details?.projectCategories ?? [],
        projectsList: staticFallback?.details?.projectsList,
        certifications: d?.certification ? [d.certification] : (staticFallback?.details?.certifications ?? []),
        placementSupport: d?.placementSupport ? [d.placementSupport] : (staticFallback?.details?.placementSupport ?? []),
        placementRate: d?.placementRate ?? staticFallback?.details?.placementRate ?? undefined,
        avgSalaryHikePct: d?.avgSalaryHikePct ?? staticFallback?.details?.avgSalaryHikePct ?? undefined,
        avgPackageLpa: d?.avgPackageLpa ? Number(d.avgPackageLpa) : (staticFallback?.details?.avgPackageLpa ?? undefined),
        careerRoles: d?.careerOpportunities?.length ? d.careerOpportunities : (staticFallback?.details?.careerRoles ?? []),
        price: course.price ? Number(course.price) : staticFallback?.details?.price,
        discountPrice: course.discountPrice ? Number(course.discountPrice) : staticFallback?.details?.discountPrice,
        gstRate: staticFallback?.details?.gstRate ?? 18,
        gstText: staticFallback?.details?.gstText ?? "+ 18% GST",
        badge: staticFallback?.details?.badge,
        emiAvailable: d?.emiAvailable ?? staticFallback?.details?.emiAvailable,
        emiDetails: d?.emiDetails ?? staticFallback?.details?.emiDetails,
        scholarshipInfo: d?.scholarshipInfo ?? staticFallback?.details?.scholarshipInfo,
        galleryImages: d?.galleryImages?.length ? d.galleryImages : (staticFallback?.details?.galleryImages ?? []),
        videoUrl: d?.videoUrl ?? staticFallback?.details?.videoUrl,
        curriculumHtmlUrl: d?.curriculumUrl ?? staticFallback?.details?.curriculumHtmlUrl,
        trainers: course.instructors?.length ? course.instructors.map((ci) => ({
          name: ci.instructor.name,
          designation: ci.instructor.designation,
          bio: ci.instructor.bio,
          image: ci.instructor.profileImage ?? undefined,
          skills: ci.instructor.skills,
          experience: ci.instructor.name.toLowerCase().includes("parikshith") ? undefined : (ci.instructor.experience ?? undefined),
        })) : staticFallback?.details?.trainers,
        faqs: course.faqs?.length ? course.faqs.map((f) => ({ q: f.question, a: f.answer })) : staticFallback?.details?.faqs,
        unfairAdvantage: staticFallback?.details?.unfairAdvantage,
        careerMatrix: staticFallback?.details?.careerMatrix,
        marketRealignment: staticFallback?.details?.marketRealignment,
      }
      : undefined,
  };
}

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const params = await props.params;
  let course: CourseWithProgramme | null = null;
  try {
    course = await getPublishedProgrammeDetailBySlug(params.slug);
  } catch (error) {
    console.error(`DB error in generateMetadata for ${params.slug}:`, error);
  }

  let program: Program | undefined;
  const staticProgram = staticPrograms.find(
    (p) => p.slug === params.slug || p.slug.includes(params.slug) || params.slug.includes(p.slug)
  );

  if (course) {
    program = toProgram(course, staticProgram);
    if (staticProgram?.details?.curriculumHtmlUrl && !program.details?.curriculumHtmlUrl) {
      program.details = program.details || {};
      program.details.curriculumHtmlUrl = staticProgram.details.curriculumHtmlUrl;
    }
  } else {
    program = staticProgram;
  }

  if (!program) return {};
  const seo = course ? await getSeoOverride("course", course.id) : {};

  const url = `${siteUrl}/programs/${program.slug}`;
  const title = seo.title ?? program.title;
  const description = seo.description ?? program.details?.overview ?? program.goal;

  return {
    title,
    description,
    keywords: seo.keywords ?? [
      program.title,
      ...(program.details?.skills ?? program.stack),
      ...(program.details?.careerRoles ?? []),
    ],
    alternates: { canonical: seo.canonicalUrl ?? `/programs/${program.slug}` },
    robots: seo.robots,
    openGraph: {
      type: "article",
      url,
      siteName,
      title: `${title} | ${siteName}`,
      description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
    twitter: {
      card: (seo.twitterCard as "summary" | "summary_large_image" | undefined) ?? "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
    },
  };
}

export default async function ProgramPage(props: { params: Promise<Params> }) {
  const params = await props.params;
  let course: CourseWithProgramme | null = null;
  try {
    course = await getPublishedProgrammeDetailBySlug(params.slug);
  } catch (error) {
    console.error(`DB error in ProgramPage for ${params.slug}:`, error);
  }

  let program: Program | undefined;
  const staticProgram = staticPrograms.find(
    (p) => p.slug === params.slug || p.slug.includes(params.slug) || params.slug.includes(p.slug)
  );

  if (course) {
    program = toProgram(course, staticProgram);
    if (staticProgram?.details?.curriculumHtmlUrl && !program.details?.curriculumHtmlUrl) {
      program.details = program.details || {};
      program.details.curriculumHtmlUrl = staticProgram.details.curriculumHtmlUrl;
    }
    if (staticProgram?.certificate && !program.certificate) {
      program.certificate = staticProgram.certificate;
    }
  } else {
    program = staticProgram;
  }

  if (!program) notFound();

  let nav: NavData = navFallback;
  let footer: FooterData = footerFallback;
  let contactBar: ContactBarData = contactBarFallback;
  let brochures: ProgramBrochure[] = [];
  let testimonials: ProgramTestimonial[] = [];
  let nextBatch: Awaited<ReturnType<typeof getUpcomingBatchForCourse>> = null;
  let allAlumniOutcomes: Awaited<ReturnType<typeof getAlumniOutcomes>> = [];

  try {
    const res = await Promise.all([
      getNavData(),
      getFooterData(),
      course ? getPublishedBrochures({ courseId: course.id }) : Promise.resolve([]),
      getFeaturedTestimonials(),
      course ? getUpcomingBatchForCourse(course.id) : Promise.resolve(null),
      getAlumniOutcomes(),
    ]);
    nav = res[0];
    footer = res[1].footer;
    contactBar = res[1].contactBar;
    brochures = res[2];
    testimonials = res[3];
    nextBatch = res[4];
    allAlumniOutcomes = res[5];
  } catch (error) {
    console.error("Failed to load program page data from DB, using fallback defaults:", error);
  }

  const brochure = brochures[0] ?? {
    fileUrl: resolveProgramBrochureUrl(program.slug, program.title),
    downloadButtonText: "Download Brochure",
  };

  // Alumni stories aren't linked to a course by ID — admins tag each one with
  // a free-text `programTag` matched loosely against this course's category.
  const category = program.details?.category?.toLowerCase();
  const alumniOutcomes = category
    ? allAlumniOutcomes.filter((a) => a.programTag && category.includes(a.programTag.toLowerCase())).slice(0, 3)
    : [];

  const url = `${siteUrl}/programs/${program.slug}`;
  const d = program.details;

  // Course + breadcrumb markup, scoped to this program. No rating/review
  // nodes — see the note in components/StructuredData.tsx.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        "@id": `${url}#course`,
        name: program.title,
        description: d?.overview ?? program.goal,
        url,
        provider: {
          "@type": "EducationalOrganization",
          "@id": `${siteUrl}/#organization`,
          name: siteName,
          url: siteUrl,
        },
        inLanguage: "en",
        timeRequired: "P6M",
        coursePrerequisites: program.eligibility,
        teaches: d?.skills ?? program.stack,
        occupationalCategory: d?.careerRoles,
        educationalCredentialAwarded: d?.certifications?.join(", "),
        educationalLevel: "Professional",
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "Online",
          courseWorkload: "P6M",
          location: {
            "@type": "VirtualLocation",
            url: siteUrl,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Programs", item: `${siteUrl}/#programs` },
          { "@type": "ListItem", position: 3, name: program.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <IconGradientDefs />
      <RevealController />
      <Nav nav={nav} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main className="program-page">
        <div className="program-page-container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/#programs">Programs</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{program.title}</span>
          </nav>

          <ProgramContent
            program={program}
            brochure={brochure}
            testimonials={testimonials}
            nextBatch={
              nextBatch
                ? {
                    ...nextBatch,
                    startDate: nextBatch.startDate ? new Date(nextBatch.startDate).toISOString() : new Date().toISOString(),
                    endDate: nextBatch.endDate ? new Date(nextBatch.endDate).toISOString() : null,
                  }
                : null
            }
            alumniOutcomes={alumniOutcomes}
          />
        </div>
      </main>
      <Footer footer={footer} contactBar={contactBar} />
      <RequestCallbackModal />
      <EligibilityQuiz />
      <ChatWidget phone={contactBar.phone} whatsapp={contactBar.whatsapp} />
    </>
  );
}
