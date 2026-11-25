"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/admin/ToastProvider";
import CourseCombobox from "@/components/admin/leads/CourseCombobox";
import InstructorCombobox from "./InstructorCombobox";
import { batchStatusSchema } from "@/lib/validation/batch";
import { BATCH_STATUSES } from "./types";

// Same rationale as LeadForm: form-level schema keeps every field the plain
// string an <input> produces; converted to real types in onSubmit.
const batchFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  courseId: z.string().nullable(),
  instructorId: z.string().nullable(),
  timing: z.string().optional(),
  capacity: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  meetingLink: z.string().optional(),
  status: batchStatusSchema,
});

export type BatchFormValues = z.infer<typeof batchFormSchema>;

export default function BatchForm({
  batchId,
  initialValues,
}: {
  batchId?: string;
  initialValues?: Partial<BatchFormValues>;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      name: "",
      courseId: null,
      instructorId: null,
      timing: "",
      capacity: "0",
      startDate: "",
      endDate: "",
      meetingLink: "",
      status: "UPCOMING",
      ...initialValues,
    },
  });

  async function onSubmit(values: BatchFormValues) {
    if (!values.courseId) {
      showToast("Select a course", "error");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        courseId: values.courseId,
        instructorId: values.instructorId || null,
        timing: values.timing || null,
        capacity: values.capacity ? Number(values.capacity) : 0,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
        meetingLink: values.meetingLink || null,
        status: values.status,
      };

      const res = await fetch(batchId ? `/api/admin/batches/${batchId}` : "/api/admin/batches", {
        method: batchId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save batch");
      }
      const batch = await res.json();
      showToast(batchId ? "Batch updated" : "Batch created", "success");
      if (batchId) {
        router.refresh();
      } else {
        router.push(`/admin/batches/${batch.id}`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="name">Batch Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Course</Label>
          <Controller control={control} name="courseId" render={({ field }) => <CourseCombobox value={field.value} onChange={field.onChange} />} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Trainer</Label>
          <Controller
            control={control}
            name="instructorId"
            render={({ field }) => <InstructorCombobox value={field.value} onChange={field.onChange} />}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="timing">Timing</Label>
          <Input id="timing" placeholder="e.g. Mon/Wed/Fri 7–9 PM" {...register("timing")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="capacity">Capacity</Label>
          <Input id="capacity" type="number" min="0" {...register("capacity")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" type="date" {...register("endDate")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="meetingLink">Meeting Link</Label>
          <Input id="meetingLink" type="url" placeholder="https://…" {...register("meetingLink")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BATCH_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : batchId ? "Save Changes" : "Create Batch"}
        </Button>
      </div>
    </form>
  );
}
