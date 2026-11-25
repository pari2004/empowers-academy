import { notFound } from "next/navigation";
import { getBatchById } from "@/lib/services/batchService";
import BatchForm from "@/components/admin/batches/BatchForm";

function toDateInput(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const batch = await getBatchById(id);
  if (!batch) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">{batch.name}</h1>
      <BatchForm
        batchId={batch.id}
        initialValues={{
          name: batch.name,
          courseId: batch.courseId,
          instructorId: batch.instructorId,
          timing: batch.timing ?? "",
          capacity: String(batch.capacity),
          startDate: toDateInput(batch.startDate),
          endDate: toDateInput(batch.endDate),
          meetingLink: batch.meetingLink ?? "",
          status: batch.status,
        }}
      />
    </div>
  );
}
