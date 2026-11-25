"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Instructor = { id: string; name: string };

export default function InstructorCombobox({
  value,
  onChange,
  ariaLabel = "Trainer",
}: {
  value: string | null;
  onChange: (instructorId: string | null) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-instructors-picker"],
    queryFn: async () => {
      const res = await fetch("/api/admin/instructors?pageSize=200");
      if (!res.ok) throw new Error("Failed to load instructors");
      return (await res.json()) as { items: Instructor[] };
    },
  });

  const instructors = data?.items ?? [];
  const selected = instructors.find((i) => i.id === value);

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
          {selected ? selected.name : "Select a trainer…"}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search trainers…" />
          <CommandList>
            <CommandEmpty>No trainer found.</CommandEmpty>
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
              {instructors.map((instructor) => (
                <CommandItem
                  key={instructor.id}
                  value={instructor.name}
                  onSelect={() => {
                    onChange(instructor.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 size-4", value === instructor.id ? "opacity-100" : "opacity-0")} />
                  {instructor.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
