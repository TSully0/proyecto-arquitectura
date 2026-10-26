import type { Role, StatusFilter } from "./user-types";

interface UsersFiltersProps {
  /** El moderador no ve los filtros por rol. */
  isModerator: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: "all" | Role;
  onRoleChange: (value: "all" | Role) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  /** Cantidad de usuarios por estado, para mostrarla en cada botón. */
  counts: Record<StatusFilter, number>;
}

const ROLE_BUTTONS: { key: "all" | Role; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "admin", label: "Admin" },
  { key: "moderator", label: "Moderadores" },
  { key: "user", label: "Usuarios" },
];

const STATUS_BUTTONS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "ACTIVO", label: "Activos" },
  { key: "sanctioned", label: "Sancionados" },
  { key: "SUSPENDIDO", label: "Suspendidos" },
  { key: "BANEADO", label: "Baneados" },
];

/* Buscador + filtros por rol y por estado de la pantalla de usuarios. */
export const UsersFilters = ({
  isModerator,
  search,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
  counts,
}: UsersFiltersProps) => (
  <>
    <div className="users-toolbar">
      <input
        type="text"
        placeholder="Buscar por nombre o correo..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="search-input"
        aria-label="Buscar usuarios"
      />

      {!isModerator &&
        ROLE_BUTTONS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`filter-btn ${roleFilter === item.key ? "active" : ""}`}
            onClick={() => onRoleChange(item.key)}
          >
            {item.label}
          </button>
        ))}
    </div>

    <div
      className="users-toolbar users-status-toolbar"
      aria-label="Filtrar por estado"
    >
      <span className="users-status-label">Estado:</span>

      {STATUS_BUTTONS.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`filter-btn ${statusFilter === item.key ? "active" : ""}`}
          onClick={() => onStatusChange(item.key)}
        >
          {item.label} ({counts[item.key]})
        </button>
      ))}
    </div>
  </>
);
