import BatchForm from "@/components/admin/batches/BatchForm";

export default function NewBatchPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">New Batch</h1>
      <BatchForm />
    </div>
  );
}
