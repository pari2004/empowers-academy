import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl, siteName } from "@/lib/seo";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import RequestCallbackModal from "@/components/RequestCallbackModal";
import EligibilityQuiz from "@/components/EligibilityQuiz";
import { IconGradientDefs } from "@/components/Icons";
import { getNavData, getFooterData } from "@/lib/cms/siteChrome";
import { nav as navFallback, footer as footerFallback, contactBar as contactBarFallback } from "@/lib/content";

import type { NavData } from "@/components/Nav";
import type { FooterData, ContactBarData } from "@/components/Footer";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const title = `Terms and Conditions | ${siteName}`;
  const description =
    "Review the legal terms, conditions, and 180-day better-offer guarantee guidelines for enrolling in Empowers Academy programs.";

  return {
    title,
    description,
    alternates: { canonical: "/terms" },
    openGraph: {
      type: "website",
      url: `${siteUrl}/terms`,
      siteName,
      title,
      description,
    },
  };
}

export default async function TermsPage() {
  let nav: NavData = navFallback;
  let footer: FooterData = footerFallback;
  let contactBar: ContactBarData = contactBarFallback;

  try {
    const res = await Promise.all([getNavData(), getFooterData()]);
    nav = res[0];
    footer = res[1].footer;
    contactBar = res[1].contactBar;
  } catch (error) {
    console.error("Failed to load nav/footer for Terms page:", error);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/terms#page`,
        name: "Terms and Conditions",
        url: `${siteUrl}/terms`,
        description: "Empowers Academy Terms and Conditions and Guarantee Terms",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Terms and Conditions", item: `${siteUrl}/terms` },
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
        <div className="container" style={{ paddingTop: "calc(var(--nav-h) + 24px)", paddingBottom: 64 }}>
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Terms and Conditions</span>
          </nav>

          <header className="program-detail-hero" style={{ marginBottom: 32 }}>
            <span className="eyebrow" style={{ display: "inline-block", marginBottom: 12 }}>Legal & Agreements</span>
            <h1 style={{ fontSize: "2.4rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>Terms and Conditions</h1>
            <p className="program-detail-goal" style={{ fontSize: "1.05rem", color: "var(--text-secondary)" }}>
              Last updated: August 19, 2026. Please read these terms carefully before enrolling in any program offered by Empowers Academy.
            </p>
          </header>

          <div className="glass-panel" style={{ padding: "clamp(20px, 4vw, 36px)", borderRadius: 16, display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="legal-html-content" dangerouslySetInnerHTML={{ __html: `\n<p>Please read these terms and conditions carefully before using Our Service.</p>\n<h2>Interpretation and Definitions</h2>\n<h3>Interpretation</h3>\n<p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>\n<h3>Definitions</h3>\n<p>For the purposes of these Terms and Conditions:</p>\n<ul>\n<li>\n<p><strong>Affiliate</strong> means an entity that controls, is controlled by, or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p>\n</li>\n<li>\n<p><strong>Country/State</strong> refers to: Karnataka,  India</p>\n</li>\n<li>\n<p><strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in these Terms and Conditions) refers to Empowers Academy, BMTC Complex, Old Madiwala, Kuvempu Nagar, Stage 2, BTM Layout, Bengaluru, Karnataka 560068.</p>\n</li>\n<li>\n<p><strong>Device</strong> means any device that can access the Service such as a computer, a cell phone or a digital tablet.</p>\n</li>\n<li>\n<p><strong>Service</strong> refers to the Website.</p>\n</li>\n<li>\n<p><strong>Terms and Conditions</strong> (also referred to as &quot;Terms&quot;) means these Terms and Conditions, including any documents expressly incorporated by reference, which govern Your access to and use of the Service and form the entire agreement between You and the Company regarding the Service. These Terms and Conditions have been created with the help of the <a href="https://www.termsfeed.com/terms-conditions-generator/" target="_blank">Terms and Conditions Generator</a>.</p>\n</li>\n<li>\n<p><strong>Third-Party Social Media Service</strong> means any services or content (including data, information, products or services) provided by a third party that is displayed, included, made available, or linked to through the Service.</p>\n</li>\n<li>\n<p><strong>Website</strong> refers to Empowers Academy, accessible from <a href="https://empowersacademy.com/" rel="external nofollow noopener" target="_blank">https://empowersacademy.com/</a></p>\n</li>\n<li>\n<p><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p>\n</li>\n</ul>\n<h2>Acknowledgment</h2>\n<p>These are the Terms and Conditions governing the use of this Service and the agreement between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>\n<p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>\n<p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>\n<p>You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.</p>\n<p>Your access to and use of the Service is also subject to Our Privacy Policy, which describes how We collect, use, and disclose personal information. Please read Our Privacy Policy carefully before using Our Service.</p>\n<h2>Links to Other Websites</h2>\n<p>Our Service may contain links to third-party websites or services that are not owned or controlled by the Company.</p>\n<p>The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such websites or services.</p>\n<p>We strongly advise You to read the terms and conditions and privacy policies of any third-party websites or services that You visit.</p>\n<h3>Links from a Third-Party Social Media Service</h3>\n<p>The Service may display, include, make available, or link to content or services provided by a Third-Party Social Media Service. A Third-Party Social Media Service is not owned or controlled by the Company, and the Company does not endorse or assume responsibility for any Third-Party Social Media Service.</p>\n<p>You acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with Your access to or use of any Third-Party Social Media Service, including any content, goods, or services made available through them. Your use of any Third-Party Social Media Service is governed by that Third-Party Social Media Service\'s terms and privacy policies.</p>\n<h2>Termination</h2>\n<p>We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.</p>\n<p>Upon termination, Your right to use the Service will cease immediately.</p>\n<h2>Limitation of Liability</h2>\n<p>Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of these Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven\'t purchased anything through the Service.</p>\n<p>To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of these Terms), even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.</p>\n<p>Some states do not allow the exclusion of implied warranties or limitation of liability for incidental or consequential damages, which means that some of the above limitations may not apply. In these states, each party\'s liability will be limited to the greatest extent permitted by law.</p>\n<h2>&quot;AS IS&quot; and &quot;AS AVAILABLE&quot; Disclaimer</h2>\n<p>The Service is provided to You &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service, including all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage or trade practice. Without limitation to the foregoing, the Company provides no warranty or undertaking, and makes no representation of any kind that the Service will meet Your requirements, achieve any intended results, be compatible or work with any other software, applications, systems or services, operate without interruption, meet any performance or reliability standards or be error free or that any errors or defects can or will be corrected.</p>\n<p>Without limiting the foregoing, neither the Company nor any of the company\'s provider makes any representation or warranty of any kind, express or implied: (i) as to the operation or availability of the Service, or the information, content, and materials or products included thereon; (ii) that the Service will be uninterrupted or error-free; (iii) as to the accuracy, reliability, or currency of any information or content provided through the Service; or (iv) that the Service, its servers, the content, or e-mails sent from or on behalf of the Company are free of viruses, scripts, trojan horses, worms, malware, timebombs or other harmful components.</p>\n<p>Some jurisdictions do not allow the exclusion of certain types of warranties or limitations on applicable statutory rights of a consumer, so some or all of the above exclusions and limitations may not apply to You. But in such a case the exclusions and limitations set forth in this section shall be applied to the greatest extent enforceable under applicable law.</p>\n<h2>Governing Law</h2>\n<p>The laws of the Country/State, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>\n<h2>Disputes Resolution</h2>\n<p>If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.</p>\n<h2>For European Union (EU) Users</h2>\n<p>If You are a European Union consumer, you will benefit from any mandatory provisions of the law of the country in which You are resident.</p>\n<h2>United States Legal Compliance</h2>\n<p>You represent and warrant that (i) You are not located in a country that is subject to the United States government embargo, or that has been designated by the United States government as a &quot;terrorist supporting&quot; country, and (ii) You are not listed on any United States government list of prohibited or restricted parties.</p>\n<h2>Severability and Waiver</h2>\n<h3>Severability</h3>\n<p>If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.</p>\n<h3>Waiver</h3>\n<p>Except as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not affect a party\'s ability to exercise such right or require such performance at any time thereafter nor shall the waiver of a breach constitute a waiver of any subsequent breach.</p>\n<h2>Translation Interpretation</h2>\n<p>These Terms and Conditions may have been translated if We have made them available to You on our Service.\nYou agree that the original English text shall prevail in the case of a dispute.</p>\n<h2>Changes to These Terms and Conditions</h2>\n<p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days\' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>\n<p>By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the Service.</p>\n<h2>Contact Us</h2>\n<p>If you have any questions about these Terms and Conditions, You can contact us:</p>\n<ul>\n<li>\n<p>By email: contact@empowersacademy.com</p>\n</li>\n<li>\n<p>By visiting this page on our website: <a href="https://empowersacademy.com/" rel="external nofollow noopener" target="_blank">https://empowersacademy.com/</a></p>\n</li>\n<li>\n<p>By phone: 8151876077</p>\n</li>\n</ul>` }} />
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
