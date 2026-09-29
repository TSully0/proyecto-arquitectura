import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin-users.css";

type Role = "admin" | "moderator" | "user";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  banned?: boolean;
};

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Role>("all");

  const navigate = useNavigate();

  // 🔥 cargar usuarios (FIX)
  useEffect(() => {
    const stored = localStorage.getItem("app_users");

    if (stored) {
      const parsed = JSON.parse(stored);

      const safeUsers: User[] = parsed.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as Role,
        banned: u.banned ?? false,
      }));

      setUsers(safeUsers);
    }
  }, []);

  // 💾 guardar helper
  const saveUsers = (updated: User[]) => {
    setUsers(updated);
    localStorage.setItem("app_users", JSON.stringify(updated));
  };

  // 🚫 banear
  const handleBan = (id: string) => {
    const updated: User[] = users.map((u) =>
      u.id === id ? { ...u, banned: !u.banned } : u
    );
    saveUsers(updated);
  };

  // ❌ eliminar
  const handleDelete = (id: string) => {
    const updated: User[] = users.filter((u) => u.id !== id);
    saveUsers(updated);
  };

  // ⬆ user → moderator
  const handlePromote = (id: string) => {
    const updated: User[] = users.map((u) => {
      if (u.id === id && u.role === "user") {
        return { ...u, role: "moderator" };
      }
      return u;
    });
    saveUsers(updated);
  };

  // ⬇ moderator → user
  const handleDemote = (id: string) => {
    const updated: User[] = users.map((u) => {
      if (u.id === id && u.role === "moderator") {
        return { ...u, role: "user" };
      }
      return u;
    });
    saveUsers(updated);
  };

  // 🔍 filtro + búsqueda
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchFilter = filter === "all" ? true : u.role === filter;

    return matchSearch && matchFilter;
  });

  return (
    <div className="users-container">

      {/* 🔙 BACK */}
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <h1>👥 Gestión de Usuarios</h1>

      {/* 🔍 TOOLBAR */}
      <div className="users-toolbar">

        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Todos
        </button>

        <button
          className={`filter-btn ${filter === "admin" ? "active" : ""}`}
          onClick={() => setFilter("admin")}
        >
          Admin
        </button>

        <button
          className={`filter-btn ${filter === "moderator" ? "active" : ""}`}
          onClick={() => setFilter("moderator")}
        >
          Moderadores
        </button>

        <button
          className={`filter-btn ${filter === "user" ? "active" : ""}`}
          onClick={() => setFilter("user")}
        >
          Usuarios
        </button>

      </div>

      {/* GRID */}
      <div className="users-grid">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className={`user-card ${user.banned ? "banned" : ""}`}
          >

            <div className="user-header">
              <div className="avatar">
                {user.name.charAt(0)}
              </div>

              <div>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </div>
            </div>

            <div className="user-info">
              <span className={`role ${user.role}`}>
                {user.role}
              </span>

              {user.banned && (
                <span className="status banned">
                  BANEADO
                </span>
              )}
            </div>

            <div className="user-actions">

              {user.role === "user" && (
                <button
                  className="btn-promote"
                  onClick={() => handlePromote(user.id)}
                >
                  ⬆ Hacer Moderador
                </button>
              )}

              {user.role === "moderator" && (
                <button
                  className="btn-demote"
                  onClick={() => handleDemote(user.id)}
                >
                  ⬇ Quitar Moderador
                </button>
              )}

              <button
                className="btn-ban"
                onClick={() => handleBan(user.id)}
              >
                {user.banned ? "Desbanear" : "Banear"}
              </button>

              <button
                className="btn-delete"
                onClick={() => handleDelete(user.id)}
              >
                Eliminar
              </button>

            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <p className="empty">No se encontraron usuarios</p>
      )}

    </div>
  );
};