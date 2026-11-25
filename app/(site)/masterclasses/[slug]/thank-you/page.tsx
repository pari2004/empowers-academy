import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { siteName } from "@/lib/seo";
import { getMasterclassBySlug } from "@/lib/services/masterclassService";
import { getNavData, getFooterData } from "@/lib/cms/siteChrome";
import { nav as navFallback, footer as footerFallback, contactBar as contactBarFallback } from "@/lib/content";
import { formatMasterclassDate, formatMasterclassTime, googleCalendarUrl } from "@/lib/masterclassFormat";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { Icon, IconGradientDefs } from "@/components/Icons";
import type { NavData } from "@/components/Nav";
import type { FooterData, ContactBarData } from "@/components/Footer";

type Params = { slug: string };

export const revalidate = 60;

export function generateMetadata(): Metadata {
  return { title: `You're Registered! | ${siteName}`, robots: { index: false, follow: false } };
}

export default async function MasterclassThankYouPage(props: { params: Promise<Params> }) {
  const params = await props.params;
  let masterclass: Awaited<ReturnType<typeof getMasterclassBySlug>> = null;
  try {
    masterclass = await getMasterclassBySlug(params.slug);
  } catch (error) {
    console.error(`DB error in MasterclassThankYouPage for ${params.slug}:`, error);
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
    console.error("Failed to load nav/footer for masterclass thank-you page:", error);
  }

  const calendarUrl = googleCalendarUrl({
    title: masterclass.title,
    description: masterclass.description,
    location: masterclass.meetingLink ?? undefined,
    start: masterclass.scheduledAt,
    durationMinutes: masterclass.durationMinutes ?? undefined,
  });

  const formattedDate = formatMasterclassDate(masterclass.scheduledAt);
  const formattedTime = formatMasterclassTime(masterclass.scheduledAt);

  return (
    <>
      <IconGradientDefs />
      <Nav nav={nav} />
      <main className="article-page" style={{ background: "linear-gradient(180deg, rgba(15, 23, 42, 0.7) 0%, rgba(2, 6, 23, 1) 100%)", minHeight: "85vh" }}>
        <div className="container" style={{ paddingTop: "calc(var(--nav-h) + 32px)", paddingBottom: 64 }}>
          <div
            className="glass-panel"
            style={{
              padding: "clamp(28px, 5vw, 56px)",
              borderRadius: 24,
              maxWidth: 720,
              margin: "0 auto",
              textAlign: "center",
              border: "1px solid rgba(129, 140, 248, 0.3)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
              background: "rgba(15, 23, 42, 0.85)",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Animated Confirmation Badge */}
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(16, 185, 129, 0.4)" }}>
              <Icon name="check" size={38} />
            </div>

            <span style={{ color: "#34d399", fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Registration Confirmed
            </span>

            <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 2.7rem)", fontWeight: 900, marginTop: 6, marginBottom: 12, color: "#fff", lineHeight: 1.2 }}>
              You&apos;re Officially Reserved! 🎉
            </h1>

            <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", maxWidth: 560, margin: "0 auto 32px" }}>
              We&apos;ve reserved your seat for <strong style={{ color: "#fff" }}>{masterclass.title}</strong>. A calendar invite &amp; confirmation email are on their way to your inbox.
            </p>

            {/* Event Summary Box */}
            <div style={{ padding: "20px 24px", borderRadius: 16, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", marginBottom: 32, textAlign: "left" }}>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#a5b4fc", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 12 }}>
                Event Details Overview
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Date &amp; Time:</span>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", marginTop: 2 }}>
                    📅 {formattedDate} · {formattedTime}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Access Pass:</span>
                  <div style={{ fontWeight: 700, color: "#34d399", fontSize: "0.95rem", marginTop: 2 }}>
                    🎟️ Guaranteed VIP Free Spot
                  </div>
                </div>
                {masterclass.instructor && (
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Hosted By:</span>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", marginTop: 2 }}>
                      🎙️ {masterclass.instructor.name}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 440, margin: "0 auto 32px" }}>
              {masterclass.meetingLink && (
                <a
                  href={masterclass.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ padding: "14px 24px", fontSize: "1rem", fontWeight: 700, justifyContent: "center" }}
                >
                  🚀 Direct Google Meet Room Link
                </a>
              )}

              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-glass"
                style={{ padding: "14px 24px", fontSize: "0.95rem", fontWeight: 700, justifyContent: "center", border: "1px solid rgba(255, 255, 255, 0.15)" }}
              >
                📅 Add to Google Calendar
              </a>
            </div>

            {/* Next Steps & Reminders */}
            <div style={{ paddingTop: 24, borderTop: "1px solid rgba(255, 255, 255, 0.08)", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              <p style={{ margin: "0 0 12px 0" }}>
                💡 <strong>Pro Tip:</strong> Add <strong>support@empowersacademy.com</strong> to your safe senders list so you don&apos;t miss live Q&amp;A reminders.
              </p>
              <Link href="/masterclasses" style={{ color: "#818cf8", fontWeight: 600 }}>
                ← Browse Other Live Masterclasses
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer footer={footer} contactBar={contactBar} />
      <ChatWidget phone={contactBar.phone} whatsapp={contactBar.whatsapp} />
    </>
  );
}

