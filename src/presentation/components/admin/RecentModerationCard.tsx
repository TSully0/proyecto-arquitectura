import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ACTION_LABELS,
  getModerationLog,
  type ModerationAction
} from "../../../data/repositories/activity";
import "../../../styles/admin/admin-history.css";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("es-EC", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });

interface RecentModerationCardProps {
  /** Dirección de la página completa del historial. */
  historyPath?: string;
}

/* Las 5 acciones de moderación más recientes, para el Resumen. */
export const RecentModerationCard = ({
  historyPath = "/admin/history"
}: RecentModerationCardProps) => {
  const [recent] = useState(() => getModerationLog().slice(0, 5));

  return (
    <section className="admin-panel recent-card">
      <h2>🕘 Últimas acciones</h2>

      {recent.length === 0 ? (
        <p className="admin-empty">
          Aún no hay acciones de moderación. Aparecerán aquí cuando alguien
          banee o suspenda.
        </p>
      ) : (
        <ul className="recent-list">
          {recent.map((item) => {
            const action = item.action as ModerationAction;

            return (
              <li key={item.id} className={`recent-item ${action}`}>
                <span className="history-badge">{ACTION_LABELS[action]}</span>

                <span className="recent-text">
                  <strong>{item.actorName ?? "Desconocido"}</strong>
                  {item.targetName && <> → {item.targetName}</>}
                  {item.duration && <> · {item.duration}</>}
                </span>

                <time className="history-time" dateTime={item.at}>
                  {formatDate(item.at)}
                </time>
              </li>
            );
          })}
        </ul>
      )}

      <Link className="recent-more" to={historyPath}>
        Ver historial completo →
      </Link>
    </section>
  );
};
