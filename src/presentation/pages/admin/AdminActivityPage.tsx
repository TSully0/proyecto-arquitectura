import { useEffect, useState } from "react";
import { fetchAdminUsers, fetchActivity, buildRanking } from "../../../data/repositories/activity";
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
  const [users, setUsers] = useState<AppUser[]>([]);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<RoleFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([fetchAdminUsers(), fetchActivity()]).then(([u, a]) => {
      if (!active) return;

      if (u === null || a === null) {
        setError("No se pudo cargar la actividad desde la base de datos.");
      }
      setUsers(u ?? []);
      setItems(a ?? []);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const ranking = buildRanking(users, items).filter(
    (r) => filter === "all" || r.user.role === filter
  );

  return (
    <div className="admin-page">
      <PageHeader
        title="📈 Actividad de la comunidad"
        subtitle="Ranking de usuarios y moderadores según sus acciones en la app"
      />

      <div className="admin-toolbar">
        <FilterTabs options={FILTERS} value={filter} onChange={setFilter} />
      </div>

      {error && (
        <p className="admin-empty" role="alert">
          {error}
        </p>
      )}

      <div className="admin-panel">
        {loading ? (
          <p className="admin-empty">Cargando…</p>
        ) : items.length === 0 ? (
          <p className="admin-empty">
            Todavía no hay actividad registrada. El ranking se irá llenando
            solo con las acciones de moderación y con la actividad de la
            comunidad.
          </p>
        ) : (
          <RankingTable rows={ranking} />
        )}
      </div>
    </div>
  );
}