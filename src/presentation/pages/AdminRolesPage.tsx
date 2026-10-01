import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin-users.css"; 

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "moderator" | "user";
};

export const AdminRolesPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("app_users");
    if (stored) {
      setUsers(JSON.parse(stored));
    }
  }, []);

  // 🔥 CAMBIAR ROL
  const handleChangeRole = (id: string, newRole: User["role"]) => {
    const updated = users.map(u =>
      u.id === id ? { ...u, role: newRole } : u
    );

    setUsers(updated);
    localStorage.setItem("app_users", JSON.stringify(updated));
  };

  return (
    <div className="users-container">

      {/* BOTÓN ATRÁS */}
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <h1>🛡️ Gestión de Roles</h1>

      <div className="users-grid">
        {users.map(user => (
          <div key={user.id} className="user-card">

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
            </div>

            {/* 🔥 ACCIONES DE ROL */}
            <div className="user-actions">

              {user.role !== "moderator" && user.role !== "admin" && (
                <button
                  className="btn-ban"
                  onClick={() => handleChangeRole(user.id, "moderator")}
                >
                  Subir a Moderador
                </button>
              )}

              {user.role === "moderator" && (
                <button
                  className="btn-delete"
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
    </div>
  );
};