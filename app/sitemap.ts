import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { getPublishedCourses } from "@/lib/services/courseService";
import { getPublishedBlogs } from "@/lib/services/blogService";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  let courses: Awaited<ReturnType<typeof getPublishedCourses>> = [];
  let articles: Awaited<ReturnType<typeof getPublishedBlogs>> = [];

  try {
    [courses, articles] = await Promise.all([getPublishedCourses(), getPublishedBlogs()]);
  } catch (error) {
    console.error("DB error in sitemap, using fallback empty lists:", error);
  }

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/brochures`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    // Program pages are the money pages — each targets its own keyword cluster.
    ...courses.map((c) => ({
      url: `${siteUrl}/programs/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    {
      url: `${siteUrl}/resources`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...articles.map((a) => ({
      url: `${siteUrl}/resources/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
