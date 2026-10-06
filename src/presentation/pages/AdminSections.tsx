import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Wrench,
  Ban,
  Activity,
  Shield,
  TrendingUp,
  FileDown,
  Download,
  Printer,
  Trash2,
  Sparkles
} from "lucide-react";

import {
  readUsers,
  getActivity,
  getStatus,
  buildRanking,
  seedDemoActivity,
  clearActivity,
  downloadCSV
} from "../../data/repositories/activity";
import type { AppUser, ActivityItem } from "../../data/repositories/activity";

const MEDALS = ["🥇", "🥈", "🥉"];
const today = () => new Date().toISOString().slice(0, 10);

/* =====================================================
   1) RESUMEN
===================================================== */
export function AdminOverviewPage() {
  const [users] = useState<AppUser[]>(readUsers);
  const [items] = useState<ActivityItem[]>(getActivity);
  const [now] = useState(() => Date.now());

  const moderators = users.filter((u) => u.role === "moderator").length;
  const blocked = users.filter((u) => getStatus(u, now) !== "ACTIVO").length;
  const top3 = buildRanking(users, items).filter((r) => r.total > 0).slice(0, 3);

  const links = [
    { to: "/admin/users", icon: Users, title: "Gestión de usuarios", text: "Banear, suspender y buscar usuarios." },
    { to: "/admin/roles", icon: Shield, title: "Roles y permisos", text: "Subir o bajar moderadores." },
    { to: "/admin/activity", icon: TrendingUp, title: "Actividad", text: "Quiénes participan más en la app." },
    { to: "/admin/reports", icon: FileDown, title: "Informes", text: "Descargar reportes en CSV o PDF." }
  ];

  return (
    <div className="admin-page">
      <h1>📊 Resumen general</h1>
      <p className="admin-subtitle">Vista rápida de MantaCampus</p>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue"><Users size={20} /></div>
          <strong>{users.length}</strong>
          <span>Usuarios registrados</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon brown"><Wrench size={20} /></div>
          <strong>{moderators}</strong>
          <span>Moderadores</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon red"><Ban size={20} /></div>
          <strong>{blocked}</strong>
          <span>Baneados o suspendidos</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon green"><Activity size={20} /></div>
          <strong>{items.length}</strong>
          <span>Acciones registradas</span>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Accesos rápidos</h2>
        <div className="admin-links-grid">
          {links.map((l) => {
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
    </div>
  );
}

/* =====================================================
   2) ACTIVIDAD (quién participa más)
===================================================== */
type RoleFilter = "all" | "user" | "moderator";

export function AdminActivityPage() {
  const [users] = useState<AppUser[]>(readUsers);
  const [items, setItems] = useState<ActivityItem[]>(getActivity);
  const [filter, setFilter] = useState<RoleFilter>("all");

  const ranking = buildRanking(users, items).filter(
    (r) => filter === "all" || r.user.role === filter
  );
  const max = Math.max(1, ...ranking.map((r) => r.total));

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
      <h1>📈 Actividad de la comunidad</h1>
      <p className="admin-subtitle">
        Ranking de usuarios y moderadores según sus acciones en la app
      </p>

      <div className="admin-toolbar">
        <div className="admin-filters">
          <button
            className={`admin-filter ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Todos
          </button>
          <button
            className={`admin-filter ${filter === "user" ? "active" : ""}`}
            onClick={() => setFilter("user")}
          >
            Usuarios
          </button>
          <button
            className={`admin-filter ${filter === "moderator" ? "active" : ""}`}
            onClick={() => setFilter("moderator")}
          >
            Moderadores
          </button>
        </div>

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
          <div className="rank-table-wrap">
            <table className="rank-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Publicaciones</th>
                  <th>Comentarios</th>
                  <th>Likes</th>
                  <th>Seguidos</th>
                  <th>Moderadas</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, i) => (
                  <tr key={r.user.id}>
                    <td>{MEDALS[i] ?? i + 1}</td>
                    <td>
                      <div className="rank-user">
                        <div className="rank-avatar">
                          {r.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{r.user.name}</strong>
                          <span>{r.user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className={`pill ${r.user.role}`}>{r.user.role}</span></td>
                    <td>{r.post}</td>
                    <td>{r.comment}</td>
                    <td>{r.like}</td>
                    <td>{r.follow}</td>
                    <td>{r.moderation}</td>
                    <td>
                      <div className="rank-total">
                        <div className="rank-bar">
                          <div
                            className="rank-bar-fill"
                            style={{ width: `${(r.total / max) * 100}%` }}
                          />
                        </div>
                        <b>{r.total}</b>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   3) INFORMES (descargar)
===================================================== */
export function AdminReportsPage() {
  const [users] = useState<AppUser[]>(readUsers);
  const [items] = useState<ActivityItem[]>(getActivity);
  const [now] = useState(() => Date.now());

  const ranking = buildRanking(users, items);

  const count = (role: string) => users.filter((u) => u.role === role).length;
  const banned = users.filter((u) => getStatus(u, now) === "BANEADO").length;
  const suspended = users.filter((u) => getStatus(u, now) === "SUSPENDIDO").length;

  const downloadUsers = () =>
    downloadCSV(`usuarios-${today()}.csv`, [
      ["ID", "Nombre", "Correo", "Rol", "Estado"],
      ...users.map((u) => [u.id, u.name, u.email, u.role, getStatus(u, now)])
    ]);

  const downloadActivity = () =>
    downloadCSV(`actividad-${today()}.csv`, [
      ["Posición", "Nombre", "Correo", "Rol", "Publicaciones", "Comentarios", "Likes", "Seguidos", "Moderadas", "Total"],
      ...ranking.map((r, i) => [
        i + 1,
        r.user.name,
        r.user.email,
        r.user.role,
        r.post,
        r.comment,
        r.like,
        r.follow,
        r.moderation,
        r.total
      ])
    ]);

  return (
    <div className="admin-page">
      <h1>📄 Informes</h1>
      <p className="admin-subtitle">Descarga o imprime la información de la plataforma</p>

      <div className="admin-actions-row no-print">
        <button className="admin-btn" onClick={downloadUsers}>
          <Download size={16} /> Usuarios (CSV)
        </button>
        <button className="admin-btn" onClick={downloadActivity}>
          <Download size={16} /> Actividad (CSV)
        </button>
        <button className="admin-btn secondary" onClick={() => window.print()}>
          <Printer size={16} /> Imprimir / Guardar PDF
        </button>
      </div>

      {/* VISTA PREVIA DEL INFORME (esto es lo que se imprime) */}
      <div className="admin-panel report-sheet">
        <h2>Informe general – MantaCampus</h2>
        <p className="admin-subtitle">Generado el {new Date().toLocaleDateString("es-EC")}</p>

        <table className="rank-table">
          <tbody>
            <tr><td>Usuarios registrados</td><td><b>{users.length}</b></td></tr>
            <tr><td>Administradores</td><td><b>{count("admin")}</b></td></tr>
            <tr><td>Moderadores</td><td><b>{count("moderator")}</b></td></tr>
            <tr><td>Usuarios normales</td><td><b>{count("user")}</b></td></tr>
            <tr><td>Baneados</td><td><b>{banned}</b></td></tr>
            <tr><td>Suspendidos</td><td><b>{suspended}</b></td></tr>
            <tr><td>Acciones registradas</td><td><b>{items.length}</b></td></tr>
          </tbody>
        </table>

        <h2 style={{ marginTop: 24 }}>Top 5 más activos</h2>
        {ranking.filter((r) => r.total > 0).length === 0 ? (
          <p className="admin-empty">Sin actividad registrada todavía.</p>
        ) : (
          <table className="rank-table">
            <thead>
              <tr><th>#</th><th>Nombre</th><th>Rol</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {ranking
                .filter((r) => r.total > 0)
                .slice(0, 5)
                .map((r, i) => (
                  <tr key={r.user.id}>
                    <td>{i + 1}</td>
                    <td>{r.user.name}</td>
                    <td>{r.user.role}</td>
                    <td><b>{r.total}</b></td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
