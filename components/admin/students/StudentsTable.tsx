"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ADMISSION_STATUSES, admissionStatusLabel, type Student } from "./types";

export default function StudentsTable() {
  const [page, setPage] = useState(1);
  const [admissionStatus, setAdmissionStatus] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-students", page, admissionStatus, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (admissionStatus) params.set("admissionStatus", admissionStatus);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/students?${params}`);
      return (await res.json()) as { items: Student[]; pageCount: number };
    },
  });

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <Input placeholder="Search name / email…" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} className="w-64" />
        <Select value={admissionStatus || "ALL"} onValueChange={(v) => { setPage(1); setAdmissionStatus(v === "ALL" ? "" : v); }}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All admission statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All admission statuses</SelectItem>
            {ADMISSION_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Admission Status</TableHead>
            <TableHead>Enrolled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data?.items ?? []).map((student) => (
            <TableRow key={student.id}>
              <TableCell>
                <Link href={`/admin/students/${student.id}`} className="font-medium text-primary hover:underline">
                  {student.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{student.email ?? student.phone ?? "—"}</TableCell>
              <TableCell>{student.course.title}</TableCell>
              <TableCell>{student.batch?.name ?? "Unassigned"}</TableCell>
              <TableCell>
                <Badge variant="secondary">{admissionStatusLabel(student.admissionStatus)}</Badge>
              </TableCell>
              <TableCell>{new Date(student.enrolledAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!isLoading && (data?.items.length ?? 0) === 0 && (
        <div className="p-6 text-center text-sm text-muted-foreground">No students found.</div>
      )}

      <div className="flex items-center justify-between border-t border-border p-3 text-sm">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <span className="text-muted-foreground">
          Page {page} of {data?.pageCount ?? 1}
        </span>
        <Button variant="outline" size="sm" disabled={page >= (data?.pageCount ?? 1)} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
