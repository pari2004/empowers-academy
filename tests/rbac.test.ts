import { describe, it, expect } from "vitest";
import { can, permission, ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from "@/lib/rbac";

describe("rbac.can", () => {
  it("grants everything to a wildcard role", () => {
    const session = { user: { role: "SUPER_ADMIN", permissions: ["*"] } };
    expect(can(session, "courses.delete")).toBe(true);
    expect(can(session, "users.create")).toBe(true);
  });

  it("denies permissions not explicitly granted", () => {
    const session = { user: { role: "SUPPORT", permissions: DEFAULT_ROLE_PERMISSIONS.SUPPORT } };
    expect(can(session, "contacts.view")).toBe(true);
    expect(can(session, "courses.delete")).toBe(false);
    expect(can(session, "users.create")).toBe(false);
  });

  it("denies everything when there is no session", () => {
    expect(can(null, "courses.view")).toBe(false);
    expect(can(undefined, "courses.view")).toBe(false);
    expect(can({ user: null }, "courses.view")).toBe(false);
  });

  it("builds well-formed permission strings for every resource/action pair", () => {
    expect(permission("courses", "view")).toBe("courses.view");
    expect(ALL_PERMISSIONS).toContain("courses.view");
    expect(ALL_PERMISSIONS).toContain("users.delete");
  });

  it("ADMIN gets everything except user management", () => {
    const admin = DEFAULT_ROLE_PERMISSIONS.ADMIN;
    expect(admin).toContain("courses.delete");
    expect(admin.some((p) => p.startsWith("users."))).toBe(false);
  });
});
