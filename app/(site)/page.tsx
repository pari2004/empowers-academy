import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import WhyEmpowers from "@/components/WhyEmpowers";
import Programs from "@/components/Programs";
import Journey from "@/components/Journey";
import Guarantee from "@/components/Guarantee";
import Outcomes from "@/components/Outcomes";
import Alumni from "@/components/Alumni";
import Mentors from "@/components/Mentors";
import SampleCertification from "@/components/SampleCertification";
import Community from "@/components/Community";
import Faq from "@/components/Faq";
import BrochureCTA from "@/components/BrochureCTA";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import RequestCallbackModal from "@/components/RequestCallbackModal";
import EligibilityQuiz from "@/components/EligibilityQuiz";
import AuthModal from "@/components/AuthModal";
import RevealController from "@/components/RevealController";
import { IconGradientDefs } from "@/components/Icons";
import { getHomepageData } from "@/lib/cms/homepage";
import { getNavData, getFooterData } from "@/lib/cms/siteChrome";
import { getSeoOverride } from "@/lib/seoOverride";
import { siteUrl, siteName, siteTitle, siteDescription, keywords } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoOverride("static", "home");
  const title = seo.title ?? siteTitle;
  const description = seo.description ?? siteDescription;

  return {
    title,
    description,
    keywords: seo.keywords ?? keywords,
    alternates: { canonical: seo.canonicalUrl ?? "/" },
    robots: seo.robots,
    openGraph: {
      type: "website",
      url: siteUrl,
      siteName,
      title,
      description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
    twitter: {
      card: (seo.twitterCard as "summary" | "summary_large_image" | undefined) ?? "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Home() {
  const [homepage, nav, { footer, contactBar }] = await Promise.all([
    getHomepageData(),
    getNavData(),
    getFooterData(),
  ]);
  const { sectionEnabled } = homepage;

  return (
    <>
      <IconGradientDefs />
      <RevealController />
      <Nav nav={nav} />
      <main>
        <Hero hero={homepage.hero} />
        {sectionEnabled.TRUSTED_COMPANIES && homepage.partners && <Partners partners={homepage.partners} />}
        {sectionEnabled.WHY_CHOOSE_US && <WhyEmpowers whyCards={homepage.whyCards} />}
        {sectionEnabled.POPULAR_COURSES && <Programs programs={homepage.programs} />}
        {sectionEnabled.LEARNING_PROCESS && <Journey journey={homepage.journey} />}
        {sectionEnabled.GUARANTEE && <Guarantee guarantee={homepage.guarantee} />}
        {sectionEnabled.STATISTICS && <Outcomes stats={homepage.stats} />}
        {sectionEnabled.ALUMNI_OUTCOMES && <Alumni outcomes={homepage.outcomes} />}
        {sectionEnabled.TRAINERS && <Mentors mentors={homepage.mentors} />}
        <SampleCertification />
        {sectionEnabled.COMMUNITY && homepage.community && <Community community={homepage.community} />}
        {sectionEnabled.FAQ_PREVIEW && <Faq faqs={homepage.faqs} />}
        {sectionEnabled.FOOTER_CTA && (
          <BrochureCTA brochure={homepage.brochure} whatsapp={contactBar.whatsapp} address={footer.contact.address} />
        )}
      </main>
      <Footer footer={footer} contactBar={contactBar} />
      <RequestCallbackModal />
      <EligibilityQuiz />
      <AuthModal />
      <ChatWidget phone={contactBar.phone} whatsapp={contactBar.whatsapp} />
    </>
  );
}
