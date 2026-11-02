import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllUsersFromSupabase,
  updateRoleInSupabase,
  type DbUser
} from "../../../data/repositories/users";
import "../../../styles/admin/admin-users.css";

type User = DbUser;

type RoleFilter = "all" | "moderator" | "user";

const ROLE_FILTERS: { key: RoleFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "moderator", label: "Moderadores" },
  { key: "user", label: "Usuarios" }
];

// Mantiene la copia local (app_users) con el mismo rol que la base de datos.
const syncLocalRole = (email: string, role: User["role"]) => {
  try {
    const raw = localStorage.getItem("app_users");
    if (!raw) return;

    const target = email.trim().toLowerCase();
    const users = JSON.parse(raw) as { email?: string }[];

    localStorage.setItem(
      "app_users",
      JSON.stringify(
        users.map((u) =>
          (u.email || "").trim().toLowerCase() === target ? { ...u, role } : u
        )
      )
    );
  } catch {
    /* si falla la copia local, la base de datos ya quedó actualizada */
  }
};

export const AdminRolesPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Los usuarios salen de la tabla users de Supabase.
  useEffect(() => {
    let active = true;

    fetchAllUsersFromSupabase().then((loaded) => {
      if (!active) return;

      if (loaded === null) {
        setLoadError("No se pudieron cargar los usuarios desde la base de datos.");
      } else {
        setUsers(loaded);
      }

      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  // 🔥 CAMBIAR ROL (primero en Supabase)
  const handleChangeRole = async (target: User, newRole: "moderator" | "user") => {
    if (savingId) return;

    setActionError("");
    setSavingId(target.id);

    const saved = await updateRoleInSupabase(target.id, newRole);

    setSavingId(null);

    if (!saved) {
      setActionError(
        `No se pudo cambiar el rol de ${target.name} en la base de datos. Inténtalo de nuevo.`
      );
      return;
    }

    setUsers((previous) =>
      previous.map((u) => (u.id === target.id ? { ...u, role: newRole } : u))
    );
    syncLocalRole(target.email, newRole);
  };

  // 🔎 Búsqueda por nombre o correo + filtro por rol
  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return users.filter((u) => {
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="users-container">
      {/* BOTÓN ATRÁS */}
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <h1>🛡️ Gestión de Roles</h1>

      {/* BUSCADOR Y FILTROS */}
      <div className="users-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar usuarios"
        />

        <div className="users-toolbar" style={{ marginBottom: 0 }}>
          {ROLE_FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`filter-btn ${roleFilter === item.key ? "active" : ""}`}
              onClick={() => setRoleFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <p className="empty" role="alert" style={{ color: "#c0392b" }}>
          {actionError}
        </p>
      )}

      {loading ? (
        <p className="empty">Cargando usuarios...</p>
      ) : loadError ? (
        <p className="empty" role="alert" style={{ color: "#c0392b" }}>
          {loadError}
        </p>
      ) : visibleUsers.length === 0 ? (
        <p className="empty">No se encontró ningún usuario con ese filtro.</p>
      ) : (
        <div className="users-grid">
          {visibleUsers.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-header">
                <div className="avatar">{user.name.charAt(0)}</div>

                <div>
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                </div>
              </div>

              <div className="user-info">
                <span className={`role ${user.role}`}>{user.role}</span>
              </div>

              {/* 🔥 ACCIONES DE ROL */}
              <div className="user-actions">
                {/* Subir = algo bueno → verde */}
                {user.role !== "moderator" && user.role !== "admin" && (
                  <button
                    className="btn-promote"
                    disabled={savingId === user.id}
                    onClick={() => handleChangeRole(user, "moderator")}
                  >
                    {savingId === user.id ? "Guardando..." : "Subir a Moderador"}
                  </button>
                )}

                {/* Bajar = quitar un permiso → rojo */}
                {user.role === "moderator" && (
                  <button
                    className="btn-demote"
                    disabled={savingId === user.id}
                    onClick={() => handleChangeRole(user, "user")}
                  >
                    {savingId === user.id ? "Guardando..." : "Bajar a Usuario"}
                  </button>
                )}

                {user.role === "admin" && (
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    Admin no editable
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};