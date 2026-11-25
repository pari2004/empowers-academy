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

test("a batch can be created, and a lead walks the full pipeline into a student assigned to it", async ({ page }) => {
  // Longer than the default: this single test touches the full CRM pipeline
  // (7 stage transitions, 2 of them through the payload dialog) on top of the
  // five dynamic routes the original admission flow already covered — each
  // paying a first-compile cost in dev mode.
  test.setTimeout(180_000);
  await login(page);

  const batchName = `E2E Test Batch ${Date.now()}`;

  // 1. Create a batch.
  await page.goto("/admin/batches/new");
  await page.getByLabel("Batch Name").fill(batchName);
  await page.getByRole("combobox", { name: "Course" }).click();
  await page.getByPlaceholder("Search courses…").waitFor({ state: "visible" });
  // Index 0 is the "None" option (clears the selection) — the first real course is index 1.
  await page.getByRole("option").nth(1).click();
  await page.getByLabel("Capacity").fill("30");
  await page.getByRole("button", { name: /create batch/i }).click();
  // Generous timeout: this is the first hit on this dynamic route this dev
  // session, so it eats a first-compile cost on top of the DB round trip —
  // same rationale as the login/course-creation timeouts elsewhere in e2e/.
  await expect(page).toHaveURL(/\/admin\/batches\/[a-f0-9-]+$/, { timeout: 25_000 });
  await expect(page.getByRole("heading", { name: batchName })).toBeVisible();

  // 2. Create a lead with a course. Every new lead starts at New Lead.
  const leadName = `E2E Admission Lead ${Date.now()}`;
  await page.goto("/admin/leads/new");
  await page.getByLabel("Name").fill(leadName);
  await page.getByRole("combobox", { name: "Interested Course" }).click();
  await page.getByPlaceholder("Search courses…").waitFor({ state: "visible" });
  // Index 0 is the "None" option (clears the selection) — the first real course is index 1.
  await page.getByRole("option").nth(1).click();
  await page.getByRole("button", { name: /create lead/i }).click();
  await expect(page).toHaveURL(/\/admin\/leads\/[a-f0-9-]+$/, { timeout: 25_000 });

  // 3. Walk the state machine: New Lead -> Call Attempted -> Call Connected
  // -> Session Scheduled -> Session Done -> Partial Payment -> Onboarded
  // Learner. A direct New Lead -> Payment Pending jump (the old test's
  // shortcut) is no longer a legal transition.
  async function moveTo(label: string) {
    await page.getByRole("combobox", { name: "Move to stage" }).click();
    await page.getByRole("option", { name: label, exact: true }).click();
    await page.getByRole("button", { name: "Move" }).click();
  }

  await moveTo("Call Attempted");
  await expect(page.getByText(/Stage changed from New Lead to Call Attempted/i)).toBeVisible({ timeout: 15_000 });

  await moveTo("Call Connected");
  await expect(page.getByText(/Stage changed from Call Attempted to Call Connected/i)).toBeVisible({ timeout: 15_000 });

  // Session Scheduled requires a date/time, collected via the transition dialog.
  await moveTo("Session Scheduled");
  await page.getByLabel(/Session date/i).fill("2026-08-01T10:00");
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText(/Stage changed from Call Connected to Session Scheduled/i)).toBeVisible({ timeout: 15_000 });

  await moveTo("Session Done");
  await expect(page.getByText(/Stage changed from Session Scheduled to Session Done/i)).toBeVisible({ timeout: 15_000 });

  // Partial Payment creates the Student record behind the lead and records a payment.
  await moveTo("Partial Payment");
  await page.getByLabel(/^Amount/).fill("5000");
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText(/Stage changed from Session Done to Partial Payment/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: "View Student Record" })).toBeVisible({ timeout: 10_000 });

  // Onboarded Learner: assign the batch created above and finish onboarding.
  await moveTo("Onboarded Learner");
  await page.getByRole("combobox", { name: "Batch" }).click();
  await page.getByRole("option", { name: batchName }).click();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText(/Stage changed from Partial Payment to Onboarded Learner/i)).toBeVisible({ timeout: 15_000 });

  // 4. Confirm the student record reflects the batch assignment.
  await page.getByRole("link", { name: "View Student Record" }).click();
  await expect(page).toHaveURL(/\/admin\/students\/[a-f0-9-]+$/, { timeout: 25_000 });
  await expect(page.getByRole("heading", { name: leadName })).toBeVisible();
  await expect(page.getByText(batchName)).toBeVisible({ timeout: 10_000 });

  // 5. Confirm it shows up correctly in the students list. Generous timeout:
  // this is the first hit on this route this dev session (same first-compile
  // rationale as the dynamic-route timeouts above).
  await page.goto("/admin/students");
  await page.getByPlaceholder(/search name/i).fill(leadName);
  await expect(page.getByRole("link", { name: leadName })).toBeVisible({ timeout: 20_000 });
});
