import { test, expect } from "@playwright/test";

test("homepage renders live CMS content", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1").first()).toBeVisible();
  // Program cards are sourced from the Course table, not lib/content.ts.
  await expect(page.getByRole("heading", { name: "The Apex AI Programme" })).toBeVisible();
  // FAQ section is sourced from the Faq table.
  await expect(page.getByRole("heading", { name: "Frequently Asked Questions" })).toBeVisible();
});

test("resources listing loads published blog posts from the CMS", async ({ page }) => {
  await page.goto("/resources");
  await expect(page.getByRole("heading", { name: /guides from the people/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /How to Build a RAG Pipeline/ })).toBeVisible();
});

test("program detail page renders", async ({ page }) => {
  await page.goto("/programs/the-apex-ai-programme");
  await expect(page.getByRole("heading", { name: "The 180-Day Better-Offer Guarantee" })).toBeVisible();
});
