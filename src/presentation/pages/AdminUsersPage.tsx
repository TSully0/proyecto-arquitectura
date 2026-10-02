import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin-users.css";

type Role = "admin" | "moderator" | "user";

type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  banned?: boolean;
  suspendedUntil?: number | null; // ✅ FIX
};

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Role>("all");

  const navigate = useNavigate();

  // 🔥 cargar usuarios
  useEffect(() => {
    const stored = localStorage.getItem("app_users");

    if (stored) {
      const parsed = JSON.parse(stored);

      const safeUsers: User[] = parsed.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role as Role,
        banned: u.banned ?? false,
        suspendedUntil: u.suspendedUntil ?? null,
      }));

      setUsers(safeUsers);
    }
  }, []);

  // 💾 guardar
  const saveUsers = (updated: User[]) => {
    setUsers(updated);
    localStorage.setItem("app_users", JSON.stringify(updated));
  };

  // 🚫 BAN PERMANENTE
  const handleBan = (id: string) => {
    const updated: User[] = users.map((u) =>
      u.id === id ? { ...u, banned: true, suspendedUntil: null } : u
    );
    saveUsers(updated);
  };

  // 🔓 DESBANEAR
  const handleUnban = (id: string) => {
    const updated: User[] = users.map((u) =>
      u.id === id ? { ...u, banned: false } : u
    );
    saveUsers(updated);
  };

  // ⏳ SUSPENDER
  const handleSuspend = (id: string, hours: number) => {
    const until = Date.now() + hours * 60 * 60 * 1000;

    const updated: User[] = users.map((u) =>
      u.id === id
        ? { ...u, suspendedUntil: until, banned: false }
        : u
    );

    saveUsers(updated);
  };

  // 🔓 QUITAR SUSPENSIÓN
  const handleUnsuspend = (id: string) => {
    const updated: User[] = users.map((u) =>
      u.id === id ? { ...u, suspendedUntil: null } : u
    );
    saveUsers(updated);
  };

  // 🔍 filtro
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchFilter = filter === "all" ? true : u.role === filter;

    return matchSearch && matchFilter;
  });

  // 🔥 estado del usuario
  const getStatus = (user: User) => {
    if (user.banned) return "BANEADO";

    if (user.suspendedUntil && user.suspendedUntil > Date.now()) {
      return "SUSPENDIDO";
    }

    return "ACTIVO";
  };

  return (
    <div className="users-container">

      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <h1>👥 Gestión de Usuarios</h1>

      <div className="users-toolbar">

        <input
          type="text"
          placeholder="Buscar..."
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

      <div className="users-grid">
        {filteredUsers.map((user) => {

          const status = getStatus(user);

          return (
            <div
              key={user.id}
              className={`user-card ${status.toLowerCase()}`}
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

                <span className={`status ${status.toLowerCase()}`}>
                  {status}
                </span>
              </div>

              <div className="user-actions">

                {user.role !== "admin" && (
                  <>
                    {!user.banned ? (
                      <button
                        className="btn-ban"
                        onClick={() => handleBan(user.id)}
                      >
                        Banear permanente
                      </button>
                    ) : (
                      <button
                        className="btn-unban"
                        onClick={() => handleUnban(user.id)}
                      >
                        Desbanear
                      </button>
                    )}

                    {status !== "SUSPENDIDO" ? (
                      <>
                        <button
                          className="btn-suspend"
                          onClick={() => handleSuspend(user.id, 1)}
                        >
                          Suspender 1h
                        </button>

                        <button
                          className="btn-suspend"
                          onClick={() => handleSuspend(user.id, 24)}
                        >
                          Suspender 24h
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-unsuspend"
                        onClick={() => handleUnsuspend(user.id)}
                      >
                        Quitar suspensión
                      </button>
                    )}
                  </>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <p className="empty">No se encontraron usuarios</p>
      )}

    </div>
  );
};