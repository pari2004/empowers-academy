import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@empowersacademy.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

test("unauthenticated visitors are redirected away from /admin", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("logging in reaches the dashboard and shows live stats", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();

  // authorize() does several sequential DB round-trips (lockout check, user
  // lookup, bcrypt compare, attempt log, lastLoginAt update, activity log)
  // against the remote Railway DB, plus first-hit dev-server compile time —
  // both are one-time/dev-only costs, hence the generous timeout here.
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });
  await expect(page.getByText("Total Courses")).toBeVisible();
  await expect(page.getByText("System Health")).toBeVisible();
});

test("a Super Admin can create and then delete a course end to end", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });

  // Unique per run so a prior run's leftover (e.g. a failed cleanup step)
  // never collides on the slug's unique constraint.
  const title = `E2E Test Course ${Date.now()}`;

  await page.goto("/admin/courses/new");
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByLabel("Description", { exact: true }).fill("Created by the Playwright smoke test.");
  await page.getByRole("button", { name: /create course/i }).click();

  // Course creation is a transaction plus a revision snapshot plus an
  // activity log write, all against the remote dev DB — same latency
  // rationale as the login timeout above.
  await expect(page).toHaveURL(/\/admin\/courses$/, { timeout: 15_000 });
  await expect(page.getByText(title)).toBeVisible();

  const row = page.locator("tr", { hasText: title });
  await row.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).last().click();
  await expect(page.getByRole("cell", { name: title })).not.toBeVisible();
});
