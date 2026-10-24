import { NavLink, Outlet } from "react-router-dom";
import { MessageSquare, Home, LogOut } from "lucide-react";

import type { User } from "../../../business/types/user";
import "../../../styles/admin/admin-dashboard.css";
import "../../../styles/moderation/moderation-panel.css";

interface ModeratorLayoutProps {
  user: User;
  onLogout: () => void;
}

const MENU = [
  { to: "/moderacion", label: "Reseñas", icon: MessageSquare },
  { to: "/", label: "Volver al Home", icon: Home }
];

// Mismo diseño que AdminLayout (reutiliza sus estilos), pero con el menú del moderador.
export function ModeratorLayout({ user, onLogout }: ModeratorLayoutProps) {
  return (
    <div className="admin-shell">

      {/* ========== MENÚ LATERAL ========== */}
      <aside className="admin-sidebar">

        <div className="admin-brand">
          Huecas Manabas
          <small>Panel de moderación</small>
        </div>

        <div className="admin-user-box">
          <div className="admin-user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{user.name}</strong>
            <span>Moderador</span>
          </div>
        </div>

        <nav className="admin-nav">
          {MENU.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  "admin-nav-item" + (isActive ? " active" : "")
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <button className="admin-logout" onClick={onLogout}>
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </aside>

      {/* ========== CONTENIDO ========== */}
      <main className="admin-content">
        <Outlet />
      </main>

    </div>
  );
}