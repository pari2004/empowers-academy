-- Contact enquiry fields captured by the "Request a Callback" and
-- "Download the Brochure" public forms — extends the single ContactEnquiry
-- model (no separate CRM table for the two forms).

-- AlterEnum: additive — no existing rows use the new value
ALTER TYPE "EnquiryStatus" ADD VALUE 'FOLLOW_UP';

-- CreateEnum
CREATE TYPE "ContactEnquiryType" AS ENUM ('CALLBACK', 'BROCHURE_DOWNLOAD');

-- CreateEnum
CREATE TYPE "ContactCompanyType" AS ENUM ('SERVICE_BASED', 'PRODUCT_BASED');

-- CreateEnum
CREATE TYPE "ContactLookingFor" AS ENUM ('SWITCH_CAREER', 'GROW_ROLE', 'HIGHER_OFFER', 'NOT_SURE');

-- AlterTable
ALTER TABLE "ContactEnquiry"
  ADD COLUMN "companyType" "ContactCompanyType",
  ADD COLUMN "lookingFor" "ContactLookingFor",
  ADD COLUMN "companyName" TEXT,
  ADD COLUMN "designation" TEXT,
  ADD COLUMN "enquiryType" "ContactEnquiryType";

-- CreateIndex
CREATE INDEX "ContactEnquiry_enquiryType_idx" ON "ContactEnquiry"("enquiryType");
