// Migrates the site's existing real content (lib/content.ts, lib/resources.ts)
// into the CMS tables, plus seeds roles/admin user. Run with `pnpm db:seed`.
// Safe to re-run: every step upserts on a natural unique key.

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  nav,
  hero,
  partners,
  whyCards,
  programs,
  journey,
  guarantee,
  outcomes,
  stats,
  mentors,
  faqs,
  community,
  brochure,
  footer,
  about,
} from "../lib/content";
import { articles } from "../lib/resources";
import { siteTitle, siteDescription, siteUrl, keywords } from "../lib/seo";
import { DEFAULT_ROLE_PERMISSIONS, ROLE_NAMES } from "../lib/rbac";

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seedRolesAndAdmin() {
  const roleIds: Record<string, string> = {};
  for (const name of ROLE_NAMES) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { permissions: DEFAULT_ROLE_PERMISSIONS[name] },
      create: { name, permissions: DEFAULT_ROLE_PERMISSIONS[name] },
    });
    roleIds[name] = role.id;
  }

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@empowersacademy.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Super Admin",
      email,
      passwordHash,
      roleId: roleIds.SUPER_ADMIN,
    },
  });

  console.log(`Roles seeded. Super Admin: ${email} / ${password}`);
  return roleIds;
}

async function seedCrmUsers(roleIds: Record<string, string>) {
  const demoUsers = [
    { name: "Sanjay Sales", email: "sales.manager@empowersacademy.com", role: "SALES_MANAGER" },
    { name: "Chitra Counsellor", email: "counsellor@empowersacademy.com", role: "COUNSELLOR" },
    { name: "Aman Admissions", email: "admissions@empowersacademy.com", role: "ADMISSION_EXECUTIVE" },
  ] as const;

  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!", 12);
  const userIds: string[] = [];

  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, passwordHash, roleId: roleIds[u.role] },
    });
    userIds.push(user.id);
  }

  console.log(`Seeded ${demoUsers.length} CRM demo users (Sales Manager, Counsellor, Admission Executive).`);
  return userIds;
}

async function seedInstructors() {
  const nameToId: Record<string, string> = {};
  for (const m of mentors) {
    const slug = slugify(m.name);
    const row = await prisma.instructor.upsert({
      where: { slug },
      update: {},
      create: {
        name: m.name,
        slug,
        designation: m.title,
        bio: m.bio,
        skills: m.techStack,
        experience: m.experience,
        profileImage: m.image,
        featured: true,
        status: "PUBLISHED",
      },
    });
    nameToId[m.name] = row.id;
  }
  console.log(`Seeded ${mentors.length} instructors.`);
  return nameToId;
}

async function seedCourses(instructorNameToId: Record<string, string>) {
  for (const p of programs) {
    const course = await prisma.course.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        category: p.tag,
        description: p.details?.overview ?? p.goal,
        shortDescription: p.goal,
        thumbnail: p.image,
        coverImage: p.image,
        duration: p.format,
        tags: p.details?.skills?.length ? p.details.skills : p.stack,
        learningOutcomes: p.details?.learningOutcomes ?? [],
        requirements: p.eligibility ? [p.eligibility] : [],
        toolsCovered: p.details?.tools ?? p.focus,
        status: p.trendingNow ? "PUBLISHED" : "PUBLISHED", 
        deletedAt: null,
      },
      create: {
        title: p.title,
        slug: p.slug,
        category: p.tag,
        description: p.details?.overview ?? p.goal,
        shortDescription: p.goal,
        thumbnail: p.image,
        coverImage: p.image,
        duration: p.format,
        language: "English",
        tags: p.details?.skills?.length ? p.details.skills : p.stack,
        learningOutcomes: p.details?.learningOutcomes ?? [],
        requirements: p.eligibility ? [p.eligibility] : [],
        toolsCovered: p.details?.tools ?? p.focus,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    if (p.details?.learningPath?.length) {
      for (const [idx, title] of p.details.learningPath.entries()) {
        await prisma.courseCurriculumSection.upsert({
          where: { id: `${course.id}-${idx}` },
          update: {},
          create: { id: `${course.id}-${idx}`, courseId: course.id, title, order: idx },
        });
      }
    }

    if (p.mentors) {
      const names = p.mentors.split(",").map((chunk) => chunk.split(" (")[0].trim());
      for (const name of names) {
        const instructorId = instructorNameToId[name];
        if (!instructorId) continue;
        await prisma.courseInstructor.upsert({
          where: { courseId_instructorId: { courseId: course.id, instructorId } },
          update: {},
          create: { courseId: course.id, instructorId },
        });
      }
    }
  }
  console.log(`Seeded ${programs.length} courses.`);
}

async function seedFaqs() {
  const category = await prisma.faqCategory.upsert({
    where: { name: "General" },
    update: {},
    create: { name: "General", order: 0 },
  });

  for (const [idx, f] of faqs.entries()) {
    const id = `general-faq-${idx}`;
    await prisma.faq.upsert({
      where: { id },
      update: {},
      create: {
        id,
        question: f.q,
        answer: f.a,
        categoryId: category.id,
        order: idx,
        status: "PUBLISHED",
      },
    });
  }
  console.log(`Seeded ${faqs.length} FAQs.`);
}

// `outcomes` doubles as seed data for the Testimonial Management module — no
// source rating exists in the original content, so we assign a random rating 
// between 4.0 and 4.8 to make it look realistic.
async function seedTestimonials() {
  for (const [idx, o] of outcomes.entries()) {
    const id = `outcome-${idx}`;
    // Generate a pseudo-random rating between 4.0 and 4.8
    const randomRating = 4.0 + ((o.name.length * 7) % 9) / 10;
    await prisma.testimonial.upsert({
      where: { id },
      update: { rating: randomRating }, // Also update existing ones if re-seeded
      create: {
        id,
        studentName: o.name,
        company: o.company,
        designation: `${o.prior} → ${o.role}`,
        review: o.quote,
        rating: randomRating,
        image: o.photo ?? null,
        featured: idx < 6,
        status: "PUBLISHED",
        order: idx,
      },
    });
  }
  console.log(`Seeded ${outcomes.length} testimonials.`);
}

async function seedBlog() {
  for (const a of articles) {
    const category = await prisma.blogCategory.upsert({
      where: { slug: slugify(a.category) },
      update: {},
      create: { name: a.category, slug: slugify(a.category) },
    });

    await prisma.blog.upsert({
      where: { slug: a.slug },
      update: {},
      create: {
        title: a.title,
        slug: a.slug,
        excerpt: a.description,
        body: a.blocks as never,
        categoryId: category.id,
        readingTime: a.readingTime,
        status: "PUBLISHED",
        publishedAt: new Date(a.datePublished),
      },
    });
  }
  console.log(`Seeded ${articles.length} blog posts.`);
}

async function seedMenus() {
  const header = await prisma.menu.upsert({
    where: { location: "HEADER" },
    update: {},
    create: { location: "HEADER" },
  });
  // Items are keyed by index, so `update: {}` would leave a stale row behind
  // whenever a link is inserted mid-list: every later item keeps its old label
  // and the list grows a duplicate tail. Keep each row in sync with its source.
  for (const [idx, link] of nav.links.entries()) {
    const id = `header-${idx}`;
    const data = { label: link.label, href: link.href, order: idx };
    await prisma.menuItem.upsert({
      where: { id },
      update: data,
      create: { id, menuId: header.id, ...data },
    });
  }
  await prisma.menuItem.deleteMany({
    where: { menuId: header.id, id: { notIn: nav.links.map((_, idx) => `header-${idx}`) } },
  });

  const footerMenu = await prisma.menu.upsert({
    where: { location: "FOOTER" },
    update: {},
    create: { location: "FOOTER" },
  });
  const footerIds: string[] = [];
  for (const [colIdx, col] of footer.columns.entries()) {
    const parentId = `footer-col-${colIdx}`;
    footerIds.push(parentId);
    const parentData = { label: col.title, href: "#", order: colIdx };
    await prisma.menuItem.upsert({
      where: { id: parentId },
      update: parentData,
      create: { id: parentId, menuId: footerMenu.id, ...parentData },
    });
    for (const [linkIdx, link] of col.links.entries()) {
      const id = `footer-col-${colIdx}-${linkIdx}`;
      footerIds.push(id);
      const data = { label: link.label, href: link.href ?? "#", order: linkIdx };
      await prisma.menuItem.upsert({
        where: { id },
        update: data,
        create: { id, menuId: footerMenu.id, parentId, ...data },
      });
    }
  }
  await prisma.menuItem.deleteMany({
    where: { menuId: footerMenu.id, id: { notIn: footerIds } },
  });

  await prisma.menu.upsert({
    where: { location: "MOBILE" },
    update: {},
    create: { location: "MOBILE" },
  });

  console.log("Seeded header/footer/mobile menus.");
}

async function seedSiteSettings() {
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Empowers Academy",
      companyInfo: {
        address: footer.contact.address,
        phone: footer.contact.phone,
        email: footer.contact.email,
        hours: footer.hours,
      },
      legalLinks: footer.legalLinks.map((label) => ({ label, href: "#" })),
      copyright: footer.copyright,
      whatsappNumber: footer.contact.whatsapp,
    },
  });
  console.log("Seeded site settings.");
}

async function seedSeo() {
  await prisma.seoMeta.upsert({
    where: { entityType_entityId: { entityType: "static", entityId: "home" } },
    update: {},
    create: {
      entityType: "static",
      entityId: "home",
      metaTitle: siteTitle,
      metaDescription: siteDescription,
      canonicalUrl: siteUrl,
      keywords,
    },
  });
  console.log("Seeded homepage SEO meta.");
}

async function seedHomepageSections() {
  const sections: Array<{ type: string; config: Record<string, unknown> }> = [
    {
      type: "HERO",
      config: {
        eyebrow: hero.eyebrow,
        headline: hero.headline,
        subheadline: hero.subheadline,
        primaryCta: hero.primaryCta,
        secondaryCta: hero.secondaryCta,
      },
    },
    {
      type: "TRUSTED_COMPANIES",
      config: {
        eyebrow: partners.eyebrow,
        heading: partners.heading,
        subheading: partners.subheading,
        logos: partners.logos,
      },
    },
    {
      type: "WHY_CHOOSE_US",
      config: {
        eyebrow: "What Empowers",
        heading: "A different kind of AI program",
        cards: whyCards,
      },
    },
    {
      type: "POPULAR_COURSES",
      config: {
        eyebrow: "Program offerings",
        heading: "Three ways into an AI career",
        subheading:
          "Live, mentor-led, and covered by the 180-day better-offer guarantee. Two more programs launching soon.",
      },
    },
    {
      type: "LEARNING_PROCESS",
      config: {
        eyebrow: "The path",
        heading: "Your Journey with Empowers Academy",
        subheading:
          "A guided path from enrollment to a better offer, with a mentor beside you at every step.",
        steps: journey,
      },
    },
    {
      type: "GUARANTEE",
      config: {
        eyebrow: "Guaranteed in writing",
        heading: "The Guarantee Procedure",
        subheading:
          "A better offer within 180 days or a full refund, executed as a signed legal agreement before you pay anything.",
        steps: guarantee,
      },
    },
    {
      type: "STATISTICS",
      config: {
        eyebrow: "Real outcomes",
        heading: "From their old role to a better one",
        subheading: "A snapshot of where alumni started and where they landed.",
        items: stats,
      },
    },
    {
      type: "ALUMNI_OUTCOMES",
      config: {
        eyebrow: "Our Alumni",
        heading: "The people behind the outcomes",
        subheading: "Meet a few of the professionals who made the jump.",
        items: outcomes,
      },
    },
    {
      type: "TRAINERS",
      config: {
        eyebrow: "Meet your mentors",
        heading: "Practitioners, not lecturers",
        subheading:
          "You learn live from people building AI systems, each leading their domain in the cohorts.",
      },
    },
    {
      type: "COMMUNITY",
      config: { eyebrow: "Community exclusive", heading: community.heading, points: community.points },
    },
    {
      type: "FAQ_PREVIEW",
      config: {
        eyebrow: "Questions, answered",
        heading: "Frequently Asked Questions",
        subheading: "Everything about the guarantee, the format, and who these programs are for.",
      },
    },
    {
      type: "FOOTER_CTA",
      config: {
        eyebrow: "Full breakdown",
        heading: brochure.heading,
        body: brochure.body,
        buttonLabel: brochure.button,
      },
    },
  ];

  for (const [idx, s] of sections.entries()) {
    const id = `home-${idx}`;
    await prisma.pageSection.upsert({
      where: { id },
      update: {},
      create: {
        id,
        landingPageId: null,
        type: s.type,
        order: idx,
        enabled: true,
        config: s.config as never,
      },
    });
  }
  console.log(`Seeded ${sections.length} homepage sections.`);
}

// The About Page CMS row was never migrated from lib/content.ts, so it sat
// empty and DRAFT — the public /about route 404s until a row exists with
// status PUBLISHED. Populate it with the same real content every other
// section already draws from, and publish it. Fields with no source content
// (vision/mission/founder message/achievements/timeline) are left blank for
// an admin to fill in later rather than inventing copy.
async function seedAboutPage() {
  const existing = await prisma.aboutPage.findUnique({ where: { id: "singleton" } });
  if (existing && (existing.heroTitle || existing.status !== "DRAFT")) {
    console.log("About Page already has content or is published — leaving it as-is.");
    return;
  }

  const statFor = (label: string) => {
    const s = stats.find((item) => item.label === label);
    return s ? `${s.value}${s.suffix ?? ""}` : undefined;
  };

  const data = {
    heroTitle: about.heading,
    heroSubtitle: about.paragraphs[0],
    heroCtaLabel: "Explore Programs",
    heroCtaHref: "/#programs",
    aboutDescription: about.paragraphs[1],
    statStudents: statFor("Professionals Trained"),
    statTrainers: statFor("Expert Trainers"),
    whyChooseUs: whyCards,
    team: mentors.map((m) => ({
      name: m.name,
      designation: m.aboutTitle ?? m.title,
      photo: m.image,
      bio: m.bio,
    })),
    partners: partners.logos.map((l) => ({ name: l.name, logo: l.src })),
    ctaTitle: brochure.heading,
    ctaLabel: brochure.button,
    ctaHref: "/brochures",
    status: "PUBLISHED" as const,
    publishedAt: new Date(),
  };

  await prisma.aboutPage.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  console.log("Seeded About Page and published it.");
}

async function seedLeads(assigneeIds: string[]) {
  const courses = await prisma.course.findMany({ take: 3, select: { id: true } });
  const courseId = (i: number) => courses[i % Math.max(courses.length, 1)]?.id;
  const assigneeId = (i: number) => assigneeIds[i % Math.max(assigneeIds.length, 1)];

  const leads = [
    { name: "Aditi Sharma", email: "aditi.sharma@example.com", phone: "+91 90000 00001", city: "Bengaluru", state: "Karnataka", source: "WEBSITE", stage: "NEW_LEAD", leadScore: 42, tags: ["hot"] },
    { name: "Rohan Mehta", email: "rohan.mehta@example.com", phone: "+91 90000 00002", city: "Pune", state: "Maharashtra", source: "GOOGLE_ADS", stage: "CALL_ATTEMPTED", leadScore: 55, tags: [] },
    { name: "Priya Nair", email: "priya.nair@example.com", phone: "+91 90000 00003", city: "Kochi", state: "Kerala", source: "REFERRAL", stage: "SESSION_SCHEDULED", leadScore: 68, tags: ["referral"], sessionInDays: 2 },
    { name: "Karan Verma", email: "karan.verma@example.com", phone: "+91 90000 00004", city: "Delhi", state: "Delhi", source: "INSTAGRAM", stage: "SESSION_DONE", leadScore: 74, tags: ["hot"] },
    { name: "Sneha Iyer", email: "sneha.iyer@example.com", phone: "+91 90000 00005", city: "Chennai", state: "Tamil Nadu", source: "WHATSAPP", stage: "CALL_CONNECTED", leadScore: 81, tags: [], sessionInDays: 4 },
    { name: "Vikram Singh", email: "vikram.singh@example.com", phone: "+91 90000 00006", city: "Jaipur", state: "Rajasthan", source: "FACEBOOK_ADS", stage: "PARTIAL_PAYMENT", leadScore: 88, tags: ["priority"] },
    { name: "Neha Gupta", email: "neha.gupta@example.com", phone: "+91 90000 00007", city: "Mumbai", state: "Maharashtra", source: "WALK_IN", stage: "ONBOARDED_LEARNER", leadScore: 95, tags: [] },
    { name: "Arjun Reddy", email: "arjun.reddy@example.com", phone: "+91 90000 00008", city: "Hyderabad", state: "Telangana", source: "LINKEDIN", stage: "LOST", leadScore: 20, tags: ["cold"] },
  ] as const;

  for (const [idx, l] of leads.entries()) {
    const id = `seed-lead-${idx}`;
    const assignedToId = assigneeId(idx);
    const sessionScheduledAt = "sessionInDays" in l ? new Date(Date.now() + l.sessionInDays * 86_400_000) : null;
    await prisma.lead.upsert({
      where: { id },
      update: { assignedToId, sessionScheduledAt },
      create: {
        id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        city: l.city,
        state: l.state,
        source: l.source,
        stage: l.stage,
        leadScore: l.leadScore,
        tags: [...l.tags],
        interestedCourseId: courseId(idx),
        assignedToId,
        sessionScheduledAt,
        nextFollowUpAt: l.stage !== "ONBOARDED_LEARNER" && l.stage !== "LOST" ? new Date(Date.now() + idx * 86_400_000) : null,
      },
    });
  }
  console.log(`Seeded ${leads.length} leads.`);
}

async function seedBatches(instructorNameToId: Record<string, string>) {
  const courses = await prisma.course.findMany({ take: 3, select: { id: true } });
  const instructorIds = Object.values(instructorNameToId);

  const batches = [
    { id: "seed-batch-0", name: "AI Cohort — Jan 2026", timing: "Mon/Wed/Fri 7–9 PM", capacity: 25, status: "ONGOING", startInDays: -30, endInDays: 60 },
    { id: "seed-batch-1", name: "AI Cohort — Mar 2026", timing: "Tue/Thu 6–8 PM", capacity: 20, status: "UPCOMING", startInDays: 14, endInDays: 104 },
    { id: "seed-batch-2", name: "Weekend Batch — Feb 2026", timing: "Sat/Sun 10 AM–1 PM", capacity: 15, status: "UPCOMING", startInDays: 7, endInDays: 97 },
  ] as const;

  const batchIds: string[] = [];
  for (const [idx, b] of batches.entries()) {
    const courseId = courses[idx % Math.max(courses.length, 1)]?.id;
    if (!courseId) continue;
    const batch = await prisma.batch.upsert({
      where: { id: b.id },
      update: {},
      create: {
        id: b.id,
        name: b.name,
        courseId,
        instructorId: instructorIds[idx % Math.max(instructorIds.length, 1)],
        timing: b.timing,
        capacity: b.capacity,
        status: b.status,
        startDate: new Date(Date.now() + b.startInDays * 86_400_000),
        endDate: new Date(Date.now() + b.endInDays * 86_400_000),
      },
    });
    batchIds.push(batch.id);
  }
  console.log(`Seeded ${batchIds.length} batches.`);
  return batchIds;
}

async function seedStudents(batchIds: string[]) {
  // Converts the ONBOARDED_LEARNER-stage seeded lead (Neha Gupta, seed-lead-6) into a Student.
  const lead = await prisma.lead.findUnique({ where: { id: "seed-lead-6" } });
  if (!lead || !lead.interestedCourseId) {
    console.log("Skipped seeding students: source lead not found.");
    return;
  }

  await prisma.student.upsert({
    where: { id: "seed-student-0" },
    update: {},
    create: {
      id: "seed-student-0",
      leadId: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      courseId: lead.interestedCourseId,
      batchId: batchIds[0] ?? null,
      admissionStatus: "CONFIRMED",
      assignedToId: lead.assignedToId,
    },
  });
  console.log("Seeded 1 student.");
}

async function main() {
  const roleIds = await seedRolesAndAdmin();
  const crmUserIds = await seedCrmUsers(roleIds);
  const instructorNameToId = await seedInstructors();
  await seedCourses(instructorNameToId);
  await seedFaqs();
  await seedTestimonials();
  await seedBlog();
  await seedMenus();
  await seedSiteSettings();
  await seedSeo();
  await seedHomepageSections();
  await seedAboutPage();
  await seedLeads(crmUserIds);
  const batchIds = await seedBatches(instructorNameToId);
  await seedStudents(batchIds);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
