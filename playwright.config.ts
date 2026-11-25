import "dotenv/config";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Generous: most specs chain a login + several DB-backed mutations against a
  // remote dev DB, each of which can also pay a first-compile cost in `next dev`
  // the first time a route is hit in a given dev-server session. 30s was too
  // tight for the multi-step CRM/admissions/AI flows and caused the overall
  // test timeout to fire before an individual step's own (already generous)
  // timeout could. admin-admissions.spec.ts self-overrides higher still.
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
});
