import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  TrendingUp,
  FileDown,
  LogOut
} from "lucide-react";

import type { User } from "../../business/types/user";
import "../../styles/admin-dashboard.css";

interface AdminLayoutProps {
  user: User;
  onLogout: () => void;
}

const MENU = [
  { to: "/admin", label: "Resumen", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Usuarios", icon: Users, end: false },
  { to: "/admin/roles", label: "Roles", icon: Shield, end: false },
  { to: "/admin/activity", label: "Actividad", icon: TrendingUp, end: false },
  { to: "/admin/reports", label: "Informes", icon: FileDown, end: false }
];

export function AdminLayout({ user, onLogout }: AdminLayoutProps) {
  return (
    <div className="admin-shell">

      {/* ========== MENÚ LATERAL ========== */}
      <aside className="admin-sidebar">

        <div className="admin-brand">
          Huecas Manabas
          <small>Panel de administración</small>
        </div>

        <div className="admin-user-box">
          <div className="admin-user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{user.name}</strong>
            <span>Administrador</span>
          </div>
        </div>

        <nav className="admin-nav">
          {MENU.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
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
