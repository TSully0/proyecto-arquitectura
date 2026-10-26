import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initialUsers } from "../../../data/repositories/users";
import "../../../styles/admin/admin-users.css";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "moderator" | "user";
};

type RoleFilter = "all" | "moderator" | "user";

const ROLE_FILTERS: { key: RoleFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "moderator", label: "Moderadores" },
  { key: "user", label: "Usuarios" }
];

export const AdminRolesPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem("app_users");
      return stored ? JSON.parse(stored) : initialUsers;
    } catch {
      return initialUsers;
    }
  });

  // 🔥 CAMBIAR ROL
  const handleChangeRole = (id: string, newRole: User["role"]) => {
    const updated = users.map((u) =>
      u.id === id ? { ...u, role: newRole } : u
    );

    setUsers(updated);
    localStorage.setItem("app_users", JSON.stringify(updated));
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

      {visibleUsers.length === 0 ? (
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
                    onClick={() => handleChangeRole(user.id, "moderator")}
                  >
                    Subir a Moderador
                  </button>
                )}

                {/* Bajar = quitar un permiso → rojo */}
                {user.role === "moderator" && (
                  <button
                    className="btn-demote"
                    onClick={() => handleChangeRole(user.id, "user")}
                  >
                    Bajar a Usuario
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