import BrochureForm from "@/components/admin/brochures/BrochureForm";
import pageStyles from "../../module-list.module.css";

export default function NewBrochurePage() {
  return (
    <div>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.heading}>New Brochure</h1>
      </div>
      <BrochureForm />
    </div>
  );
}
