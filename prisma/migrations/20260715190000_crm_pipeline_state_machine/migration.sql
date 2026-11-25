-- CRM pipeline state machine: replaces the ad-hoc LeadStage enum with the
-- documented 8-stage pipeline + 7 terminal outcomes, renames the pipeline's
-- session timestamp, adds the LMS-link stub fields on Student, and adds a
-- notification type for auto-scheduled sessions.

-- RenameColumn: Lead.demoScheduledAt -> Lead.sessionScheduledAt
ALTER TABLE "Lead" RENAME COLUMN "demoScheduledAt" TO "sessionScheduledAt";
DROP INDEX "Lead_demoScheduledAt_idx";
CREATE INDEX "Lead_sessionScheduledAt_idx" ON "Lead"("sessionScheduledAt");

-- AlterEnum: add SESSION_SCHEDULED to NotificationType
ALTER TYPE "NotificationType" ADD VALUE 'SESSION_SCHEDULED';

-- AlterTable: Student LMS-link stub fields
ALTER TABLE "Student" ADD COLUMN "lmsUserId" TEXT;
ALTER TABLE "Student" ADD COLUMN "lmsLinkedAt" TIMESTAMP(3);

-- AlterEnum (breaking): replace LeadStage with the pipeline's 15 values,
-- remapping existing rows on a best-effort basis rather than dropping data.
CREATE TYPE "LeadStage_new" AS ENUM ('NEW_LEAD', 'CALL_ATTEMPTED', 'FOLLOW_UP', 'CALL_CONNECTED', 'SESSION_SCHEDULED', 'SESSION_DONE', 'PARTIAL_PAYMENT', 'ONBOARDED_LEARNER', 'INVALID_NUMBER', 'DUPLICATE_LEAD', 'NOT_INTERESTED', 'WRONG_REQUIREMENT', 'NO_RESPONSE', 'LOST', 'SPAM');

ALTER TABLE "Lead" ADD COLUMN "stage_new" "LeadStage_new";

UPDATE "Lead" SET "stage_new" = (CASE "stage"::text
  WHEN 'NEW' THEN 'NEW_LEAD'
  WHEN 'CONTACTED' THEN 'CALL_ATTEMPTED'
  WHEN 'COUNSELLING_SCHEDULED' THEN 'SESSION_SCHEDULED'
  WHEN 'DEMO_COMPLETED' THEN 'SESSION_DONE'
  WHEN 'INTERESTED' THEN 'CALL_CONNECTED'
  WHEN 'PAYMENT_PENDING' THEN 'PARTIAL_PAYMENT'
  WHEN 'ENROLLED' THEN 'ONBOARDED_LEARNER'
  WHEN 'LOST' THEN 'LOST'
  ELSE 'NEW_LEAD'
END)::"LeadStage_new";

ALTER TABLE "Lead" ALTER COLUMN "stage_new" SET NOT NULL;
ALTER TABLE "Lead" ALTER COLUMN "stage_new" SET DEFAULT 'NEW_LEAD';

DROP INDEX "Lead_stage_idx";
ALTER TABLE "Lead" DROP COLUMN "stage";
ALTER TABLE "Lead" RENAME COLUMN "stage_new" TO "stage";
CREATE INDEX "Lead_stage_idx" ON "Lead"("stage");

DROP TYPE "LeadStage";
ALTER TYPE "LeadStage_new" RENAME TO "LeadStage";
