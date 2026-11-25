export type BatchStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export type Batch = {
  id: string;
  name: string;
  courseId: string;
  course: { id: string; title: string };
  instructorId: string | null;
  instructor: { id: string; name: string } | null;
  timing: string | null;
  capacity: number;
  startDate: string | null;
  endDate: string | null;
  meetingLink: string | null;
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
};

export const BATCH_STATUSES: Array<{ value: BatchStatus; label: string }> = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function batchStatusLabel(status: BatchStatus): string {
  return BATCH_STATUSES.find((s) => s.value === status)?.label ?? status;
}
