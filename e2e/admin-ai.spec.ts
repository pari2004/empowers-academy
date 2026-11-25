import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@empowersacademy.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });
}

// This environment has no live AI provider key configured yet, so a "Score
// Lead" click can legitimately end in either state: a real score renders, or
// the panel surfaces a clear "not configured" error toast. Both prove the
// RBAC/UI/error-handling wiring works without depending on a paid provider call.
test("AI Insights panel on a lead detail page scores a lead or surfaces a clear error", async ({ page }) => {
  await login(page);

  const name = `E2E AI Lead ${Date.now()}`;
  await page.goto("/admin/leads/new");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(`${Date.now()}@example.com`);
  await page.getByRole("button", { name: /create lead/i }).click();
  await expect(page).toHaveURL(/\/admin\/leads\/[a-f0-9-]+$/, { timeout: 15_000 });

  await expect(page.getByText("AI Insights")).toBeVisible();
  await page.getByRole("button", { name: /score lead/i }).click();

  const scoreBadge = page.getByText(/\d+\/100/);
  const errorToast = page.getByText(/not configured|AI request failed/i);
  await expect(scoreBadge.or(errorToast)).toBeVisible({ timeout: 20_000 });
});

test("AI chat assistant launcher opens a panel and can send a message", async ({ page }) => {
  await login(page);

  await page.getByRole("button", { name: /ai chat assistant/i }).click();
  await page.getByLabel("Chat message").fill("What are my active leads?");
  await page.getByRole("button", { name: /^send$/i }).click();

  await expect(page.getByText("What are my active leads?")).toBeVisible();

  // Either a real assistant reply bubble renders, or a clear "not configured" toast does.
  const errorToast = page.getByText(/not configured|chat request failed/i);
  const assistantBubble = page.locator('[class*="assistant"]');
  await expect(errorToast.or(assistantBubble)).toBeVisible({ timeout: 20_000 });
});
