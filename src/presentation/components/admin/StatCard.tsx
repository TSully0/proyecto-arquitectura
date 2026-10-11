import type { ReactNode } from "react";

type Tone = "blue" | "brown" | "red" | "green";

interface StatCardProps {
  icon: ReactNode;
  tone: Tone;
  value: number | string;
  label: string;
}

export function StatCard({ icon, tone, value, label }: StatCardProps) {
  return (
    <div className="admin-stat-card">
      <div className={`admin-stat-icon ${tone}`}>{icon}</div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
