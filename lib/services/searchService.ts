import { prisma } from "@/lib/db";

export type SearchResult = {
  type: "course" | "blog" | "faq" | "testimonial" | "media" | "landingPage";
  id: string;
  title: string;
  href: string;
};

const PER_TYPE_LIMIT = 5;

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const contains = { contains: query, mode: "insensitive" as const };

  const [courses, blogs, faqs, testimonials, media, landingPages] = await Promise.all([
    prisma.course.findMany({
      where: { deletedAt: null, title: contains },
      take: PER_TYPE_LIMIT,
      select: { id: true, title: true, slug: true },
    }),
    prisma.blog.findMany({
      where: { deletedAt: null, title: contains },
      take: PER_TYPE_LIMIT,
      select: { id: true, title: true, slug: true },
    }),
    prisma.faq.findMany({
      where: { deletedAt: null, question: contains },
      take: PER_TYPE_LIMIT,
      select: { id: true, question: true },
    }),
    prisma.testimonial.findMany({
      where: { deletedAt: null, studentName: contains },
      take: PER_TYPE_LIMIT,
      select: { id: true, studentName: true },
    }),
    prisma.mediaFile.findMany({
      where: { deletedAt: null, filename: contains },
      take: PER_TYPE_LIMIT,
      select: { id: true, filename: true },
    }),
    prisma.landingPage.findMany({
      where: { deletedAt: null, title: contains },
      take: PER_TYPE_LIMIT,
      select: { id: true, title: true, slug: true },
    }),
  ]);

  return [
    ...courses.map((c) => ({ type: "course" as const, id: c.id, title: c.title, href: `/admin/courses/${c.id}` })),
    ...blogs.map((b) => ({ type: "blog" as const, id: b.id, title: b.title, href: `/admin/blog/${b.id}` })),
    ...faqs.map((f) => ({ type: "faq" as const, id: f.id, title: f.question, href: `/admin/faqs/${f.id}` })),
    ...testimonials.map((t) => ({
      type: "testimonial" as const,
      id: t.id,
      title: t.studentName,
      href: `/admin/testimonials/${t.id}`,
    })),
    ...media.map((m) => ({ type: "media" as const, id: m.id, title: m.filename, href: `/admin/media?file=${m.id}` })),
    ...landingPages.map((l) => ({
      type: "landingPage" as const,
      id: l.id,
      title: l.title,
      href: `/admin/landing-pages/${l.id}`,
    })),
  ];
}
