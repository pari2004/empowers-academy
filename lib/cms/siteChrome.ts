// Server-side data for the site-wide chrome (Nav + Footer), shared by every
// public page. Falls back to the original lib/content.ts values for any menu
// location that has no CMS items yet, so an empty Menu table never blanks out
// navigation.
import { getMenuByLocation } from "@/lib/services/menuService";
import { getSiteSettings } from "@/lib/services/settingsService";
import { nav as navFallback, footer as footerFallback, contactBar as contactBarFallback } from "@/lib/content";
import type { NavData } from "@/components/Nav";
import type { FooterData, ContactBarData } from "@/components/Footer";

export async function getNavData(): Promise<NavData> {
  let menu = { items: [] as Array<{ id: string; parentId: string | null; label: string; href: string }> };
  
  try {
    menu = await getMenuByLocation("HEADER");
  } catch (error) {
    console.error("DB error in getNavData, using fallbacks:", error);
  }

  const topLevel = menu.items.filter((i) => !i.parentId);
  if (topLevel.length === 0) return navFallback;
  return {
    links: topLevel.map(item => ({ label: item.label, href: item.href })),
    cta: navFallback.cta,
  };
}

export async function getFooterData(): Promise<{ footer: FooterData; contactBar: ContactBarData }> {
  let menu = { items: [] as Array<{ id: string; parentId: string | null; label: string; href: string }> };
  let settings: Record<string, unknown> = {};

  try {
    const res = await Promise.all([getMenuByLocation("FOOTER"), getSiteSettings()]);
    menu = res[0];
    settings = res[1] as unknown as Record<string, unknown>;
  } catch (error) {
    console.error("DB error in getFooterData, using fallbacks:", error);
  }

  const topLevel = menu.items.filter((i) => !i.parentId);
  const companyInfo = settings.companyInfo as { address?: string; phone?: string; email?: string; hours?: string[] } | null;

  const defaultProgramsColumn = {
    title: "Programs",
    links: [
      { label: "AIML Full Stack Development", href: "/programs/the-apex-ai-programme" },
      { label: "PG Executive Agentic AI & Generative AI", href: "/programs/pg-executive-agentic-ai-generative-ai" },
      { label: "Cybersecurity & Ethical hacking (CEH V13 AI)", href: "/programs/cybersecurity-ceh-v13" },
      { label: "Cloud Computing and DevOps", href: "/programs/cloud-computing-devops" },
      { label: "Business Analyst and AI Program", href: "/programs/business-analyst-ai-program" },
    ],
  };

  let columns = footerFallback.columns;

  if (topLevel.length > 0) {
    columns = topLevel.map((parent) => {
      if (parent.label.toLowerCase().trim() === "programs") {
        return defaultProgramsColumn;
      }
      return {
        title: parent.label,
        links: menu.items
          .filter((child) => child.parentId === parent.id)
          .map((child) => ({ label: child.label, href: child.href })),
      };
    });
  } else {
    columns = footerFallback.columns;
  }

  const footer: FooterData = {
    contact: {
      phone: companyInfo?.phone || footerFallback.contact.phone,
      whatsapp: (settings.whatsappNumber as string) || footerFallback.contact.whatsapp,
      email: companyInfo?.email || footerFallback.contact.email,
      address: companyInfo?.address || footerFallback.contact.address,
    },
    columns,
    hours: companyInfo?.hours?.length ? companyInfo.hours : footerFallback.hours,
    copyright: (settings.copyright as string) || footerFallback.copyright,
    legalLinks: (settings.legalLinks as Array<{ label: string }> | null)?.map((l) => l.label) ?? footerFallback.legalLinks,
  };

  const contactBar: ContactBarData = {
    text: contactBarFallback.text,
    phone: footer.contact.phone,
    whatsapp: footer.contact.whatsapp,
    cta: contactBarFallback.cta,
  };

  return { footer, contactBar };
}
