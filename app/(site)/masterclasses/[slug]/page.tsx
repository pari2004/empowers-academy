import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { siteUrl, siteName } from "@/lib/seo";
import { getMasterclassBySlug } from "@/lib/services/masterclassService";
import { getNavData, getFooterData } from "@/lib/cms/siteChrome";
import { nav as navFallback, footer as footerFallback, contactBar as contactBarFallback } from "@/lib/content";
import { formatMasterclassDate, formatMasterclassTime } from "@/lib/masterclassFormat";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import RequestCallbackModal from "@/components/RequestCallbackModal";
import EligibilityQuiz from "@/components/EligibilityQuiz";
import MasterclassRegisterForm from "@/components/MasterclassRegisterForm";
import MasterclassCountdown from "@/components/MasterclassCountdown";
import { IconGradientDefs } from "@/components/Icons";
import type { NavData } from "@/components/Nav";
import type { FooterData, ContactBarData } from "@/components/Footer";

type Params = { slug: string };

export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const params = await props.params;
  let masterclass: Awaited<ReturnType<typeof getMasterclassBySlug>> = null;
  try {
    masterclass = await getMasterclassBySlug(params.slug);
  } catch (error) {
    console.error(`DB error in generateMetadata for masterclass ${params.slug}:`, error);
  }
  if (!masterclass) return {};

  const url = `${siteUrl}/masterclasses/${masterclass.slug}`;
  const title = masterclass.title;
  const description = masterclass.description;

  return {
    title: `${title} | Masterclass & Live Mini-Summit`,
    description,
    alternates: { canonical: `/masterclasses/${masterclass.slug}` },
    openGraph: {
      type: "website",
      url,
      siteName,
      title: `${title} | ${siteName}`,
      description,
      images: masterclass.coverImage ? [{ url: masterclass.coverImage }] : undefined,
    },
  };
}

export default async function MasterclassDetailPage(props: { params: Promise<Params> }) {
  const params = await props.params;
  let masterclass: Awaited<ReturnType<typeof getMasterclassBySlug>> = null;
  try {
    masterclass = await getMasterclassBySlug(params.slug);
  } catch (error) {
    console.error(`DB error in MasterclassDetailPage for ${params.slug}:`, error);
  }
  if (!masterclass) notFound();

  let nav: NavData = navFallback;
  let footer: FooterData = footerFallback;
  let contactBar: ContactBarData = contactBarFallback;
  try {
    const res = await Promise.all([getNavData(), getFooterData()]);
    nav = res[0];
    footer = res[1].footer;
    contactBar = res[1].contactBar;
  } catch (error) {
    console.error("Failed to load nav/footer for masterclass page:", error);
  }

  const url = `${siteUrl}/masterclasses/${masterclass.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: masterclass.title,
    description: masterclass.description,
    startDate: masterclass.scheduledAt.toISOString(),
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "VirtualLocation", url },
    organizer: { "@type": "Organization", name: siteName, url: siteUrl },
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR", availability: "https://schema.org/InStock", url },
  };

  const formattedDate = formatMasterclassDate(masterclass.scheduledAt);
  const formattedTime = formatMasterclassTime(masterclass.scheduledAt);

  return (
    <>
      <IconGradientDefs />
      <Nav nav={nav} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <main className="article-page" style={{ background: "linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(2, 6, 23, 1) 100%)" }}>
        <div className="container" style={{ paddingTop: "calc(var(--nav-h) + 48px)", paddingBottom: 64 }}>
          {/* Breadcrumb Navigation */}
          <nav className="crumbs" aria-label="Breadcrumb" style={{ marginBottom: 24 }}>
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/masterclasses">Masterclasses</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{masterclass.title}</span>
          </nav>

          {/* Main Hero Header Layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 36, alignItems: "start" }}>
            <div>
              {/* Top Live Badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 100, background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(129, 140, 248, 0.3)", color: "#a5b4fc", fontSize: "0.85rem", fontWeight: 700, marginBottom: 16 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 10px #6366f1" }}></span>
                VIRTUAL MINI-SUMMIT &amp; LIVE MASTERCLASS
              </div>

              {/* Title & Description */}
              <h1 style={{ fontSize: "clamp(2.1rem, 3.8vw, 3.2rem)", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#fff", marginBottom: 18 }}>
                {masterclass.title}
              </h1>
              
              <p style={{ fontSize: "1.15rem", lineHeight: 1.6, color: "var(--text-secondary)", marginBottom: 24 }}>
                {masterclass.description}
              </p>

              {/* Event Metadata Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 600 }}>Date</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: 4, color: "#fff" }}>📅 {formattedDate}</div>
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 600 }}>Time</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: 4, color: "#fff" }}>⏰ {formattedTime}</div>
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 600 }}>Format</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: 4, color: "#fff" }}>💻 Interactive Live Webinar</div>
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: 600 }}>Access Fee</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: 4, color: "#34d399" }}>🎉 100% Free</div>
                </div>
              </div>

              {/* Countdown Component */}
              <MasterclassCountdown targetDate={masterclass.scheduledAt} />

              {/* Cover Image / Video Graphic Banner */}
              {masterclass.coverImage && (
                <div style={{ marginTop: 28, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.1)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                  <Image src={masterclass.coverImage} alt={masterclass.title} width={0} height={0} sizes="100vw" style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
              )}

              {/* What You'll Learn / Key Takeaways Section */}
              <div className="glass-panel" style={{ padding: "clamp(24px, 4vw, 36px)", borderRadius: 16, marginTop: 36, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#818cf8" }}>✨</span> Key Takeaways &amp; What You&apos;ll Learn
                </h2>
                <ul style={{ display: "grid", gap: 14, listStyle: "none", padding: 0, margin: 0 }}>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: "1rem", lineHeight: 1.5 }}>
                    <span style={{ color: "#34d399", fontSize: "1.2rem", fontWeight: 900 }}>✓</span>
                    <span><strong>Actionable Industry Frameworks:</strong> Master battle-tested strategies and modern workflows used by top tech companies.</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: "1rem", lineHeight: 1.5 }}>
                    <span style={{ color: "#34d399", fontSize: "1.2rem", fontWeight: 900 }}>✓</span>
                    <span><strong>Live Project Breakdown:</strong> Step-by-step walkthrough of real-world implementation, code structures, and architecture design.</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: "1rem", lineHeight: 1.5 }}>
                    <span style={{ color: "#34d399", fontSize: "1.2rem", fontWeight: 900 }}>✓</span>
                    <span><strong>Interactive Q&amp;A &amp; Career Guidance:</strong> Live 1-on-1 interaction with senior engineering leaders &amp; hiring experts.</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: "1rem", lineHeight: 1.5 }}>
                    <span style={{ color: "#34d399", fontSize: "1.2rem", fontWeight: 900 }}>✓</span>
                    <span><strong>Exclusive Resource Bundle:</strong> Downloadable templates, cheat sheets, slide decks, and lifetime access to session recordings.</span>
                  </li>
                </ul>
              </div>

              {/* Event Agenda & Timeline Section */}
              <div className="glass-panel" style={{ padding: "clamp(24px, 4vw, 36px)", borderRadius: 16, marginTop: 28, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <span className="eyebrow" style={{ color: "#a5b4fc", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Structured Session Breakdown</span>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 4, marginBottom: 20, color: "#fff" }}>📋 Live Event Agenda</h3>
                
                <div style={{ display: "grid", gap: 16 }}>
                  <div style={{ padding: 16, borderRadius: 12, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", gap: 16, alignItems: "center" }}>
                    <span style={{ background: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", padding: "6px 12px", borderRadius: 8, fontWeight: 800, fontSize: "0.85rem", whiteSpace: "nowrap" }}>00 - 15 Mins</span>
                    <div>
                      <strong style={{ color: "#fff", display: "block", fontSize: "1rem" }}>Welcome &amp; Core Industry Trends</strong>
                      <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>Setting up the landscape, tools setup, and common pitfalls to avoid.</span>
                    </div>
                  </div>

                  <div style={{ padding: 16, borderRadius: 12, background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(129, 140, 248, 0.2)", display: "flex", gap: 16, alignItems: "center" }}>
                    <span style={{ background: "#6366f1", color: "#fff", padding: "6px 12px", borderRadius: 8, fontWeight: 800, fontSize: "0.85rem", whiteSpace: "nowrap" }}>15 - 45 Mins</span>
                    <div>
                      <strong style={{ color: "#fff", display: "block", fontSize: "1rem" }}>Deep-Dive Masterclass &amp; Live Demo</strong>
                      <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>Hands-on live demonstration, architecture walkthrough, and real code snippets.</span>
                    </div>
                  </div>

                  <div style={{ padding: 16, borderRadius: 12, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", gap: 16, alignItems: "center" }}>
                    <span style={{ background: "rgba(52, 211, 153, 0.2)", color: "#34d399", padding: "6px 12px", borderRadius: 8, fontWeight: 800, fontSize: "0.85rem", whiteSpace: "nowrap" }}>45 - 60 Mins</span>
                    <div>
                      <strong style={{ color: "#fff", display: "block", fontSize: "1rem" }}>Open Q&amp;A &amp; Career Roadmap</strong>
                      <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>Ask your questions directly to the speaker and discover salary growth strategies.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Skills Discussed Section */}
              <div className="glass-panel" style={{ padding: "clamp(24px, 4vw, 36px)", borderRadius: 16, marginTop: 28, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <span className="eyebrow" style={{ color: "#a5b4fc", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Industry Tools &amp; Stack</span>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 4, marginBottom: 20, color: "#fff" }}>🛠️ Technical Skills Discussed</h3>
                
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {[
                    "Python", "Machine Learning", "Deep Learning", "LLMs", "Prompting", "RAG",
                    "Vector Databases", "LangChain", "LangGraph", "AI Agents", "Multi-Agent Systems",
                    "APIs", "MLOps", "Git", "Docker", "Cloud"
                  ].map((skill) => (
                    <span key={skill} style={{ padding: "8px 16px", borderRadius: 100, background: "rgba(99, 102, 241, 0.12)", border: "1px solid rgba(129, 140, 248, 0.25)", color: "#c7d2fe", fontSize: "0.88rem", fontWeight: 600 }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects We'll Walk Through Section */}
              <div className="glass-panel" style={{ padding: "clamp(24px, 4vw, 36px)", borderRadius: 16, marginTop: 28, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <span className="eyebrow" style={{ color: "#a5b4fc", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Portfolio &amp; Demos</span>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 4, marginBottom: 20, color: "#fff" }}>💻 Projects We&apos;ll Walk Through</h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                  {[
                    { icon: "📄", name: "RAG Document Q&A System", desc: "Enterprise document search & query pipeline" },
                    { icon: "🤖", name: "AI Customer Support Agent", desc: "Autonomous agent handling tickets & FAQs" },
                    { icon: "🔬", name: "Multi-Agent Research System", desc: "Collaborative agent workflow automation" },
                    { icon: "💬", name: "Domain-Specific AI Chatbot", desc: "Tailored LLM model tuned for specific industries" },
                    { icon: "⚡", name: "Automated Workflow Agent", desc: "Task automation with function calling & APIs" },
                    { icon: "🎯", name: "End-to-End AI Capstone Project", desc: "Complete production deployment pipeline" }
                  ].map((proj) => (
                    <div key={proj.name} style={{ padding: 16, borderRadius: 12, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                      <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{proj.icon}</div>
                      <strong style={{ color: "#fff", display: "block", fontSize: "0.95rem", marginBottom: 2 }}>{proj.name}</strong>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{proj.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Who Should Attend Section */}
              <div className="glass-panel" style={{ padding: "clamp(24px, 4vw, 36px)", borderRadius: 16, marginTop: 28, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <span className="eyebrow" style={{ color: "#a5b4fc", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Target Profiles</span>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 4, marginBottom: 20, color: "#fff" }}>🎯 Who Should Attend This Masterclass?</h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <div style={{ padding: 18, borderRadius: 12, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>👨‍💻</div>
                    <strong style={{ color: "#fff", display: "block", marginBottom: 4 }}>Aspiring &amp; Junior Engineers</strong>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4, display: "block" }}>Looking to upgrade practical skills and learn production-grade tools.</span>
                  </div>

                  <div style={{ padding: 18, borderRadius: 12, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🚀</div>
                    <strong style={{ color: "#fff", display: "block", marginBottom: 4 }}>Career Switchers</strong>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4, display: "block" }}>Professionals seeking a structured roadmap to transition into high-paying tech roles.</span>
                  </div>

                  <div style={{ padding: 18, borderRadius: 12, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>📈</div>
                    <strong style={{ color: "#fff", display: "block", marginBottom: 4 }}>Mid-Level Professionals</strong>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4, display: "block" }}>Aiming for senior positions, higher salary offers, and leadership roles.</span>
                  </div>
                </div>
              </div>

              {/* Speaker / Host Spotlight Card */}
              {masterclass.instructor && (
                <div className="glass-panel" style={{ padding: "clamp(24px, 4vw, 36px)", borderRadius: 16, marginTop: 28, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                  <span className="eyebrow" style={{ color: "#a5b4fc", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Featured Speaker</span>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginTop: 4, marginBottom: 16 }}>Meet Your Masterclass Mentor</h3>
                  
                  <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                    {masterclass.instructor.profileImage ? (
                      <Image src={masterclass.instructor.profileImage} alt={masterclass.instructor.name} width={80} height={80} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid #818cf8" }} />
                    ) : (
                      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>
                        {masterclass.instructor.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>{masterclass.instructor.name}</h4>
                      {masterclass.instructor.designation && (
                        <p style={{ color: "#a5b4fc", fontWeight: 600, margin: "2px 0 6px 0", fontSize: "0.95rem" }}>{masterclass.instructor.designation}</p>
                      )}
                    </div>
                  </div>
                  {masterclass.instructor.bio && (
                    <p style={{ color: "var(--text-secondary)", marginTop: 14, lineHeight: 1.6, fontSize: "0.95rem" }}>{masterclass.instructor.bio}</p>
                  )}
                </div>
              )}

              {/* Attendee Perks & Certificate Banner */}
              <div className="glass-panel" style={{ padding: "clamp(24px, 4vw, 36px)", borderRadius: 16, marginTop: 28, background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)", border: "1px solid rgba(168, 85, 247, 0.3)" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 12, color: "#fff" }}>🏆 Verified Certificate of Participation Included</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                  All live attendees will receive an official verifiable digital certificate from Empowers Academy to share on LinkedIn and add to their professional resume.
                </p>
              </div>

              {/* Frequently Asked Questions */}
              <div className="glass-panel" style={{ padding: "clamp(24px, 4vw, 36px)", borderRadius: 16, marginTop: 28, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 20, color: "#fff" }}>❓ Frequently Asked Questions</h3>

                <div style={{ display: "grid", gap: 16 }}>
                  <div>
                    <strong style={{ color: "#fff", fontSize: "1rem", display: "block", marginBottom: 4 }}>Is this masterclass really 100% free?</strong>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0, lineHeight: 1.5 }}>
                      Yes, completely free! No credit card or hidden payment is required. Simply reserve your seat above.
                    </p>
                  </div>
                  <div style={{ paddingTop: 12, borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <strong style={{ color: "#fff", fontSize: "1rem", display: "block", marginBottom: 4 }}>Will a recording be provided if I cannot attend live?</strong>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0, lineHeight: 1.5 }}>
                      Yes! Registered participants will receive recording access via email, though we recommend attending live to participate in Q&amp;A.
                    </p>
                  </div>
                  <div style={{ paddingTop: 12, borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <strong style={{ color: "#fff", fontSize: "1rem", display: "block", marginBottom: 4 }}>How do I join the live session?</strong>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0, lineHeight: 1.5 }}>
                      Immediately after reserving your seat, you&apos;ll get access to the Google Meet room link and a 1-click Google Calendar reminder.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sticky Registration Form Card */}
            <div style={{ position: "sticky", top: "calc(var(--nav-h) + 24px)" }}>
              <div className="glass-panel" style={{ padding: "clamp(24px, 4vw, 36px)", borderRadius: 20, border: "1px solid rgba(129, 140, 248, 0.3)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)", background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(16px)" }}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <span style={{ background: "linear-gradient(90deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Free Registration
                  </span>
                  <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: 4, marginBottom: 6 }}>Reserve Your Spot Now</h2>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0 }}>Limited seats available. Claim your free access pass in 30 seconds.</p>
                </div>

                <MasterclassRegisterForm slug={masterclass.slug} title={masterclass.title} />

                {/* Additional Trust Indicators */}
                <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#34d399" }}>🎓</span> Certificate Included
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#38bdf8" }}>📹</span> Recording Sent
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#fbbf24" }}>💬</span> Live Q&amp;A Access
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#a855f7" }}>📄</span> Resource Cheatsheet
                  </div>
                </div>
              </div>
            </div>
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


