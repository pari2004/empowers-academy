"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/components/admin/ToastProvider";
import LeadCard from "./LeadCard";
import StageTransitionDialog, { TERMINAL_PICKER } from "./StageTransitionDialog";
import { PIPELINE_STAGES, TERMINAL_OUTCOMES, getValidNextStages, stageRequiresPayload, type Lead, type LeadStage } from "./types";

const CLOSED_COLUMN = "CLOSED" as const;
type ColumnId = LeadStage | typeof CLOSED_COLUMN;

function DraggableCard({ lead, disabled }: { lead: Lead; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id, disabled });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
      className={disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"}
    >
      <LeadCard lead={lead} />
    </div>
  );
}

function Column({
  id,
  label,
  leads,
  disabled,
}: {
  id: ColumnId;
  label: string;
  leads: Lead[];
  disabled: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-lg border border-border bg-background/60 p-2 transition-opacity ${
        isOver && !disabled ? "ring-2 ring-primary" : ""
      } ${disabled ? "opacity-40" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between px-1 text-sm font-medium text-foreground">
        <span>{label}</span>
        <span className="text-xs text-muted-foreground">{leads.length}</span>
      </div>
      <div className="flex min-h-16 flex-col gap-2">
        {leads.map((lead) => (
          <DraggableCard key={lead.id} lead={lead} disabled={disabled} />
        ))}
      </div>
    </div>
  );
}

export default function LeadsKanban({ leads }: { leads: Lead[] }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [pendingMove, setPendingMove] = useState<{ lead: Lead; toStage: LeadStage | typeof TERMINAL_PICKER } | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const closedLeads = leads.filter((l) => TERMINAL_OUTCOMES.some((s) => s.value === l.stage));
  const validNextForActive = activeLead ? getValidNextStages(activeLead.stage) : [];

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["admin-leads-board"] });
    queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
    queryClient.invalidateQueries({ queryKey: ["admin-dashboard-leads"] });
  }

  function handleDragStart(event: DragStartEvent) {
    const lead = leads.find((l) => l.id === event.active.id);
    setActiveLead(lead ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;
    const lead = leads.find((l) => l.id === active.id);
    if (!lead) return;

    const columnId = over.id as ColumnId;
    if (columnId === lead.stage) return;

    const validNext = getValidNextStages(lead.stage);
    if (columnId === CLOSED_COLUMN) {
      const anyTerminalValid = validNext.some((s) => TERMINAL_OUTCOMES.some((t) => t.value === s));
      if (!anyTerminalValid) {
        showToast(`No closing outcome is available from this stage`, "error");
        return;
      }
      setPendingMove({ lead, toStage: TERMINAL_PICKER });
      return;
    }

    const nextStage = columnId as LeadStage;
    if (!validNext.includes(nextStage)) {
      showToast("That move isn't allowed from the lead's current stage", "error");
      return;
    }

    if (stageRequiresPayload(nextStage)) {
      setPendingMove({ lead, toStage: nextStage });
      return;
    }

    const res = await fetch(`/api/admin/leads/${lead.id}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: nextStage }),
    });
    if (!res.ok) {
      showToast("Failed to move lead", "error");
      return;
    }
    showToast("Lead stage updated", "success");
    invalidateAll();
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {PIPELINE_STAGES.map(({ value, label }) => (
            <Column
              key={value}
              id={value}
              label={label}
              leads={leads.filter((l) => l.stage === value)}
              disabled={!!activeLead && activeLead.stage !== value && !validNextForActive.includes(value)}
            />
          ))}
          <Column
            id={CLOSED_COLUMN}
            label="Closed"
            leads={closedLeads}
            disabled={!!activeLead && !validNextForActive.some((s) => TERMINAL_OUTCOMES.some((t) => t.value === s))}
          />
        </div>
        <DragOverlay>{activeLead ? <LeadCard lead={activeLead} /> : null}</DragOverlay>
      </DndContext>

      {pendingMove && (
        <StageTransitionDialog
          open
          onOpenChange={(open) => !open && setPendingMove(null)}
          leadId={pendingMove.lead.id}
          leadName={pendingMove.lead.name}
          fromStage={pendingMove.lead.stage}
          toStage={pendingMove.toStage}
          courseId={pendingMove.lead.interestedCourseId}
          onSuccess={invalidateAll}
        />
      )}
    </>
  );
}
