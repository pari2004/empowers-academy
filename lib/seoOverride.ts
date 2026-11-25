// Thin wrapper around the SEO Manager's SeoMeta table (admin/seo, seoService.ts)
// so any public page can let an admin override its computed title/description/etc.
// without a code change. Proven pattern: app/(site)/about/page.tsx already does
// this inline for entityType "aboutPage" — this generalizes it for every route.
import { getSeoMeta } from "@/lib/services/seoService";

export type SeoOverride = {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  keywords?: string[];
  ogImage?: string;
  twitterCard?: string;
  robots?: string;
};

export async function getSeoOverride(entityType: string, entityId: string): Promise<SeoOverride> {
  let seo = null;
  try {
    seo = await getSeoMeta(entityType, entityId);
  } catch (error) {
    console.error(`DB error in getSeoOverride for ${entityType}/${entityId}, using static fallbacks:`, error);
  }
  if (!seo) return {};
  return {
    title: seo.metaTitle ?? undefined,
    description: seo.metaDescription ?? undefined,
    canonicalUrl: seo.canonicalUrl ?? undefined,
    keywords: seo.keywords.length ? seo.keywords : undefined,
    ogImage: seo.ogImage ?? undefined,
    twitterCard: seo.twitterCard ?? undefined,
    robots: seo.robots ?? undefined,
  };
}
