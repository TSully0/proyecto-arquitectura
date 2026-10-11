import { useState } from "react";
import { Trash2, Sparkles } from "lucide-react";

import {
  readUsers,
  getActivity,
  buildRanking,
  seedDemoActivity,
  clearActivity
} from "../../../data/repositories/activity";
import type { AppUser, ActivityItem } from "../../../data/repositories/activity";

import { PageHeader } from "../../components/admin/PageHeader";
import { FilterTabs } from "../../components/admin/FilterTabs";
import { RankingTable } from "../../components/admin/RankingTable";

type RoleFilter = "all" | "user" | "moderator";

const FILTERS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "user", label: "Usuarios" },
  { value: "moderator", label: "Moderadores" }
];

export function AdminActivityPage() {
  const [users] = useState<AppUser[]>(readUsers);
  const [items, setItems] = useState<ActivityItem[]>(getActivity);
  const [filter, setFilter] = useState<RoleFilter>("all");

  const ranking = buildRanking(users, items).filter(
    (r) => filter === "all" || r.user.role === filter
  );

  const handleSeed = () => {
    seedDemoActivity(users);
    setItems(getActivity());
  };

  const handleClear = () => {
    clearActivity();
    setItems([]);
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="📈 Actividad de la comunidad"
        subtitle="Ranking de usuarios y moderadores según sus acciones en la app"
      />

      <div className="admin-toolbar">
        <FilterTabs options={FILTERS} value={filter} onChange={setFilter} />

        <div className="admin-filters">
          <button className="admin-btn secondary" onClick={handleSeed}>
            <Sparkles size={16} /> Datos de ejemplo
          </button>
          {items.length > 0 && (
            <button className="admin-btn danger" onClick={handleClear}>
              <Trash2 size={16} /> Borrar actividad
            </button>
          )}
        </div>
      </div>

      <div className="admin-panel">
        {items.length === 0 ? (
          <p className="admin-empty">
            Todavía no hay actividad registrada. Pulsa "Datos de ejemplo" para
            ver cómo se vería el ranking.
          </p>
        ) : (
          <RankingTable rows={ranking} />
        )}
      </div>
    </div>
  );
}
