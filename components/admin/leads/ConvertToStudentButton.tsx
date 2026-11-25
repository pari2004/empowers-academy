"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/ToastProvider";

export default function ConvertToStudentButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [converting, setConverting] = useState(false);

  async function convert() {
    setConverting(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to convert lead");
      }
      const student = await res.json();
      showToast("Lead converted to student", "success");
      router.push(`/admin/students/${student.id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to convert lead", "error");
    } finally {
      setConverting(false);
    }
  }

  return (
    <Button onClick={convert} disabled={converting} className="w-full">
      {converting ? "Converting…" : "Convert to Student"}
    </Button>
  );
}
