import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { siteUrl, siteName } from "@/lib/seo";
import { getPublishedAboutPage } from "@/lib/services/aboutPageService";
import { getTestimonialsByIds } from "@/lib/services/testimonialService";
import { getSeoMeta } from "@/lib/services/seoService";
import { getNavData, getFooterData } from "@/lib/cms/siteChrome";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import RequestCallbackModal from "@/components/RequestCallbackModal";
import EligibilityQuiz from "@/components/EligibilityQuiz";
import { IconGradientDefs } from "@/components/Icons";
import VideoEmbed from "@/components/VideoEmbed";
import AboutHeroVisual from "@/components/AboutHeroVisual";
import TeamMemberCard from "@/components/TeamMemberCard";

export const revalidate = 60;

type CoreValue = { title: string; description?: string };
type WhyCard = { icon?: string; title: string; body?: string };
type TeamMember = { name: string; designation?: string; photo?: string; bio?: string };
type Partner = { name: string; logo?: string };
type Achievement = { title: string; description?: string; year?: string };
type TimelineItem = { year: string; title: string; description?: string };

const defaultAboutPage = {
  heroTitle: "Building AI Talent. Transforming Futures.",
  heroSubtitle: "Empowering Learners. Enabling Enterprises.",
  heroCtaLabel: "Explore Programs",
  heroCtaHref: "/#programs",
  statStudents: "5000+",
  statCourses: "5+",
  statTrainers: "15+",
  statPlacements: "95%",
  aboutDescription:
    "Empowers Academy is an employability-first AI upskilling platform dedicated to transforming professionals, non-tech career switchers, and ambitious learners into industry-ready AI and software engineering leaders.",
  vision: "To be the leading academy bridging the global AI skill gap with hands-on, production-grade engineering education.",
  mission: "To empower every learner with practical, mentor-led AI and tech skills backed by real career outcomes and transparent guarantees.",
  coreValues: [
    { title: "Industry-First Learning", description: "Curriculum designed around live production tools, frameworks, and market shifts." },
    { title: "Mentor-Led Growth", description: "Small cohort sizes with direct 1-on-1 guidance from active industry experts." },
    { title: "Career Accountability", description: "Backed by legal guarantee commitments and comprehensive career launch support." },
  ],
  whyChooseUs: [
    { title: "180-Day Better-Offer Guarantee", body: "If you don't land a better offer within 180 days of starting, you get a full refund backed by a signed legal agreement." },
    { title: "Curriculum That Moves With Market", body: "Revised continuously to track real shifts in AI, LLMs, Cloud, and Agentic engineering." },
    { title: "Built for Real Professionals", body: "Open to experienced professionals, non-tech backgrounds, and freshers alike." },
  ],
  founderName: "Yashwanth DV",
  founderDesignation: "Founder & CEO",
  founderPhoto: "/mentors/yashwanth.jpg?v=2026",
  founderMessage:
    "Welcome to Empowers Academy. Our mission is to make quality, industry-relevant education accessible to every learner. We believe that true learning comes from practical experience, expert mentorship, and continuous growth. Every program we offer is designed to equip you with real-world skills, confidence, and career opportunities. Whether you're a student, a working professional, or someone looking to start a new journey, we're committed to helping you achieve your goals. Thank you for trusting us to be part of your learning journey. Together, let's build a brighter future.",
  team: [
    {
      name: "Abhishek C",
      designation: "Co-Founder",
      photo: "/mentors/abhishek.png?v=2026",
      bio: "Abhishek is the Co-Founder of Empowers Academy, driving the organization's vision, strategic initiatives, and learner-centric programs. He is passionate about building accessible, industry-relevant education that empowers students and professionals to achieve career success through practical learning and mentorship.",
    },
    {
      name: "Sudeshna Dawn",
      designation: "Human Resources (HR)",
      photo: "/api/media/uploads/1785245569459-sudeshna.jpeg",
      bio: "Sudeshna Dawn leads the Human Resources function at Empowers Academy, fostering a positive workplace culture and driving talent acquisition, professional growth, and organizational excellence across the academy.",
    },
  ],
  partners: [],
  achievements: [],
  timeline: [],
  gallery: [],
  videoUrl: null as string | null,
  heroBackground: null as string | null,
  ctaTitle: null as string | null,
  ctaLabel: null as string | null,
  ctaHref: null as string | null,
  testimonialIds: [],
};

export async function generateMetadata(): Promise<Metadata> {
  let page: Awaited<ReturnType<typeof getPublishedAboutPage>> = null;
  let seo: Awaited<ReturnType<typeof getSeoMeta>> = null;

  try {
    const res = await Promise.all([getPublishedAboutPage(), getSeoMeta("aboutPage", "singleton")]);
    page = res[0];
    seo = res[1];
  } catch (error) {
    console.error("DB error in about page generateMetadata:", error);
  }

  const p = page ?? defaultAboutPage;
  const description = seo?.metaDescription ?? p.aboutDescription ?? undefined;

  return {
    title: seo?.metaTitle ?? "About Us",
    description,
    alternates: { canonical: "/about" },
    openGraph: {
      type: "website",
      url: `${siteUrl}/about`,
      siteName,
      title: `${seo?.metaTitle ?? "About Us"} | ${siteName}`,
      description,
    },
  };
}

export default async function AboutPagePublic() {
  let dbPage: Awaited<ReturnType<typeof getPublishedAboutPage>> = null;
  try {
    dbPage = await getPublishedAboutPage();
  } catch (error) {
    console.error("DB error in AboutPagePublic:", error);
  }

  const page = dbPage ?? defaultAboutPage;

  const nav = await getNavData();
  const { footer, contactBar } = await getFooterData();
  let testimonials: Awaited<ReturnType<typeof getTestimonialsByIds>> = [];

  try {
    if (page.testimonialIds?.length) {
      testimonials = await getTestimonialsByIds(page.testimonialIds);
    }
  } catch (error) {
    console.error("DB error fetching testimonials in AboutPagePublic:", error);
  }

  const coreValues = (page.coreValues as CoreValue[] | null) ?? [];
  const whyChooseUs = (page.whyChooseUs as WhyCard[] | null) ?? [];
  const team = (page.team as TeamMember[] | null) ?? [];
  const partners = (page.partners as Partner[] | null) ?? [];
  const partnersMid = Math.ceil(partners.length / 2);
  const partnersRowA = [...partners.slice(0, partnersMid), ...partners.slice(0, partnersMid)];
  const partnersRowB = [...partners.slice(partnersMid), ...partners.slice(partnersMid)];
  const achievements = (page.achievements as Achievement[] | null) ?? [];
  const timeline = (page.timeline as TimelineItem[] | null) ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${siteUrl}/about#page`,
        name: page.heroTitle ?? "About Us",
        description: page.aboutDescription ?? undefined,
        url: `${siteUrl}/about`,
        mainEntity: { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: siteName },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "About", item: `${siteUrl}/about` },
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
        {(page.heroTitle || page.heroSubtitle) && (
          <section
            className="brochure-cta about-hero"
            style={page.heroBackground ? { backgroundImage: `url("${page.heroBackground}")` } : undefined}
          >
            <div className="container about-hero-grid">
              <AboutHeroVisual />
              <div className="about-hero-copy">
                {page.heroTitle && <h1>{page.heroTitle}</h1>}
                {page.heroSubtitle && <p>{page.heroSubtitle}</p>}
                {page.heroCtaLabel && page.heroCtaHref && (
                  <Link className="btn btn-primary" href={page.heroCtaHref}>
                    {page.heroCtaLabel}
                  </Link>
                )}
                {(page.statStudents || page.statCourses || page.statTrainers || page.statPlacements) && (
                  <div className="program-detail-meta-row about-hero-stats">
                    {page.statStudents && <span>{page.statStudents} Students</span>}
                    {page.statCourses && <span>{page.statCourses} Courses</span>}
                    {page.statTrainers && <span>{page.statTrainers} Trainers</span>}
                    {page.statPlacements && <span>{page.statPlacements} Placements</span>}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">About</span>
          </nav>

          {page.aboutDescription && (
            <section className="program-detail-section">
              <h2>About Us</h2>
              <p>{page.aboutDescription}</p>
            </section>
          )}

          {(page.vision || page.mission) && (
            <section className="program-detail-section">
              <div className="resource-grid">
                {page.vision && (
                  <div className="resource-card glass-panel">
                    <h3>Vision</h3>
                    <p>{page.vision}</p>
                  </div>
                )}
                {page.mission && (
                  <div className="resource-card glass-panel">
                    <h3>Mission</h3>
                    <p>{page.mission}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {coreValues.length > 0 && (
            <section className="program-detail-section">
              <h2>Core Values</h2>
              <div className="resource-grid">
                {coreValues.map((v) => (
                  <div className="resource-card glass-panel" key={v.title}>
                    <h3>{v.title}</h3>
                    {v.description && <p>{v.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {(page.founderMessage || page.founderName || page.founderPhoto) && (
            <section className="program-detail-section">
              <h2>A Message From the Founder</h2>
              <TeamMemberCard
                name={page.founderName || "Yashwanth DV"}
                designation={page.founderDesignation || "Founder & CEO"}
                photo="/mentors/yashwanth.jpg?v=2026"
                bio={page.founderMessage || "Welcome to Empowers Academy. Our mission is to make quality, industry-relevant education accessible to every learner."}
              />
            </section>
          )}

          {whyChooseUs.length > 0 && (
            <section className="program-detail-section">
              <h2>Why Choose Us</h2>
              <div className="resource-grid">
                {whyChooseUs.map((c) => (
                  <div className="resource-card glass-panel" key={c.title}>
                    <h3>{c.title}</h3>
                    {c.body && <p>{c.body}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {team.length > 0 && (
            <section className="program-detail-section">
              <h2>Our Team</h2>
              <div>
                {team.map((m) => {
                  let photoUrl = m.photo;
                  const nameLower = m.name.toLowerCase();
                  if (nameLower.includes("sudeshna")) {
                    photoUrl = "/api/media/uploads/1785245569459-sudeshna.jpeg?v=2026";
                  } else if (nameLower.includes("abhishek")) {
                    photoUrl = "/mentors/abhishek.png?v=2026";
                  } else if (nameLower.includes("yashwanth")) {
                    photoUrl = "/mentors/yashwanth.jpg?v=2026";
                  }

                  return (
                    <TeamMemberCard
                      key={m.name}
                      name={m.name}
                      designation={m.designation}
                      photo={photoUrl}
                      bio={m.bio}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {partners.length > 0 && (
            <section className="program-detail-section">
              <h2>Our Partners</h2>
              <div className="glass-panel partners-panel reveal in">
                <div className="partners-logos">
                  <div className="logo-row">
                    <div className="logo-track">
                      {partnersRowA.map((p, i) => (
                        <div className="logo-item" key={`a-${p.name}-${i}`}>
                          {p.logo ? (
                            <Image
                              src={p.logo}
                              alt={p.name}
                              width={220}
                              height={44}
                              className="logo-svg"
                              unoptimized
                              loading="eager"
                            />
                          ) : (
                            <span className="chip">{p.name}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {partnersRowB.length > 0 && (
                    <div className="logo-row logo-row-rev">
                      <div className="logo-track">
                        {partnersRowB.map((p, i) => (
                          <div className="logo-item" key={`b-${p.name}-${i}`}>
                            {p.logo ? (
                              <Image
                                src={p.logo}
                                alt={p.name}
                                width={220}
                                height={44}
                                className="logo-svg"
                                unoptimized
                                loading="eager"
                              />
                            ) : (
                              <span className="chip">{p.name}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {achievements.length > 0 && (
            <section className="program-detail-section">
              <h2>Achievements</h2>
              <ul className="program-detail-list">
                {achievements.map((a) => (
                  <li key={a.title}>
                    <span>{a.year ? `${a.year} — ` : ""}{a.title}{a.description ? `: ${a.description}` : ""}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {timeline.length > 0 && (
            <section className="program-detail-section">
              <h2>Our Journey</h2>
              <div className="program-detail-path">
                {timeline.map((t) => (
                  <span className="program-detail-path-step" key={`${t.year}-${t.title}`}>
                    {[t.year, t.title].filter(Boolean).join(" — ")}
                  </span>
                ))}
              </div>
            </section>
          )}

          {page.gallery.length > 0 && (
            <section className="program-detail-section">
              <h2>Gallery</h2>
              <div className="resource-grid">
                {page.gallery.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="About Empowers Academy gallery image" style={{ width: "100%", borderRadius: 12 }} />
                ))}
              </div>
            </section>
          )}

          {page.videoUrl && (
            <section className="program-detail-section">
              <h2>Video</h2>
              <VideoEmbed url={page.videoUrl} />
            </section>
          )}

          {testimonials.length > 0 && (
            <section className="program-detail-section">
              <h2>What Our Students Say</h2>
              <div className="resource-grid">
                {testimonials.map((t) => (
                  <div className="resource-card glass-panel" key={t.id}>
                    <p>&ldquo;{t.review}&rdquo;</p>
                    <p><strong>{t.studentName}</strong>{t.company ? ` — ${t.company}` : ""}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(page.ctaTitle || page.ctaLabel) && (
            <section className="program-detail-section">
              <div className="glass-panel brochure-panel">
                <div className="brochure-text">
                  {page.ctaTitle && <h2>{page.ctaTitle}</h2>}
                </div>
                {page.ctaLabel && page.ctaHref && (
                  <Link className="btn btn-primary btn-lg" href={page.ctaHref}>
                    {page.ctaLabel}
                  </Link>
                )}
              </div>
            </section>
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
