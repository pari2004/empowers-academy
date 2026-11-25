import { notFound } from "next/navigation";
import { getCourseById } from "@/lib/services/courseService";
import { getProgrammeDetailByCourseId } from "@/lib/services/programmeDetailService";
import ProgrammeDetailForm, { type ProgrammeDetailFormValues } from "@/components/admin/programmes/ProgrammeDetailForm";
import VersionHistoryPanel from "@/components/admin/VersionHistoryPanel";
import pageStyles from "../../module-list.module.css";

function toDatetimeLocal(date: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditProgrammeDetailPage(props: { params: Promise<{ courseId: string }> }) {
  const params = await props.params;
  const { courseId } = params;
  const course = await getCourseById(courseId);
  if (!course) notFound();

  const detail = await getProgrammeDetailByCourseId(courseId);

  const initialValues: Partial<ProgrammeDetailFormValues> | undefined = detail
    ? {
        heroBanner: detail.heroBanner ?? "",
        heroImage: detail.heroImage ?? "",
        mode: detail.mode,
        eligibility: detail.eligibility ?? "",
        certification: detail.certification ?? "",
        emiAvailable: detail.emiAvailable,
        emiDetails: detail.emiDetails ?? "",
        scholarshipInfo: detail.scholarshipInfo ?? "",
        admissionOpen: detail.admissionOpen,
        overview: detail.overview ?? "",
        highlights: detail.highlights.join("\n"),
        careerOpportunities: detail.careerOpportunities.join("\n"),
        placementSupport: detail.placementSupport ?? "",
        placementRate: detail.placementRate?.toString() ?? "",
        avgSalaryHikePct: detail.avgSalaryHikePct?.toString() ?? "",
        avgPackageLpa: detail.avgPackageLpa?.toString() ?? "",
        projects: ((detail.projects as Array<{ title: string; description?: string }> | null) ?? []).map((p, i) => ({
          id: `existing-${i}`,
          title: p.title,
          description: p.description ?? "",
        })),
        galleryImages: detail.galleryImages.join("\n"),
        videoUrl: detail.videoUrl ?? "",
        curriculumUrl: detail.curriculumUrl ?? "",
        courseFee: course.price?.toString() ?? "",
        gstRate: "18",
        gstText: "+ 18% GST",
        applyCtaLabel: detail.applyCtaLabel ?? "Apply Now",
        applyCtaHref: detail.applyCtaHref ?? "",
        status: detail.status,
        publishedAt: toDatetimeLocal(detail.publishedAt),
      }
    : {
        courseFee: course.price?.toString() ?? "",
        gstRate: "18",
        gstText: "+ 18% GST",
      };

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Programme Details — {course.title}</h1>
      </div>
      <ProgrammeDetailForm courseId={course.id} courseTitle={course.title} courseSlug={course.slug} initialValues={initialValues} />
      {detail && <VersionHistoryPanel entityType="programmeDetail" entityId={detail.id} />}
    </div>
  );
}
