import { Suspense, useState } from "react";
import { PageLoader } from "../../components/ui/PageLoader";
import { NavLink, Outlet } from "react-router-dom";
import { MessageSquare, Users, History, Home, LogOut } from "lucide-react";

import type { User } from "../../../business/types/user";
import "../../../styles/admin/admin-dashboard.css";
import "../../../styles/moderation/moderation-panel.css";

interface ModeratorLayoutProps {
  user: User;
  onLogout: () => void;
}

const MENU = [
  { to: "/moderacion", label: "Reseñas", icon: MessageSquare },
  { to: "/moderacion/usuarios", label: "Usuarios", icon: Users },
  { to: "/moderacion/historial", label: "Historial", icon: History },
  { to: "/", label: "Volver al Home", icon: Home }
];

const NOTE_KEY = "moderator_note_dismissed";

const readNoteDismissed = (): boolean => {
  try {
    return localStorage.getItem(NOTE_KEY) === "1";
  } catch {
    return false;
  }
};

// Mismo diseño que AdminLayout (reutiliza sus estilos), pero con el menú del moderador.
export function ModeratorLayout({ user, onLogout }: ModeratorLayoutProps) {
  // La nota de permisos se muestra hasta que el moderador la cierra.
  const [noteHidden, setNoteHidden] = useState(readNoteDismissed);

  const dismissNote = () => {
    setNoteHidden(true);
    try {
      localStorage.setItem(NOTE_KEY, "1");
    } catch {
      /* si no se puede guardar, solo se oculta en esta sesión */
    }
  };

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

        {!noteHidden && (
          <div
            role="note"
            style={{
              position: "relative",
              margin: "16px 4px 0",
              padding: "10px 28px 10px 12px",
              fontSize: "0.78rem",
              lineHeight: 1.4,
              borderRadius: 8,
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.75)"
            }}
          >
            <button
              type="button"
              onClick={dismissNote}
              aria-label="Cerrar nota"
              style={{
                position: "absolute",
                top: 4,
                right: 6,
                border: 0,
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
                fontSize: "1rem",
                lineHeight: 1
              }}
            >
              ×
            </button>
            Como moderador puedes <strong>suspender</strong> usuarios y
            revisar reseñas. El baneo permanente lo aplica un administrador.
          </div>
        )}

        <button className="admin-logout" onClick={onLogout}>
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </aside>

      {/* ========== CONTENIDO ========== */}
      <main className="admin-content">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

    </div>
  );
}