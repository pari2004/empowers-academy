// Server component: the full body of a program page. Everything here renders
// into the initial HTML so search engines actually index it — this content
// used to live only inside a click-to-open client overlay, invisible to
// crawlers. The interactive CTAs are split into ProgramCtas (client).

import Image from "next/image";
import type { Program } from "@/lib/content";
import type { getPublishedBrochures } from "@/lib/services/brochureService";
import type { getFeaturedTestimonials } from "@/lib/services/testimonialService";
import { Icon } from "./Icons";
import ProgramCtas from "./ProgramCtas";
import Mentors, { type MentorData } from "./Mentors";
import Faq from "./Faq";
import VideoEmbed from "./VideoEmbed";
import CurriculumExplorer from "./CurriculumExplorer";
import StarRating from "./StarRating";
import EmiCalculator from "./EmiCalculator";
import CohortCountdown from "./CohortCountdown";
import ProgramCohorts from "./ProgramCohorts";
import ProgramOutcomesSnapshot from "./ProgramOutcomesSnapshot";
import TechLogo from "./TechLogo";
import ProjectsCarousel from "./ProjectsCarousel";
import { resolveProgramBrochureUrl } from "@/lib/brochureUtils";
import type { AlumniOutcome } from "./Alumni";

type BrochureInfo = Awaited<ReturnType<typeof getPublishedBrochures>>[number];
type TestimonialInfo = Awaited<ReturnType<typeof getFeaturedTestimonials>>[number];
export type NextBatchInfo = {
  startDate: string;
  endDate?: string | Date | null;
  timing?: string | null;
  seatsLeft: number | null;
  capacity: number | null;
};

function parseBullets(items: string[]): string[] {
  return items.flatMap((item) =>
    item
      .split("•")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

export default function ProgramContent({
  program,
  brochure,
  testimonials = [],
  nextBatch,
  alumniOutcomes = [],
}: {
  program: Program;
  brochure?: BrochureInfo;
  testimonials?: TestimonialInfo[];
  nextBatch?: NextBatchInfo | null;
  alumniOutcomes?: AlumniOutcome[];
}) {
  const d = program.details;
  const price = d?.price ?? program.price;
  const discountPrice = d?.discountPrice ?? program.discountPrice;
  const gstText = d?.gstText ?? program.gstText ?? "+ 18% GST";
  const badge = d?.badge ?? program.badge;
  const hasFee = !!(price || discountPrice);
  const hasEmiOrScholarship = !!(d?.emiAvailable || d?.emiDetails || d?.scholarshipInfo);

  // Override any perfect 5.0 ratings to realistic values between 4.0 and 4.8
  const adjustedTestimonials = testimonials.map((t) => {
    if (t.rating === 5) {
      const randomRating = 4.0 + ((t.studentName.length * 7) % 9) / 10;
      return { ...t, rating: randomRating };
    }
    return t;
  });

  const trainerCards: MentorData[] =
    d?.trainers?.map((t) => ({
      name: t.name,
      title: t.designation,
      bio: t.bio,
      image: t.image ?? "",
      specialization: t.designation,
      techStack: t.skills,
      experience: t.experience ?? "",
    })) ?? [];

  // Collect unified list of tools for the tools grid matching upGrad design
  const allTools: { name: string; iconSlug?: string }[] = [];
  const toolsMap = new Map<string, { name: string; iconSlug?: string }>();

  if (d?.toolCategorized && d.toolCategorized.length > 0) {
    for (const cat of d.toolCategorized) {
      for (const t of cat.tools) {
        const key = t.name.toLowerCase().trim();
        if (!toolsMap.has(key)) {
          toolsMap.set(key, { ...t });
        }
      }
    }
  }

  if (d?.tools && d.tools.length > 0) {
    for (const toolName of d.tools) {
      const key = toolName.toLowerCase().trim();
      if (!toolsMap.has(key)) {
        toolsMap.set(key, { name: toolName });
      }
    }
  }

  toolsMap.forEach((val) => allTools.push(val));

  const projectsData =
    d?.projectsList && d.projectsList.length > 0
      ? d.projectsList
      : d?.projectCategories?.map((p) => ({
          title: p.replace(/^\d+\.\s*/, ""),
          description: `Production capstone project covering hands-on enterprise deployment, architecture, and real-world testing.`,
        })) ?? [];

  return (
    <article className="program-page-inner">
      <header className="program-detail-hero">
        <div
          className={`program-detail-media${program.image ? " program-detail-media--image" : ""}`}
          aria-hidden="true"
        >
          {program.image && (
            <Image
              src={program.image}
              alt={program.title}
              fill
              sizes="(min-width: 1280px) 1240px, 100vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
              priority
            />
          )}
        </div>
        <div className="program-detail-hero-body">
          <div className="program-detail-tags">
            <span className="program-tag">{program.tag}</span>
            {d?.category && d.category.toLowerCase().trim() !== program.tag.toLowerCase().trim() && (
              <span className="chip">{d.category}</span>
            )}
            {program.trendingNow && <span className="soon-chip">Trending Now</span>}
          </div>

          <h1>{program.title}</h1>
          {d?.tagline && d.tagline.toLowerCase().trim() !== program.tag.toLowerCase().trim() && (
            <p className="program-detail-tagline">{d.tagline}</p>
          )}
          <p className="program-detail-goal">{program.goal}</p>

          <div className="program-detail-meta-row">
            <span><Icon name="pulse" size={16} /> {program.format}</span>
            {program.eligibility && (
              <span><Icon name="check" size={16} /> {program.eligibility}</span>
            )}
            {program.mentors && (
              <span><Icon name="users" size={16} /> {program.mentors}</span>
            )}
          </div>

          <ProgramCtas
            applyCtaLabel={program.applyCtaLabel}
            applyCtaHref={program.applyCtaHref}
            brochureUrl={brochure?.fileUrl || resolveProgramBrochureUrl(program.slug, program.title)}
            brochureLabel={brochure?.downloadButtonText ?? "Download Brochure"}
          />

          {nextBatch && (
            <CohortCountdown
              startDate={nextBatch.startDate}
              seatsLeft={nextBatch.seatsLeft}
              capacity={nextBatch.capacity}
            />
          )}
        </div>
      </header>

      {hasFee && (
        <section className="program-detail-section">
          <h2>Course Fee</h2>
          <div className="resource-grid">
            <div className="resource-card glass-panel">
              {discountPrice && price && discountPrice < price ? (
                <>
                  <p className="program-detail-price-strike">{formatCurrency(price)}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                    <h3>{formatCurrency(discountPrice)}</h3>
                    <span className="fee-gst-badge">{gstText}</span>
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <h3>{formatCurrency((discountPrice || price) ?? 0)}</h3>
                  <span className="fee-gst-badge">{gstText}</span>
                </div>
              )}
              {badge && (
                <div style={{ marginBottom: "10px" }}>
                  <span className="badge-highlight-chip">⭐ {badge}</span>
                </div>
              )}
              <p>Total program fee (exclusive of GST)</p>
            </div>
          </div>
        </section>
      )}

      {hasEmiOrScholarship && (
        <section className="program-detail-section">
          <h2>EMI &amp; Scholarship</h2>
          <div className="resource-grid">
            {(d?.emiAvailable || d?.emiDetails) && (
              <div className="resource-card glass-panel">
                <h3>EMI Available</h3>
                <p>{d?.emiDetails || "Flexible EMI plans are available for this program."}</p>
              </div>
            )}
            {d?.scholarshipInfo && (
              <div className="resource-card glass-panel">
                <h3>Scholarship</h3>
                <p>{d.scholarshipInfo}</p>
              </div>
            )}
          </div>
          {(d?.emiAvailable || d?.emiDetails) && hasFee && (
            <EmiCalculator amount={(discountPrice || price) ?? 0} />
          )}
        </section>
      )}

      {d?.overview && (
        <section className="program-detail-section">
          <h2>Program Overview</h2>
          <p>{d.overview}</p>
        </section>
      )}

      {d?.unfairAdvantage && (
        <section className="program-detail-section unfair-advantage-section">
          <div className="section-header-flex">
            <h2>{d.unfairAdvantage.headline}</h2>
            <span className="badge-highlight-chip">⚡ The Unfair Advantage</span>
          </div>
          {d.unfairAdvantage.subheadline && (
            <p className="unfair-advantage-subheadline">{d.unfairAdvantage.subheadline}</p>
          )}
          <div className="unfair-advantage-grid">
            {d.unfairAdvantage.items.map((item, idx) => (
              <div key={item.title} className="advantage-card glass-panel">
                <div className="advantage-card-header">
                  <span className="advantage-index">0{idx + 1}</span>
                  {item.badge && <span className="advantage-pill">{item.badge}</span>}
                </div>
                <h3 className="advantage-title">{item.title}</h3>
                <p className="advantage-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!!d?.curriculum?.length ? (
        <section className="program-detail-section">
          <h2>Curriculum</h2>
          <CurriculumExplorer sections={d.curriculum} />
        </section>
      ) : (
        !!d?.learningPath?.length && (
          <section className="program-detail-section">
            <h2>Curriculum</h2>
            <CurriculumExplorer sections={d.learningPath.map((step) => ({ title: step, lessons: [] }))} />
          </section>
        )
      )}

      {program.certificate && (
        <section className="program-detail-section">
          <h2>Earn a Certificate of Completion</h2>
          <p style={{ marginBottom: "1.5rem", color: "var(--text-dim)" }}>
            Validate your skills and enhance your profile with an industry-recognized certificate upon successfully completing this program.
          </p>
          <div style={{ position: "relative", width: "100%", maxWidth: 800, aspectRatio: "1.333", margin: "0 auto", border: "1px solid var(--glass-border)", borderRadius: 8, overflow: "hidden", background: "var(--glass-bg)" }}>
            <Image
              src={program.certificate}
              alt={`${program.title} Certificate`}
              fill
              sizes="(max-width: 800px) 100vw, 800px"
              style={{
                objectFit: "contain",
                pointerEvents: "none"
              }}
            />
            {/* Interaction blocker overlay */}
            <div style={{ position: "absolute", inset: 0, zIndex: 5, background: "transparent" }} />

            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 10
            }}>
              <span style={{
                color: "rgba(0, 0, 0, 0.08)",
                fontSize: "8rem",
                fontWeight: "900",
                textTransform: "uppercase",
                transform: "rotate(-30deg)",
                letterSpacing: "0.5rem",
              }}>
                SAMPLE
              </span>
            </div>
          </div>
        </section>
      )}

      {!!d?.keyFeatures?.length && (
        <section className="program-detail-section">
          <h2>Key Features</h2>
          <ul className="program-detail-list">
            {parseBullets(d.keyFeatures).map((f) => (
              <li key={f}><Icon name="check" size={16} /><span>{f}</span></li>
            ))}
          </ul>
        </section>
      )}

      {!!d?.learningOutcomes?.length && (
        <section className="program-detail-section">
          <h2>What You&apos;ll Be Able to Do</h2>
          <ul className="program-detail-list">
            {parseBullets(d.learningOutcomes).map((o) => (
              <li key={o}><Icon name="check" size={16} /><span>{o}</span></li>
            ))}
          </ul>
        </section>
      )}

      {!!d?.skills?.length && (
        <section className="program-detail-section">
          <div className="section-header-flex">
            <h2>Skills Covered</h2>
            <span className="skills-count-badge">
              <span className="skills-badge-dot" />
              {d.skills.length} In-Demand Skills
            </span>
          </div>
          <div className="program-stack program-stack--expanded">
            {d.skills.map((s) => (
              <span className="chip chip-skill" key={s}>
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {allTools.length > 0 && (
        <section className="program-detail-section tools-programme-section">
          <div className="tools-programme-card">
            <h3 className="tools-programme-heading">
              {allTools.length}+ Tools, One Programme
            </h3>
            <div className="tools-programme-grid">
              {allTools.map((tool) => (
                <div key={tool.name} className="tool-card-item">
                  <div className="tool-card-box">
                    <TechLogo name={tool.name} iconSlug={tool.iconSlug} size={36} />
                  </div>
                  <span className="tool-card-label">{tool.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {projectsData.length > 0 && (
        <section className="program-detail-section">
          <div className="section-header-flex">
            <h2>Industry Projects</h2>
          </div>
          <ProjectsCarousel projects={projectsData} />
        </section>
      )}

      {d?.capstone && (
        <section className="program-detail-section">
          <h2>Capstone</h2>
          <p>{d.capstone}</p>
        </section>
      )}

      {!!d?.certifications?.length && (
        <section className="program-detail-section">
          <h2>Certifications</h2>
          <ul className="program-detail-list">
            {d.certifications.map((c) => (
              <li key={c}><Icon name="shield" size={16} /><span>{c}</span></li>
            ))}
          </ul>
        </section>
      )}

      {!!d?.placementSupport?.length && (
        <section className="program-detail-section">
          <h2>Placement Support</h2>
          <ul className="program-detail-list">
            {d.placementSupport.map((p) => (
              <li key={p}><Icon name="check" size={16} /><span>{p}</span></li>
            ))}
          </ul>
        </section>
      )}

      <ProgramOutcomesSnapshot
        placementRate={d?.placementRate}
        avgSalaryHikePct={d?.avgSalaryHikePct}
        avgPackageLpa={d?.avgPackageLpa}
        alumni={alumniOutcomes}
      />

      {!!d?.careerMatrix?.length && (
        <section className="program-detail-section career-matrix-section">
          <div className="section-header-flex">
            <h2>High-Yield Career Engineering &amp; Role Matching</h2>
            <span className="badge-highlight-chip">100% Placement Commitment</span>
          </div>
          <p className="career-matrix-intro">
            We don&apos;t send your resume to generic job portals. We map your placement pipeline based on your exact career goals:
          </p>
          <div className="career-matrix-table-wrap glass-panel">
            <table className="career-matrix-table">
              <thead>
                <tr>
                  <th>Candidate Category</th>
                  <th>Placement Commitment</th>
                  <th>Career Track &amp; Routing</th>
                </tr>
              </thead>
              <tbody>
                {d.careerMatrix.map((row) => (
                  <tr key={row.category}>
                    <td className="matrix-category-cell">
                      <strong>{row.category}</strong>
                    </td>
                    <td className="matrix-commitment-cell">
                      <span className="matrix-commitment-tag">
                        <Icon name="shield" size={14} />
                        {row.commitment}
                      </span>
                    </td>
                    <td className="matrix-routing-cell">
                      {row.routing}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!!d?.marketRealignment?.length && (
        <section className="program-detail-section market-realignment-section">
          <div className="section-header-flex">
            <h2>The Market Realignment: What Big Tech Is Hiring For</h2>
            <span className="badge-highlight-chip">Hiring Shift</span>
          </div>
          <p className="market-realignment-intro">
            Mass fresher hiring is over. Today, global enterprises and scale-ups are selectively hiring <strong>Builders</strong>:
          </p>
          <div className="market-realignment-grid">
            {d.marketRealignment.map((item) => (
              <div key={item.title} className="market-realignment-card glass-panel">
                {item.stat && <div className="market-realignment-stat">{item.stat}</div>}
                <h3 className="market-realignment-title">{item.title}</h3>
                <p className="market-realignment-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!!d?.careerRoles?.length && (
        <section className="program-detail-section">
          <h2>Career Opportunities</h2>
          <div className="program-stack">
            {d.careerRoles.map((s) => <span className="chip" key={s}>{s}</span>)}
          </div>
        </section>
      )}

      {!!d?.additionalNotes?.length && (
        <section className="program-detail-section">
          <h2>Good to Know</h2>
          <ul className="program-detail-list">
            {d.additionalNotes.map((n) => (
              <li key={n}><Icon name="spark" size={16} /><span>{n}</span></li>
            ))}
          </ul>
        </section>
      )}

      {!!d?.galleryImages?.length && (
        <section className="program-detail-section">
          <h2>Gallery</h2>
          <div className="resource-grid">
            {d.galleryImages.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt={`${program.title} gallery image`} style={{ width: "100%", borderRadius: 12 }} />
            ))}
          </div>
        </section>
      )}

      {d?.videoUrl && (
        <section className="program-detail-section">
          <h2>Program Video</h2>
          <VideoEmbed url={d.videoUrl} />
        </section>
      )}

      {d?.curriculumHtmlUrl && (
        <section className="program-detail-section">
          {!d?.curriculum?.length && <h2>Curriculum</h2>}
          <p>Explore the full module-by-module breakdown of this program.</p>
          <a className="btn btn-primary" href={d.curriculumHtmlUrl} target="_blank" rel="noopener noreferrer">
            View Detailed Curriculum
          </a>
        </section>
      )}

      {/* Program Cohorts Section (Simplilearn style, EA dark luxury theme) */}
      <ProgramCohorts
        programTitle={program.title}
        format={program.format}
        nextBatch={nextBatch}
      />

      {!!trainerCards.length && (
        <section className="program-detail-section">
          <h2>Trainer Information</h2>
          <Mentors mentors={trainerCards} />
        </section>
      )}

      {!!adjustedTestimonials.length && (
        <section className="program-detail-section">
          <div className="program-detail-testimonials-head">
            <h2>What Our Students Say</h2>
            <div className="program-detail-rating-summary">
              <StarRating rating={4.9} size={16} />
              <a href="https://maps.app.goo.gl/MAcqVsJk1DBELgvA8" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
                <span>4.9 average from 17 reviews</span>
              </a>
            </div>
          </div>
          <div className="resource-grid">
            {adjustedTestimonials.map((t) => (
              <div className="resource-card glass-panel" key={t.id}>
                <StarRating rating={t.rating} />
                <p>&ldquo;{t.review}&rdquo;</p>
                <p><strong>{t.studentName}</strong>{t.company ? ` — ${t.company}` : ""}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!!d?.faqs?.length && <Faq faqs={d.faqs} />}

      {/* Programs without a full details doc still need real body copy on the
          page — fall back to the focus list so the route is never near-empty. */}
      {!d && !!program.focus?.length && (
        <section className="program-detail-section">
          <h2>What This Program Covers</h2>
          <ul className="program-detail-list">
            {parseBullets(program.focus).map((f) => (
              <li key={f}><Icon name="check" size={16} /><span>{f}</span></li>
            ))}
          </ul>
        </section>
      )}

      {!d && !!program.stack?.length && (
        <section className="program-detail-section">
          <h2>Skills &amp; Technologies</h2>
          <div className="program-stack">
            {program.stack.map((s) => <span className="chip" key={s}>{s}</span>)}
          </div>
        </section>
      )}

      <section className="program-detail-section">
        <h2>The 180-Day Better-Offer Guarantee</h2>
        <p>
          Every Empowers Academy program is backed by a signed legal agreement, executed
          before you pay anything. If you don&apos;t land an offer that beats your starting
          role in pay, title, or scope within 180 days, you get a full refund exactly as
          agreed in writing.
        </p>
      </section>
    </article>
  );
}
