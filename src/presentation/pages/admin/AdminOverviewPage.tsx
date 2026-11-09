import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Wrench, Ban, Activity, Shield, TrendingUp, FileDown } from "lucide-react";
import { fetchAdminUsers, fetchActivity, getStatus, buildRanking } from "../../../data/repositories/activity";
import type { AppUser, ActivityItem } from "../../../data/repositories/activity";
import { PageHeader } from "../../components/admin/PageHeader";
import { StatCard } from "../../components/admin/StatCard";
import { RecentModerationCard } from "../../components/admin/RecentModerationCard";
import { MEDALS } from "../../components/admin/admin-utils";

const LINKS = [
  { to: "/admin/users", icon: Users, title: "Gestión de usuarios", text: "Banear, suspender y buscar usuarios." },
  { to: "/admin/roles", icon: Shield, title: "Roles y permisos", text: "Subir o bajar moderadores." },
  { to: "/admin/activity", icon: TrendingUp, title: "Actividad", text: "Quiénes participan más en la app." },
  { to: "/admin/reports", icon: FileDown, title: "Informes", text: "Descargar reportes en CSV o PDF." }
];

// La tarjeta completa funciona como enlace, sin cambiar su aspecto.
const cardLinkStyle = {
  display: "block",
  color: "inherit",
  textDecoration: "none"
} as const;

export function AdminOverviewPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [now] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Todo sale de Supabase, así que se ve igual en cualquier navegador.
  useEffect(() => {
    let active = true;

    Promise.all([fetchAdminUsers(), fetchActivity()]).then(([u, a]) => {
      if (!active) return;

      if (u === null || a === null) setLoadError(true);
      setUsers(u ?? []);
      setItems(a ?? []);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const moderators = users.filter((u) => u.role === "moderator").length;
  const blocked = users.filter((u) => getStatus(u, now) !== "ACTIVO").length;
  const top3 = buildRanking(users, items).filter((r) => r.total > 0).slice(0, 3);

  return (
    <div className="admin-page">
      <PageHeader title="📊 Resumen general" subtitle="Vista rápida de MantaCampus" />

      {loadError && (
        <p className="admin-empty" role="alert">
          No se pudieron cargar todos los datos desde la base de datos.
        </p>
      )}
      {loading && <p className="admin-empty">Cargando…</p>}

      <div className="admin-stats">
        <StatCard tone="blue" icon={<Users size={20} />} value={users.length} label="Usuarios registrados" />
        <StatCard tone="brown" icon={<Wrench size={20} />} value={moderators} label="Moderadores" />

        {/* Lleva a Usuarios ya filtrado por baneados y suspendidos */}
        <Link
          to="/admin/users?estado=sancionados"
          style={cardLinkStyle}
          title="Ver usuarios baneados o suspendidos"
        >
          <StatCard tone="red" icon={<Ban size={20} />} value={blocked} label="Baneados o suspendidos" />
        </Link>

        <StatCard tone="green" icon={<Activity size={20} />} value={items.length} label="Acciones registradas" />
      </div>

      <div className="admin-panel">
        <h2>Accesos rápidos</h2>
        <div className="admin-links-grid">
          {LINKS.map((l) => {
            const Icon = l.icon;
            return (
              <Link key={l.to} to={l.to} className="admin-link-card">
                <Icon size={22} />
                <div>
                  <strong>{l.title}</strong>
                  <span>{l.text}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="admin-panel">
        <h2>🏆 Más activos</h2>
        {top3.length === 0 ? (
          <p className="admin-empty">
            Aún no hay actividad registrada. Mira la sección{" "}
            <Link to="/admin/activity">Actividad</Link>.
          </p>
        ) : (
          <div className="admin-top-list">
            {top3.map((r, i) => (
              <div key={r.user.id} className="admin-top-item">
                <span className="admin-medal">{MEDALS[i]}</span>
                <div>
                  <strong>{r.user.name}</strong>
                  <span>{r.user.role}</span>
                </div>
                <b>{r.total} acciones</b>
              </div>
            ))}
          </div>
        )}
      </div>

      <RecentModerationCard />
    </div>
  );
}