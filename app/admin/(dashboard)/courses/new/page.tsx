import CourseForm from "@/components/admin/courses/CourseForm";
import pageStyles from "../../module-list.module.css";

export default function NewCoursePage() {
  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>New Course</h1>
      </div>
      <CourseForm />
    </div>
  );
}
