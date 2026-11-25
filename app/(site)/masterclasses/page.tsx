import type { Metadata } from "next";
import Link from "next/link";

import { siteUrl, siteName } from "@/lib/seo";
import { getUpcomingMasterclasses } from "@/lib/services/masterclassService";
import { getNavData, getFooterData } from "@/lib/cms/siteChrome";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import RequestCallbackModal from "@/components/RequestCallbackModal";
import EligibilityQuiz from "@/components/EligibilityQuiz";
import { IconGradientDefs } from "@/components/Icons";
import MasterclassesList from "@/components/MasterclassesList";

export const revalidate = 60;

const description = "Free live masterclasses from Empowers Academy mentors — reserve a seat, no obligation.";

export function generateMetadata(): Metadata {
  return {
    title: "Masterclasses",
    description,
    alternates: { canonical: `${siteUrl}/masterclasses` },
    openGraph: { type: "website", url: `${siteUrl}/masterclasses`, siteName, title: "Masterclasses", description },
  };
}

export default async function MasterclassesPage() {
  const [nav, { footer, contactBar }, masterclasses] = await Promise.all([
    getNavData(),
    getFooterData(),
    getUpcomingMasterclasses().catch((err) => {
      console.error("DB error in getUpcomingMasterclasses:", err);
      return [];
    }),
  ]);

  return (
    <>
      <IconGradientDefs />
      <Nav nav={nav} />
      <main className="article-page" style={{ background: "linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(2, 6, 23, 1) 100%)" }}>
        <div className="container" style={{ paddingTop: "calc(var(--nav-h) + 24px)", paddingBottom: 64 }}>
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Masterclasses</span>
          </nav>

          <div className="section-head" style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 48px auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 100, background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(129, 140, 248, 0.3)", color: "#a5b4fc", fontSize: "0.85rem", fontWeight: 700, marginBottom: 16 }}>
              ⚡ LIVE &amp; INTERACTIVE MINI-SUMMITS
            </div>
            <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)", fontWeight: 900, lineHeight: 1.15, color: "#fff" }}>
              Empowers Academy Masterclasses
            </h1>
            <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", marginTop: 12 }}>
              Free live sessions with industry leaders, practical engineering deep-dives, and hands-on career growth strategies. Reserve your seat with no obligation.
            </p>
          </div>

          <MasterclassesList masterclasses={masterclasses} />

          {!masterclasses.length && (
            <div className="glass-panel" style={{ textAlign: "center", padding: 48, borderRadius: 16, marginTop: 24 }}>
              <h3 style={{ color: "#fff", marginBottom: 8 }}>No Live Masterclasses Scheduled Right Now</h3>
              <p style={{ color: "var(--text-secondary)" }}>We add new upcoming sessions every week. Check back soon or request a custom topic!</p>
            </div>
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
