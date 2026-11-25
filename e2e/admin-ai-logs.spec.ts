import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@empowersacademy.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

test("AI Request Logs page loads for an admin", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });

  await page.goto("/admin/ai/logs");
  await expect(page.getByRole("heading", { name: "AI Request Logs" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Feature" })).toBeVisible();
});
