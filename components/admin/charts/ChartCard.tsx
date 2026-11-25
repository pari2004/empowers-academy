"use client";

import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import styles from "./ChartCard.module.css";

type Series = Array<{ date: string; count: number }>;

const AXIS_COLOR = "var(--adm-text-faint)";
const PRIMARY = "#4f46e5";
const PIE_COLORS = ["#4f46e5", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];

export function LineChartCard({ title, data }: { title: string; data: Series }) {
  return (
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--adm-border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: AXIS_COLOR }} tickFormatter={(d) => d.slice(5)} />
          <YAxis tick={{ fontSize: 11, fill: AXIS_COLOR }} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Line type="monotone" dataKey="count" stroke={PRIMARY} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChartCard({
  title,
  data,
  dataKey,
  nameKey,
}: {
  title: string;
  data: Array<Record<string, unknown>>;
  dataKey: string;
  nameKey: string;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--adm-border)" />
          <XAxis type="number" tick={{ fontSize: 11, fill: AXIS_COLOR }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey={nameKey}
            tick={{ fontSize: 11, fill: AXIS_COLOR }}
            width={140}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Bar dataKey={dataKey} fill={PRIMARY} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChartCard({
  title,
  data,
  dataKey,
  nameKey,
}: {
  title: string;
  data: Array<Record<string, unknown>>;
  dataKey: string;
  nameKey: string;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={50} outerRadius={80} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
