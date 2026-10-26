import { useMemo, useState } from "react";
import {
  ACTION_LABELS,
  downloadCSV,
  getModerationLog,
  type ModerationAction
} from "../../../data/repositories/activity";
import "../../../styles/admin/admin-history.css";

type Filter = "all" | ModerationAction;
type DateMode = "all" | "today" | "7d" | "30d" | "day" | "month";

const DATE_MODES: { key: DateMode; label: string }[] = [
  { key: "all", label: "Todas las fechas" },
  { key: "today", label: "Hoy" },
  { key: "7d", label: "Últimos 7 días" },
  { key: "30d", label: "Últimos 30 días" },
  { key: "day", label: "Elegir un día" },
  { key: "month", label: "Elegir un mes" }
];

const DAY_MS = 24 * 60 * 60 * 1000;

// Fecha local como "2026-10-25" (no en UTC, para que "hoy" sea tu hoy)
const toLocalDay = (iso: string) => {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Todo" },
  { key: "ban", label: "Baneos" },
  { key: "unban", label: "Desbaneos" },
  { key: "suspend", label: "Suspensiones" },
  { key: "unsuspend", label: "Suspensión quitada" },
  { key: "review_delete", label: "Reseñas" }
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  moderator: "Moderador",
  user: "Usuario"
};

/* Historial de acciones de moderación. Lo usan el admin y el moderador. */
export const AdminHistoryPage = () => {
  const [log] = useState(getModerationLog);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [dateMode, setDateMode] = useState<DateMode>("all");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();
    const today = toLocalDay(new Date(now).toISOString());

    return log.filter((item) => {
      const action = item.action as ModerationAction;
      const matchesFilter =
        filter === "all" ||
        action === filter ||
        (filter === "review_delete" && action === "review_restore");

      const matchesSearch =
        !q ||
        [item.actorName, item.targetName, item.reason]
          .filter(Boolean)
          .some((t) => String(t).toLowerCase().includes(q));

      const at = new Date(item.at).getTime();
      const itemDay = toLocalDay(item.at);

      let matchesDate = true;
      if (dateMode === "today") matchesDate = itemDay === today;
      else if (dateMode === "7d") matchesDate = now - at <= 7 * DAY_MS;
      else if (dateMode === "30d") matchesDate = now - at <= 30 * DAY_MS;
      else if (dateMode === "day") matchesDate = !day || itemDay === day;
      else if (dateMode === "month") matchesDate = !month || itemDay.startsWith(month);

      return matchesFilter && matchesSearch && matchesDate;
    });
  }, [log, filter, search, dateMode, day, month]);

  const resetDates = () => {
    setDateMode("all");
    setDay("");
    setMonth("");
  };

  const handleCSV = () => {
    downloadCSV("historial-moderacion.csv", [
      ["Fecha", "Acción", "Hecha por", "Rol", "Afectado", "Duración", "Motivo"],
      ...visible.map((i) => [
        formatDate(i.at),
        ACTION_LABELS[i.action as ModerationAction],
        i.actorName ?? "",
        ROLE_LABEL[i.actorRole ?? ""] ?? i.actorRole ?? "",
        i.targetName ?? "",
        i.duration ?? "",
        i.reason ?? ""
      ])
    ]);
  };

  return (
    <div className="history-page">
      <div className="history-head">
        <div>
          <h1>🕘 Historial de acciones</h1>
          <p className="history-subtitle">
            Cada baneo, suspensión y eliminación queda registrado con quién lo
            hizo, cuándo y por qué.
          </p>
        </div>

        <button
          type="button"
          className="history-csv"
          onClick={handleCSV}
          disabled={visible.length === 0}
        >
          Descargar CSV
        </button>
      </div>

      <div className="history-toolbar">
        <input
          type="text"
          className="history-search"
          placeholder="Buscar por persona o motivo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar en el historial"
        />

        <div className="history-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`history-filter ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="history-dates">
          <span className="history-dates-label">Fecha:</span>

          <select
            className="history-select"
            value={dateMode}
            onChange={(e) => setDateMode(e.target.value as DateMode)}
            aria-label="Filtrar por fecha"
          >
            {DATE_MODES.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>

          {dateMode === "day" && (
            <input
              type="date"
              className="history-date-input"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              aria-label="Elegir un día"
            />
          )}

          {dateMode === "month" && (
            <input
              type="month"
              className="history-date-input"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              aria-label="Elegir un mes"
            />
          )}

          {dateMode !== "all" && (
            <button type="button" className="history-clear-dates" onClick={resetDates}>
              Quitar fecha
            </button>
          )}
        </div>
      </div>

      {log.length > 0 && (
        <p className="history-count">
          Mostrando {visible.length} de {log.length} acciones
        </p>
      )}

      {visible.length === 0 ? (
        <p className="history-empty">
          {log.length === 0
            ? "Todavía no hay acciones registradas. Aparecerán aquí cuando alguien banee o suspenda."
            : "No hay acciones con ese filtro."}
        </p>
      ) : (
        <ul className="history-list">
          {visible.map((item) => {
            const action = item.action as ModerationAction;

            return (
              <li key={item.id} className={`history-item ${action}`}>
                <span className="history-badge">{ACTION_LABELS[action]}</span>

                <div className="history-body">
                  <p className="history-line">
                    <strong>{item.actorName ?? "Desconocido"}</strong>
                    {item.actorRole && (
                      <em> ({ROLE_LABEL[item.actorRole] ?? item.actorRole})</em>
                    )}
                    {item.targetName && (
                      <>
                        {" → "}
                        <strong>{item.targetName}</strong>
                      </>
                    )}
                    {item.duration && (
                      <span className="history-duration"> · {item.duration}</span>
                    )}
                  </p>

                  {item.reason && (
                    <p className="history-reason">Motivo: {item.reason}</p>
                  )}
                </div>

                <time className="history-time" dateTime={item.at}>
                  {formatDate(item.at)}
                </time>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
