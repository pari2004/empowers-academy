import { notFound } from "next/navigation";
import { getCourseById } from "@/lib/services/courseService";
import CourseForm, { type CourseFormValues } from "@/components/admin/courses/CourseForm";
import VersionHistoryPanel from "@/components/admin/VersionHistoryPanel";
import pageStyles from "../../module-list.module.css";

export default async function EditCoursePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const course = await getCourseById(id);
  if (!course) notFound();

  const initialValues: Partial<CourseFormValues> = {
    title: course.title,
    slug: course.slug,
    category: course.category ?? "",
    description: course.description,
    shortDescription: course.shortDescription ?? "",
    thumbnail: course.thumbnail ?? "",
    coverImage: course.coverImage ?? "",
    duration: course.duration ?? "",
    level: course.level,
    language: course.language,
    price: course.price ? String(course.price) : "",
    discountPrice: course.discountPrice ? String(course.discountPrice) : "",
    gstRate: "18",
    gstText: "+ 18% GST",
    tags: course.tags.join("\n"),
    learningOutcomes: course.learningOutcomes.join("\n"),
    requirements: course.requirements.join("\n"),
    toolsCovered: course.toolsCovered.join("\n"),
    status: course.status,
    instructorIds: course.instructors.map((ci) => ci.instructorId),
    curriculum: course.curriculum.map((section) => ({ id: section.id, title: section.title })),
  };

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Edit Course</h1>
      </div>
      <CourseForm courseId={course.id} initialValues={initialValues} />
      <VersionHistoryPanel entityType="course" entityId={course.id} />
    </div>
  );
}
