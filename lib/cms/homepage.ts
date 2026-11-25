// Aggregates everything app/(site)/page.tsx needs, one section at a time.
// Each getter falls back to the section being treated as absent/empty if the
// CMS has no matching PageSection row yet (rather than crashing the page).
import { prisma } from "@/lib/db";
import { getPublishedCourses } from "@/lib/services/courseService";
import { getFeaturedInstructors } from "@/lib/services/instructorService";
import { listGlobalPublishedFaqs } from "@/lib/services/faqService";
import type { HeroData } from "@/components/Hero";
import type { PartnersData } from "@/components/Partners";
import type { WhyCard } from "@/components/WhyEmpowers";
import type { ProgramCard } from "@/components/Programs";
import type { JourneyStep } from "@/components/Journey";
import type { GuaranteeStep } from "@/components/Guarantee";
import type { StatItem } from "@/components/Outcomes";
import type { AlumniOutcome } from "@/components/Alumni";
import type { MentorData } from "@/components/Mentors";
import type { CommunityData } from "@/components/Community";
import type { FaqItem } from "@/components/Faq";

export type HomepageSection = { type: string; enabled: boolean; config: Record<string, unknown> };

async function getHomepageSections(): Promise<Map<string, HomepageSection>> {
  const rows = await prisma.pageSection.findMany({ where: { landingPageId: null }, orderBy: { order: "asc" } });
  return new Map(rows.map((r) => [r.type, { type: r.type, enabled: r.enabled, config: r.config as Record<string, unknown> }]));
}

// Single-section read for pages that only need the alumni list (program
// pages), so they don't pull the rest of getHomepageData's queries.
export async function getAlumniOutcomes(): Promise<AlumniOutcome[]> {
  try {
    const row = await prisma.pageSection.findFirst({ where: { landingPageId: null, type: "ALUMNI_OUTCOMES" } });
    const config = (row?.config as Record<string, unknown>) ?? {};
    return (config.items as AlumniOutcome[]) ?? [];
  } catch (error) {
    console.error("DB error in getAlumniOutcomes, using fallback:", error);
    return [];
  }
}

export type HomepageData = {
  hero: HeroData;
  partners: PartnersData | null;
  whyCards: WhyCard[];
  programs: ProgramCard[];
  journey: JourneyStep[];
  guarantee: GuaranteeStep[];
  stats: StatItem[];
  outcomes: AlumniOutcome[];
  mentors: MentorData[];
  community: CommunityData | null;
  faqs: FaqItem[];
  brochure: { heading: string; body: string; button: string };
  sectionEnabled: Record<string, boolean>;
};

import { 
  programs as staticPrograms, 
  partners as staticPartners, 
  mentors as staticMentors,
  hero as staticHero,
  whyCards as staticWhyCards,
  journey as staticJourney,
  guarantee as staticGuarantee,
  stats as staticStats,
  outcomes as staticOutcomes,
  faqs as staticFaqs,
  community as staticCommunity,
  brochure as staticBrochure
} from "@/lib/content";

export async function getHomepageData(): Promise<HomepageData> {
  let sections = new Map<string, HomepageSection>();
  let courses: Awaited<ReturnType<typeof getPublishedCourses>> = [];
  let instructors: Awaited<ReturnType<typeof getFeaturedInstructors>> = [];
  let faqRows: Awaited<ReturnType<typeof listGlobalPublishedFaqs>> = [];

  let dbOffline = false;

  try {
    const res = await Promise.all([
      getHomepageSections(),
      getPublishedCourses(),
      getFeaturedInstructors(),
      listGlobalPublishedFaqs(),
    ]);
    sections = res[0];
    courses = res[1];
    instructors = res[2];
    faqRows = res[3];
  } catch (error) {
    console.error("DB error in getHomepageData, using static fallbacks:", error);
    dbOffline = true;
  }

  const cfg = (type: string) => sections.get(type)?.config ?? {};
  const enabled = (type: string) => sections.get(type)?.enabled ?? true;

  const dbCards = courses.map((c) => {
    const staticMatch = staticPrograms.find((p) => p.slug === c.slug || p.title === c.title);
    return {
      slug: c.slug,
      tag: c.category ?? staticMatch?.tag ?? "Program",
      title: c.title,
      goal: c.shortDescription ?? c.description,
      format: c.duration ?? staticMatch?.format ?? "",
      trendingNow: c.status !== "PUBLISHED",
      price: c.price ? Number(c.price) : staticMatch?.price,
      discountPrice: c.discountPrice ? Number(c.discountPrice) : staticMatch?.discountPrice,
      gstText: staticMatch?.gstText ?? "+ 18% GST",
      badge: staticMatch?.badge,
    };
  });

  const staticCards = staticPrograms.map((p) => ({
    slug: p.slug,
    tag: p.tag,
    title: p.title,
    goal: p.goal,
    format: p.format,
    trendingNow: p.trendingNow,
    price: p.price ?? p.details?.price,
    discountPrice: p.discountPrice ?? p.details?.discountPrice,
    gstText: p.gstText ?? p.details?.gstText ?? "+ 18% GST",
    badge: p.badge ?? p.details?.badge,
  }));

  let programList = dbCards.length >= 5 ? dbCards : staticCards;



  // Remove duplicates based on title (handles different slugs in DB)
  programList = programList.filter((c, index, self) => 
    self.findIndex(v => v.title === c.title) === index
  );

  // Reorder (Full Stack at 3rd place)
  const order = [
    "pg-executive-agentic-ai-generative-ai",
    "cybersecurity-ceh-v13",
    "the-apex-ai-programme",
    "cloud-computing-devops",
    "business-analyst-ai-program",
  ];
  programList.sort((a, b) => {
    let ia = order.indexOf(a.slug);
    let ib = order.indexOf(b.slug);
    if (ia === -1) ia = 999;
    if (ib === -1) ib = 999;
    return ia - ib;
  });

  return {
    hero: dbOffline ? (staticHero as unknown as HeroData) : (cfg("HERO") as unknown as HeroData) ?? {},
    partners: sections.has("TRUSTED_COMPANIES") 
      ? (cfg("TRUSTED_COMPANIES") as unknown as PartnersData) 
      : (dbOffline ? staticPartners : null),
    whyCards: dbOffline ? staticWhyCards : (cfg("WHY_CHOOSE_US").cards as WhyCard[]) ?? [],
    programs: programList,
    journey: dbOffline ? staticJourney : (cfg("LEARNING_PROCESS").steps as JourneyStep[]) ?? [],
    guarantee: dbOffline ? staticGuarantee : (cfg("GUARANTEE").steps as GuaranteeStep[]) ?? [],
    stats: dbOffline ? staticStats : (cfg("STATISTICS").items as StatItem[]) ?? [],
    outcomes: dbOffline ? staticOutcomes : (cfg("ALUMNI_OUTCOMES").items as AlumniOutcome[]) ?? [],
    mentors: dbOffline && instructors.length === 0 
      ? staticMentors 
      : instructors.map((i) => ({
          name: i.name,
          title: i.designation,
          bio: i.bio,
          image: i.profileImage ?? "",
          specialization: i.designation,
          techStack: i.skills,
          experience: i.experience ?? "",
        })),
    community: sections.has("COMMUNITY") ? (cfg("COMMUNITY") as unknown as CommunityData) : (dbOffline ? staticCommunity : null),
    faqs: dbOffline && faqRows.length === 0 ? staticFaqs : faqRows.map((f) => ({ q: f.question, a: f.answer })),
    brochure: dbOffline ? staticBrochure : {
      heading: (cfg("FOOTER_CTA").heading as string) ?? "",
      body: (cfg("FOOTER_CTA").body as string) ?? "",
      button: (cfg("FOOTER_CTA").buttonLabel as string) ?? "Download Brochure",
    },
    sectionEnabled: {
      TRUSTED_COMPANIES: enabled("TRUSTED_COMPANIES"),
      WHY_CHOOSE_US: enabled("WHY_CHOOSE_US"),
      POPULAR_COURSES: enabled("POPULAR_COURSES"),
      LEARNING_PROCESS: enabled("LEARNING_PROCESS"),
      GUARANTEE: enabled("GUARANTEE"),
      STATISTICS: enabled("STATISTICS"),
      ALUMNI_OUTCOMES: enabled("ALUMNI_OUTCOMES"),
      TRAINERS: enabled("TRAINERS"),
      COMMUNITY: enabled("COMMUNITY"),
      FAQ_PREVIEW: enabled("FAQ_PREVIEW"),
      FOOTER_CTA: enabled("FOOTER_CTA"),
    },
  };
}
