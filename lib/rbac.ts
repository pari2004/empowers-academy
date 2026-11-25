// Central permission catalogue + role defaults. Permissions live on the `Role`
// row in the DB (string[]), so they're editable later from User & Role
// Management — this file only supplies the fixed catalogue of valid
// permission strings and the *default* mapping used when seeding roles.

export const RESOURCES = [
  "courses",
  "instructors",
  "blog",
  "testimonials",
  "faqs",
  "media",
  "banners",
  "masterclasses",
  "brochures",
  "programmeDetails",
  "aboutPage",
  "landingPages",
  "homepage",
  "menus",
  "settings",
  "contacts",
  "newsletter",
  "seo",
  "users",
  "activityLogs",
  "leads",
  "batches",
  "students",
  "ai",
  "payments",
  "invoices",
  "receipts",
  "refunds",
  "coupons",
  "installments",
  "financeReports",
  "notifications",
  "tasks",
  "workflows",
  "emailTemplates",
  "communications",
] as const;

export const ACTIONS = ["view", "create", "update", "delete", "publish"] as const;

export type Resource = (typeof RESOURCES)[number];
export type Action = (typeof ACTIONS)[number];
export type Permission = `${Resource}.${Action}` | "*";

export function permission(resource: Resource, action: Action): Permission {
  return `${resource}.${action}`;
}

export const ALL_PERMISSIONS: Permission[] = RESOURCES.flatMap((r) =>
  ACTIONS.map((a) => permission(r, a))
);

export const ROLE_NAMES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MARKETING",
  "CONTENT_EDITOR",
  "INSTRUCTOR",
  "SUPPORT",
  "SALES_MANAGER",
  "COUNSELLOR",
  "ADMISSION_EXECUTIVE",
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

// Default permission grants seeded per role. Super Admin gets the wildcard;
// everyone else gets an explicit, narrower slice.
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: ALL_PERMISSIONS.filter((p) => !p.startsWith("users.")),
  MARKETING: [
    "banners.view", "banners.create", "banners.update", "banners.publish",
    "masterclasses.view", "masterclasses.create", "masterclasses.update", "masterclasses.publish",
    "landingPages.view", "landingPages.create", "landingPages.update", "landingPages.publish",
    "homepage.view", "homepage.update", "homepage.publish",
    "seo.view", "seo.update",
    "contacts.view", "contacts.update",
    "newsletter.view",
    "media.view", "media.create",
    "leads.view", "leads.create", "leads.update",
    "ai.view", "ai.create",
    "notifications.view",
  ],
  CONTENT_EDITOR: [
    "blog.view", "blog.create", "blog.update", "blog.publish",
    "testimonials.view", "testimonials.create", "testimonials.update",
    "faqs.view", "faqs.create", "faqs.update", "faqs.publish",
    "courses.view", "courses.update",
    "media.view", "media.create",
    "notifications.view",
    "brochures.view", "brochures.update",
    "programmeDetails.view", "programmeDetails.update",
    "aboutPage.view", "aboutPage.update",
  ],
  INSTRUCTOR: ["courses.view", "instructors.view", "instructors.update", "batches.view", "ai.view", "notifications.view"],
  SUPPORT: [
    "contacts.view", "contacts.update",
    "newsletter.view",
    "leads.view", "leads.create", "leads.update",
    "ai.view", "ai.create",
    "notifications.view",
  ],
  SALES_MANAGER: [
    "leads.view", "leads.create", "leads.update", "leads.delete",
    "contacts.view",
    "students.view",
    "ai.view", "ai.create",
    "notifications.view",
  ],
  COUNSELLOR: [
    "leads.view", "leads.update",
    "media.create",
    "ai.view", "ai.create",
    "notifications.view",
  ],
  ADMISSION_EXECUTIVE: [
    "leads.view", "leads.update",
    "batches.view",
    "students.view", "students.create", "students.update",
    // Needed to drive the CRM pipeline's PARTIAL_PAYMENT/ONBOARDED_LEARNER
    // transitions, which record a Payment as part of the stage change.
    "payments.create",
    "ai.view", "ai.create",
    "notifications.view",
  ],
};

type SessionLike = {
  user?: { role?: string; permissions?: string[] } | null;
} | null | undefined;

/** Checks whether the current session's role grants `perm`. `"*"` on the role wildcards everything. */
export function can(session: SessionLike, perm: Permission): boolean {
  const perms = session?.user?.permissions;
  if (!perms || perms.length === 0) return false;
  return perms.includes("*") || perms.includes(perm);
}

/** Throws if the session lacks `perm` — use at the top of every mutating route/service call. */
export function assertCan(session: SessionLike, perm: Permission): void {
  if (!can(session, perm)) {
    throw Object.assign(new Error(`Forbidden: missing permission "${perm}"`), {
      status: 403,
    });
  }
}
