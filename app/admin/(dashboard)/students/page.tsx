import StudentsTable from "@/components/admin/students/StudentsTable";

export default function StudentsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Students</h1>
      <StudentsTable />
    </div>
  );
}
