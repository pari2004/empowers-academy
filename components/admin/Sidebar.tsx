"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const NAV_GROUPS: Array<{ label: string; items: Array<{ href: string; label: string; perm: string }> }> = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", perm: "courses.view" }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/homepage", label: "Homepage Builder", perm: "homepage.view" },
      { href: "/admin/landing-pages", label: "Landing Pages", perm: "landingPages.view" },
      { href: "/admin/courses", label: "Courses", perm: "courses.view" },
      { href: "/admin/instructors", label: "Instructors", perm: "instructors.view" },
      { href: "/admin/blog", label: "Blog", perm: "blog.view" },
      { href: "/admin/testimonials", label: "Testimonials", perm: "testimonials.view" },
      { href: "/admin/masterclasses", label: "Masterclasses", perm: "masterclasses.view" },
      { href: "/admin/faqs", label: "FAQs", perm: "faqs.view" },
      { href: "/admin/banners", label: "Banners", perm: "banners.view" },
      { href: "/admin/media", label: "Media Library", perm: "media.view" },
      { href: "/admin/brochures", label: "Brochures", perm: "brochures.view" },
      { href: "/admin/programme-details", label: "Programme Details", perm: "programmeDetails.view" },
      { href: "/admin/about-page", label: "About Page", perm: "aboutPage.view" },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/menus", label: "Menus", perm: "menus.view" },
      { href: "/admin/seo", label: "SEO Manager", perm: "seo.view" },
      { href: "/admin/settings", label: "Global Settings", perm: "settings.view" },
    ],
  },
  {
    label: "CRM",
    items: [
      { href: "/admin/leads", label: "Leads", perm: "leads.view" },
      { href: "/admin/contacts", label: "Contact Enquiries", perm: "contacts.view" },
      { href: "/admin/newsletter", label: "Newsletter", perm: "newsletter.view" },
    ],
  },
  {
    label: "Academics",
    items: [
      { href: "/admin/batches", label: "Batches", perm: "batches.view" },
      { href: "/admin/students", label: "Students", perm: "students.view" },
    ],
  },
  {
    label: "AI",
    items: [{ href: "/admin/ai/logs", label: "AI Request Logs", perm: "ai.view" }],
  },
  {
    label: "Admin",
    items: [
      { href: "/admin/users", label: "Users & Roles", perm: "users.view" },
      { href: "/admin/activity-logs", label: "Activity Logs", perm: "activityLogs.view" },
    ],
  },
];

export default function Sidebar({
  permissions,
  collapsed,
  onToggle,
}: {
  permissions: string[];
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  const canSee = (perm: string) => permissions.includes("*") || permissions.includes(perm);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>
          <Image src="/admin-logo.png" alt="Empowers Academy" width={30} height={30} priority />
        </span>
        {!collapsed && <span className={styles.brandName}>Empowers CMS</span>}
      </div>

      <nav className={styles.nav}>
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => canSee(item.perm));
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label} className={styles.group}>
              {!collapsed && <div className={styles.groupLabel}>{group.label}</div>}
              {visibleItems.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.link} ${active ? styles.active : ""}`}
                    title={collapsed ? item.label : undefined}
                  >
                    {!collapsed ? item.label : item.label.slice(0, 2)}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <button className={styles.collapseBtn} onClick={onToggle} type="button">
        {collapsed ? "»" : "« Collapse"}
      </button>
    </aside>
  );
}
