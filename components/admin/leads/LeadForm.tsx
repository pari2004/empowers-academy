"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/admin/ToastProvider";
import CourseCombobox from "./CourseCombobox";
import { leadSourceSchema } from "@/lib/validation/lead";
import { LEAD_SOURCES } from "./types";

// Form-level schema: every field is the string/primitive shape an <input>
// actually produces. Converted to the API's real types (numbers, Dates) in
// onSubmit, right before the fetch — keeps RHF's types friction-free instead
// of fighting z.coerce.date() through the resolver.
const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  city: z.string().optional(),
  state: z.string().optional(),
  college: z.string().optional(),
  company: z.string().optional(),
  experience: z.string().optional(),
  source: leadSourceSchema,
  interestedCourseId: z.string().nullable(),
  budget: z.string().optional(),
  expectedJoining: z.string().optional(),
  leadScore: z.string().optional(),
  tags: z.string().optional(),
  nextFollowUpAt: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export default function LeadForm({
  leadId,
  initialValues,
}: {
  leadId?: string;
  initialValues?: Partial<LeadFormValues>;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      whatsapp: "",
      email: "",
      city: "",
      state: "",
      college: "",
      company: "",
      experience: "",
      source: "WEBSITE",
      interestedCourseId: null,
      budget: "",
      expectedJoining: "",
      leadScore: "0",
      tags: "",
      nextFollowUpAt: "",
      ...initialValues,
    },
  });

  async function onSubmit(values: LeadFormValues) {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        phone: values.phone || null,
        whatsapp: values.whatsapp || null,
        email: values.email || null,
        city: values.city || null,
        state: values.state || null,
        college: values.college || null,
        company: values.company || null,
        experience: values.experience || null,
        source: values.source,
        interestedCourseId: values.interestedCourseId || null,
        budget: values.budget ? Number(values.budget) : null,
        expectedJoining: values.expectedJoining || null,
        leadScore: values.leadScore ? Number(values.leadScore) : 0,
        tags: values.tags ? values.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        nextFollowUpAt: values.nextFollowUpAt || null,
      };

      const res = await fetch(leadId ? `/api/admin/leads/${leadId}` : "/api/admin/leads", {
        method: leadId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save lead");
      }
      const lead = await res.json();
      showToast(leadId ? "Lead updated" : "Lead created", "success");
      if (leadId) {
        router.refresh();
      } else {
        router.push(`/admin/leads/${lead.id}`);
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" {...register("whatsapp")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register("state")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="college">College</Label>
          <Input id="college" {...register("college")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="company">Company</Label>
          <Input id="company" {...register("company")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="experience">Experience</Label>
          <Input id="experience" placeholder="e.g. 3 years" {...register("experience")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Source</Label>
          <Controller
            control={control}
            name="source"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Interested Course</Label>
          <Controller
            control={control}
            name="interestedCourseId"
            render={({ field }) => <CourseCombobox value={field.value} onChange={field.onChange} ariaLabel="Interested Course" />}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="budget">Budget (₹)</Label>
          <Input id="budget" type="number" min="0" step="0.01" {...register("budget")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="leadScore">Lead Score (0–100)</Label>
          <Input id="leadScore" type="number" min="0" max="100" {...register("leadScore")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="expectedJoining">Expected Joining</Label>
          <Input id="expectedJoining" type="date" {...register("expectedJoining")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nextFollowUpAt">Next Follow-up</Label>
          <Input id="nextFollowUpAt" type="datetime-local" {...register("nextFollowUpAt")} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Textarea id="tags" rows={2} {...register("tags")} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : leadId ? "Save Changes" : "Create Lead"}
        </Button>
      </div>
    </form>
  );
}
