"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/admin/ToastProvider";

type RiskResult = { riskLevel: "LOW" | "MEDIUM" | "HIGH"; score: number; reasons: string[] };
type PlacementResult = { readinessScore: number; strengths: string[]; gaps: string[] };

async function postAi<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error ?? "AI request failed");
  }
  return res.json();
}

async function getCached<T>(url: string): Promise<T | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  return (await res.json()) ?? null;
}

const RISK_VARIANT: Record<RiskResult["riskLevel"], "outline" | "secondary" | "destructive"> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "destructive",
};

export default function AiStudentInsightsPanel({ studentId }: { studentId: string }) {
  const { showToast } = useToast();
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [computingRisk, setComputingRisk] = useState(false);
  const [placement, setPlacement] = useState<PlacementResult | null>(null);
  const [computingPlacement, setComputingPlacement] = useState(false);

  useEffect(() => {
    getCached<RiskResult>(`/api/admin/ai/students/${studentId}/risk`).then(setRisk);
    getCached<PlacementResult>(`/api/admin/ai/students/${studentId}/placement`).then(setPlacement);
  }, [studentId]);

  async function runRisk() {
    setComputingRisk(true);
    try {
      setRisk(await postAi(`/api/admin/ai/students/${studentId}/risk`));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to compute risk", "error");
    } finally {
      setComputingRisk(false);
    }
  }

  async function runPlacement() {
    setComputingPlacement(true);
    try {
      setPlacement(await postAi(`/api/admin/ai/students/${studentId}/placement`));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to compute placement readiness", "error");
    } finally {
      setComputingPlacement(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 text-sm font-medium text-foreground">AI Insights</div>

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Dropout Risk</span>
            <Button size="sm" variant="outline" onClick={runRisk} disabled={computingRisk}>
              {computingRisk ? "Computing…" : risk ? "Refresh" : "Compute"}
            </Button>
          </div>
          {risk && (
            <div className="mt-2 rounded-md bg-muted/50 p-2">
              <div className="flex items-center gap-2">
                <Badge variant={RISK_VARIANT[risk.riskLevel]}>{risk.riskLevel}</Badge>
                <span className="text-xs text-muted-foreground">{risk.score}/100</span>
              </div>
              {risk.reasons.length > 0 && (
                <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                  {risk.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Placement Readiness</span>
            <Button size="sm" variant="outline" onClick={runPlacement} disabled={computingPlacement}>
              {computingPlacement ? "Computing…" : placement ? "Refresh" : "Compute"}
            </Button>
          </div>
          {placement && (
            <div className="mt-2 rounded-md bg-muted/50 p-2">
              <Badge>{placement.readinessScore}/100</Badge>
              {placement.strengths.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="text-foreground">Strengths:</span> {placement.strengths.join(", ")}
                </p>
              )}
              {placement.gaps.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="text-foreground">Gaps:</span> {placement.gaps.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
