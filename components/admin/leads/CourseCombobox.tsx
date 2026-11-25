"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Course = { id: string; title: string };

export default function CourseCombobox({
  value,
  onChange,
  ariaLabel = "Course",
}: {
  value: string | null;
  onChange: (courseId: string | null) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-courses-picker"],
    queryFn: async () => {
      const res = await fetch("/api/admin/courses?pageSize=200");
      if (!res.ok) throw new Error("Failed to load courses");
      return (await res.json()) as { items: Course[] };
    },
  });

  const courses = data?.items ?? [];
  const selected = courses.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          className="w-full justify-between font-normal"
        >
          {selected ? selected.title : "Select a course…"}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search courses…" />
          <CommandList>
            <CommandEmpty>No course found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 size-4", value ? "opacity-0" : "opacity-100")} />
                None
              </CommandItem>
              {courses.map((course) => (
                <CommandItem
                  key={course.id}
                  value={course.title}
                  onSelect={() => {
                    onChange(course.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 size-4", value === course.id ? "opacity-100" : "opacity-0")} />
                  {course.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
