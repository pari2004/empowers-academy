-- CreateTable
CREATE TABLE "BrochureCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "BrochureCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brochure" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "thumbnail" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "categoryId" TEXT,
    "courseId" TEXT,
    "tags" TEXT[],
    "downloadButtonText" TEXT DEFAULT 'Download Brochure',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brochure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgrammeDetail" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "heroBanner" TEXT,
    "heroImage" TEXT,
    "mode" "ClassMode" NOT NULL DEFAULT 'ONLINE',
    "eligibility" TEXT,
    "certification" TEXT,
    "emiAvailable" BOOLEAN NOT NULL DEFAULT false,
    "admissionOpen" BOOLEAN NOT NULL DEFAULT true,
    "overview" TEXT,
    "highlights" TEXT[],
    "careerOpportunities" TEXT[],
    "placementSupport" TEXT,
    "projects" JSONB,
    "galleryImages" TEXT[],
    "videoUrl" TEXT,
    "applyCtaLabel" TEXT DEFAULT 'Apply Now',
    "applyCtaHref" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgrammeDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutPage" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "heroBackground" TEXT,
    "heroCtaLabel" TEXT,
    "heroCtaHref" TEXT,
    "aboutDescription" TEXT,
    "vision" TEXT,
    "mission" TEXT,
    "coreValues" JSONB,
    "statStudents" TEXT,
    "statCourses" TEXT,
    "statTrainers" TEXT,
    "statPlacements" TEXT,
    "founderName" TEXT,
    "founderDesignation" TEXT,
    "founderPhoto" TEXT,
    "founderMessage" TEXT,
    "whyChooseUs" JSONB,
    "team" JSONB,
    "partners" JSONB,
    "achievements" JSONB,
    "timeline" JSONB,
    "gallery" TEXT[],
    "videoUrl" TEXT,
    "testimonialIds" TEXT[],
    "ctaTitle" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrochureCategory_name_key" ON "BrochureCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BrochureCategory_slug_key" ON "BrochureCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Brochure_slug_key" ON "Brochure"("slug");

-- CreateIndex
CREATE INDEX "Brochure_status_publishedAt_idx" ON "Brochure"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Brochure_courseId_idx" ON "Brochure"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgrammeDetail_courseId_key" ON "ProgrammeDetail"("courseId");

-- CreateIndex
CREATE INDEX "ProgrammeDetail_status_publishedAt_idx" ON "ProgrammeDetail"("status", "publishedAt");

-- AddForeignKey
ALTER TABLE "Brochure" ADD CONSTRAINT "Brochure_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BrochureCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brochure" ADD CONSTRAINT "Brochure_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammeDetail" ADD CONSTRAINT "ProgrammeDetail_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
