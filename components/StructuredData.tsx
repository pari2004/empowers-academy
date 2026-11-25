// Async server component that emits schema.org JSON-LD for rich search
// results: organization + local business, website, courses, mentors, FAQ,
// breadcrumbs. Sourced from the same live CMS data the visible pages render
// (getPublishedCourses/getFeaturedInstructors/listGlobalPublishedFaqs/
// getSiteSettings — the same services lib/cms/homepage.ts already uses) so
// the invisible markup search engines read never drifts from what's on the
// page.
//
// DELIBERATELY ABSENT: aggregateRating and review. Salary/outcome figures and
// alumni testimonials shown on the page are marketing copy, not verified
// review data. Emitting them as schema would be fabricated review markup — a
// documented cause of Google manual actions, and an ASCI advertising-code
// problem in India. Once those numbers are backed by verifiable data, add
// aggregateRating/review back here.

import { getPublishedCourses } from "@/lib/services/courseService";
import { getFeaturedInstructors } from "@/lib/services/instructorService";
import { listGlobalPublishedFaqs } from "@/lib/services/faqService";
import { getSiteSettings } from "@/lib/services/settingsService";
import { siteUrl, siteName, siteDescription, geo, alternateNames } from "@/lib/seo";

const orgId = `${siteUrl}/#organization`;
const websiteId = `${siteUrl}/#website`;
const webpageId = `${siteUrl}/#webpage`;

const absoluteImage = (src: string) => (src.startsWith("http") ? src : `${siteUrl}${src.startsWith("/") ? "" : "/"}${src}`);

export default async function StructuredData() {
  // JSON-LD is enhancement, not content — if the DB is unreachable, degrade to
  // the static parts of the graph instead of crashing every page that renders
  // this (it's included from the root layout, so that means the whole site).
  const [courses, instructors, faqs, settings] = await Promise.all([
    getPublishedCourses(),
    getFeaturedInstructors(),
    listGlobalPublishedFaqs(),
    getSiteSettings(),
  ]).catch(() => [[], [], [], null] as const);

  const companyInfo = settings?.companyInfo as { address?: string; phone?: string; email?: string } | null;
  const telephone = companyInfo?.phone || "+91 81518 76077";
  const email = companyInfo?.email || "contact@empowersacademy.com";

  const organization = {
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "@id": orgId,
    name: siteName,
    alternateName: alternateNames,
    url: siteUrl,
    logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
    image: `${siteUrl}/logo.png`,
    description: siteDescription,
    slogan: siteDescription,
    telephone,
    email,
    priceRange: "₹₹",
    parentOrganization: { "@type": "Organization", name: "Fortivex.AI Pvt Ltd" },
    address: {
      "@type": "PostalAddress",
      streetAddress: companyInfo?.address ?? "BMTC Complex, Old Madiwala, Kuvempu Nagar, Stage 2, BTM Layout",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      postalCode: "560068",
      addressCountry: "IN",
    },
    geo: { "@type": "GeoCoordinates", latitude: geo.lat, longitude: geo.lng },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "20:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "09:00", closes: "17:00" },
    ],
    contactPoint: [
      { "@type": "ContactPoint", telephone, email, contactType: "admissions", availableLanguage: ["English"], areaServed: "IN" },
    ],
    areaServed: { "@type": "Country", name: "India" },
    knowsAbout: [
      "Artificial Intelligence", "Machine Learning", "Deep Learning", "Generative AI", "Agentic AI",
      "Large Language Models", "Retrieval-Augmented Generation", "Prompt Engineering", "MLOps",
      "Python", "Career Transition Coaching",
    ],
    employee: instructors.map((i) => ({
      "@type": "Person",
      name: i.name,
      jobTitle: i.designation,
      description: i.bio,
      image: i.profileImage ? absoluteImage(i.profileImage) : undefined,
      knowsAbout: i.skills,
      worksFor: { "@id": orgId },
    })),
  };

  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: siteName,
    alternateName: alternateNames,
    description: siteDescription,
    publisher: { "@id": orgId },
    inLanguage: "en",
  };

  const webpage = {
    "@type": "WebPage",
    "@id": webpageId,
    url: siteUrl,
    name: siteName,
    isPartOf: { "@id": websiteId },
    about: { "@id": orgId },
    inLanguage: "en",
    primaryImageOfPage: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
  };

  // Each program is also its own indexable page at /programs/<slug>, which
  // carries its own richer Course node; this list gives the homepage a summary.
  const courseList = {
    "@type": "ItemList",
    name: "AI Programs at Empowers Academy",
    itemListElement: courses.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Course",
        name: c.title,
        description: c.shortDescription ?? c.description,
        provider: { "@id": orgId },
        url: `${siteUrl}/programs/${c.slug}`,
      },
    })),
  };

  // FAQ content is rendered visibly on the homepage — Google requires that.
  const faqPage = {
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const breadcrumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Programs", item: `${siteUrl}/#programs` },
      { "@type": "ListItem", position: 3, name: "The Guarantee", item: `${siteUrl}/#guarantee` },
      { "@type": "ListItem", position: 4, name: "Trainers", item: `${siteUrl}/#mentors` },
      { "@type": "ListItem", position: 5, name: "FAQ", item: `${siteUrl}/#faq` },
      { "@type": "ListItem", position: 6, name: "Resources", item: `${siteUrl}/resources` },
    ],
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [organization, website, webpage, courseList, faqPage, breadcrumbs],
  };

  return (
    <script
      type="application/ld+json"
      // JSON-LD must be raw JSON inside the script tag; escape "<" to keep
      // any future content strings from breaking out of the tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
