import InstructorForm from "@/components/admin/instructors/InstructorForm";
import pageStyles from "../../module-list.module.css";

export default function NewInstructorPage() {
  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>New Instructor</h1>
      </div>
      <InstructorForm />
    </div>
  );
}
