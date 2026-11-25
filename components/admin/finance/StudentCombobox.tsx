"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type StudentOption = { id: string; name: string; email: string | null };

export default function StudentCombobox({
  value,
  onChange,
  ariaLabel = "Student",
}: {
  value: string | null;
  onChange: (studentId: string | null) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-students-picker", search],
    queryFn: async () => {
      const params = new URLSearchParams({ pageSize: "50" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/students?${params}`);
      if (!res.ok) throw new Error("Failed to load students");
      return (await res.json()) as { items: StudentOption[] };
    },
  });

  const students = data?.items ?? [];
  const selected = students.find((s) => s.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} aria-label={ariaLabel} className="w-full justify-between font-normal">
          {selected ? selected.name : "Select a student…"}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search students…" value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>No student found.</CommandEmpty>
            <CommandGroup>
              {students.map((student) => (
                <CommandItem
                  key={student.id}
                  value={student.id}
                  onSelect={() => {
                    onChange(student.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 size-4", value === student.id ? "opacity-100" : "opacity-0")} />
                  {student.name}
                  {student.email && <span className="ml-2 text-xs text-muted-foreground">{student.email}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
