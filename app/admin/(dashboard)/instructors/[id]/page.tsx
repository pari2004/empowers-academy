import { notFound } from "next/navigation";
import { getInstructorById } from "@/lib/services/instructorService";
import InstructorForm, { type InstructorFormValues } from "@/components/admin/instructors/InstructorForm";
import VersionHistoryPanel from "@/components/admin/VersionHistoryPanel";
import pageStyles from "../../module-list.module.css";

export default async function EditInstructorPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const instructor = await getInstructorById(id);
  if (!instructor) notFound();

  const initialValues: Partial<InstructorFormValues> = {
    name: instructor.name,
    slug: instructor.slug,
    designation: instructor.designation,
    bio: instructor.bio,
    skills: instructor.skills.join("\n"),
    experience: instructor.experience ?? "",
    profileImage: instructor.profileImage ?? "",
    featured: instructor.featured,
    status: instructor.status,
  };

  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>Edit Instructor</h1>
      </div>
      <InstructorForm instructorId={instructor.id} initialValues={initialValues} />
      <VersionHistoryPanel entityType="instructor" entityId={instructor.id} />
    </div>
  );
}
