import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@empowersacademy.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  // Generous: the post-login dashboard now also aggregates finance stats and
  // today's follow-ups (several sequential DB round trips against the remote
  // dev DB on an uncached first render) on top of the CRM widgets it already
  // fetched, so this can run past a tight timeout right after sign-in.
  await expect(page).toHaveURL(/\/admin$/, { timeout: 25_000 });
}

test("a lead can be created, appears in the table, and moves through the pipeline", async ({ page }) => {
  await login(page);

  const name = `E2E Test Lead ${Date.now()}`;

  await page.goto("/admin/leads/new");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(`${Date.now()}@example.com`);
  await page.getByRole("button", { name: /create lead/i }).click();

  // createLead is a DB write plus an activity log write against the remote
  // dev DB — same latency rationale as the course/login e2e specs.
  await expect(page).toHaveURL(/\/admin\/leads\/[a-f0-9-]+$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name })).toBeVisible();

  // Move the lead from New Lead to Call Attempted via the stage action bar.
  await page.getByRole("combobox", { name: "Move to stage" }).click();
  await page.getByRole("option", { name: "Call Attempted", exact: true }).click();
  await page.getByRole("button", { name: "Move" }).click();
  await expect(page.getByText(/Stage changed from New Lead to Call Attempted/i)).toBeVisible({ timeout: 15_000 });

  // Generous: first hit on the bare /admin/leads list route this dev session
  // (only /admin/leads/new and /admin/leads/[id] have been compiled so far).
  await page.goto("/admin/leads");
  await page.getByPlaceholder(/search name/i).fill(name);
  await expect(page.getByRole("link", { name })).toBeVisible({ timeout: 20_000 });
});
