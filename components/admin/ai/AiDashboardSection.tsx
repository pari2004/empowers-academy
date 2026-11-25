"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/ToastProvider";
import { LineChartCard } from "@/components/admin/charts/ChartCard";

type DashboardInsights = { headline: string; insights: string[]; risks: string[]; opportunities: string[] };
type RevenueForecast = {
  history: Array<{ month: string; revenue: number }>;
  forecast: Array<{ month: string; predictedRevenue: number; confidence: string }>;
  narrative: string;
};

async function post<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "AI request failed");
  }
  return res.json();
}

export default function AiDashboardSection({
  initialInsights,
  initialForecast,
}: {
  initialInsights: DashboardInsights | null;
  initialForecast: RevenueForecast | null;
}) {
  const { showToast } = useToast();
  const [insights, setInsights] = useState(initialInsights);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [forecast, setForecast] = useState(initialForecast);
  const [loadingForecast, setLoadingForecast] = useState(false);

  async function refreshInsights() {
    setLoadingInsights(true);
    try {
      setInsights(await post<DashboardInsights>("/api/admin/ai/dashboard-insights"));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to generate insights", "error");
    } finally {
      setLoadingInsights(false);
    }
  }

  async function refreshForecast() {
    setLoadingForecast(true);
    try {
      setForecast(await post<RevenueForecast>("/api/admin/ai/revenue-forecast"));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to generate forecast", "error");
    } finally {
      setLoadingForecast(false);
    }
  }

  const forecastSeries = forecast
    ? [
        ...forecast.history.map((h) => ({ date: h.month, count: Math.round(h.revenue) })),
        ...forecast.forecast.map((f) => ({ date: f.month, count: Math.round(f.predictedRevenue) })),
      ]
    : [];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">AI Dashboard Insights</h2>
          <Button size="sm" variant="outline" onClick={refreshInsights} disabled={loadingInsights}>
            {loadingInsights ? "Generating…" : insights ? "Refresh" : "Generate"}
          </Button>
        </div>
        {insights ? (
          <div className="text-sm">
            <p className="font-medium text-foreground">{insights.headline}</p>
            {insights.insights.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
                {insights.insights.map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            )}
            {insights.risks.length > 0 && (
              <p className="mt-2 text-xs text-destructive">Risks: {insights.risks.join("; ")}</p>
            )}
            {insights.opportunities.length > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">Opportunities: {insights.opportunities.join("; ")}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No AI insights generated yet.</p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">AI Revenue Forecast</h2>
          <Button size="sm" variant="outline" onClick={refreshForecast} disabled={loadingForecast}>
            {loadingForecast ? "Forecasting…" : forecast ? "Refresh" : "Generate"}
          </Button>
        </div>
        {forecast ? (
          <>
            <LineChartCard title="Historical + Forecasted Revenue" data={forecastSeries} />
            <p className="mt-2 text-xs text-muted-foreground">{forecast.narrative}</p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">No forecast generated yet.</p>
        )}
      </div>
    </div>
  );
}
