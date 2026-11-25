-- CreateEnum
CREATE TYPE "MasterclassStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "ContactEnquiryType" ADD VALUE 'MASTERCLASS_SIGNUP';

-- CreateTable
CREATE TABLE "Masterclass" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT,
    "instructorId" TEXT,
    "courseId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER,
    "meetingLink" TEXT,
    "capacity" INTEGER,
    "status" "MasterclassStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Masterclass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Masterclass_slug_key" ON "Masterclass"("slug");

-- CreateIndex
CREATE INDEX "Masterclass_status_scheduledAt_idx" ON "Masterclass"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "Masterclass_instructorId_idx" ON "Masterclass"("instructorId");

-- CreateIndex
CREATE INDEX "Masterclass_courseId_idx" ON "Masterclass"("courseId");

-- AddForeignKey
ALTER TABLE "Masterclass" ADD CONSTRAINT "Masterclass_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Masterclass" ADD CONSTRAINT "Masterclass_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
