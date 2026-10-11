import { useState } from "react";
import { Download, Printer } from "lucide-react";

import {
  readUsers,
  getActivity,
  getStatus,
  buildRanking,
  downloadCSV
} from "../../data/repositories/activity";
import type { AppUser, ActivityItem } from "../../data/repositories/activity";

import { PageHeader } from "../components/admin/PageHeader";
import { ReportSheet } from "../components/admin/ReportSheet";
import { today } from "../components/admin/admin-utils";

export function AdminReportsPage() {
  const [users] = useState<AppUser[]>(readUsers);
  const [items] = useState<ActivityItem[]>(getActivity);
  const [now] = useState(() => Date.now());

  const ranking = buildRanking(users, items);
  const topActive = ranking.filter((r) => r.total > 0).slice(0, 5);

  const count = (role: string) => users.filter((u) => u.role === role).length;
  const banned = users.filter((u) => getStatus(u, now) === "BANEADO").length;
  const suspended = users.filter((u) => getStatus(u, now) === "SUSPENDIDO").length;

  const summary = [
    { label: "Usuarios registrados", value: users.length },
    { label: "Administradores", value: count("admin") },
    { label: "Moderadores", value: count("moderator") },
    { label: "Usuarios normales", value: count("user") },
    { label: "Baneados", value: banned },
    { label: "Suspendidos", value: suspended },
    { label: "Acciones registradas", value: items.length }
  ];

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
      <PageHeader
        title="📄 Informes"
        subtitle="Descarga o imprime la información de la plataforma"
      />

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

      {/* esto es lo que se imprime */}
      <ReportSheet
        title="Informe general – MantaCampus"
        summary={summary}
        topTitle="Top 5 más activos"
        top={topActive}
      />
    </div>
  );
}
