import { describe, it, expect } from "vitest";
import { can, ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from "@/lib/rbac";

describe("rbac — ai resource", () => {
  it("registers ai.view and ai.create in the permission catalogue", () => {
    expect(ALL_PERMISSIONS).toContain("ai.view");
    expect(ALL_PERMISSIONS).toContain("ai.create");
  });

  it("SUPER_ADMIN and ADMIN get ai permissions for free via their wildcard/broad grant", () => {
    const superAdmin = { user: { role: "SUPER_ADMIN", permissions: DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN } };
    expect(can(superAdmin, "ai.view")).toBe(true);
    expect(can(superAdmin, "ai.create")).toBe(true);

    const admin = { user: { role: "ADMIN", permissions: DEFAULT_ROLE_PERMISSIONS.ADMIN } };
    expect(can(admin, "ai.view")).toBe(true);
    expect(can(admin, "ai.create")).toBe(true);
  });

  it("grants ai.view + ai.create to CRM-facing roles that touch leads/students", () => {
    for (const role of ["MARKETING", "SUPPORT", "SALES_MANAGER", "COUNSELLOR", "ADMISSION_EXECUTIVE"] as const) {
      const session = { user: { role, permissions: DEFAULT_ROLE_PERMISSIONS[role] } };
      expect(can(session, "ai.view")).toBe(true);
      expect(can(session, "ai.create")).toBe(true);
    }
  });

  it("grants only ai.view (not ai.create) to INSTRUCTOR", () => {
    const session = { user: { role: "INSTRUCTOR", permissions: DEFAULT_ROLE_PERMISSIONS.INSTRUCTOR } };
    expect(can(session, "ai.view")).toBe(true);
    expect(can(session, "ai.create")).toBe(false);
  });

  it("denies ai permissions to a role with no CRM/LMS involvement (CONTENT_EDITOR)", () => {
    const session = { user: { role: "CONTENT_EDITOR", permissions: DEFAULT_ROLE_PERMISSIONS.CONTENT_EDITOR } };
    expect(can(session, "ai.view")).toBe(false);
    expect(can(session, "ai.create")).toBe(false);
  });
});
