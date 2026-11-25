-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "demoScheduledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LeadNote" ADD COLUMN     "attachmentUrl" TEXT;

-- CreateIndex
CREATE INDEX "Lead_demoScheduledAt_idx" ON "Lead"("demoScheduledAt");
