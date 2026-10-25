import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Routes, Route, useNavigate } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { AdminRolesPage } from "../pages/admin/AdminRolesPage";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage";
import { AdminLayout } from "../pages/admin/AdminLayout";
import { AdminOverviewPage, AdminActivityPage, AdminReportsPage } from "../pages/admin/AdminSections";
import { ModerationPage } from "../pages/moderation/ModerationPage";
import { ModeratorLayout } from "../pages/moderation/ModeratorLayout";
import { ModeratorUsersPage } from "../pages/moderation/ModeratorUsersPage";
import { MyProfilePage } from "../pages/MyProfilePage";
import type { User } from "../../business/types/user";
import { RoleRoute } from "./RoleRoute";
import { MessengerWidget } from "../components/chat/MessengerWidget";
import { subscribeToAccountStatus } from "../../business/services/accountStatus";
import { useAuth } from "../auth/AuthContext";

/* =========================
   NORMALIZAR ROL
========================= */
const normalizeRole = (role: string) =>
  String(role || "").toLowerCase().trim();

/* =========================
   LANDING SEGÚN ROL
========================= */
const getLandingPath = (role?: string) => {
  const r = normalizeRole(role || "");

  if (r === "admin") return "/admin";
  if (r === "moderator") return "/moderacion";
  return "/";
};

/* =========================
   RUTAS (usa useNavigate, por eso va DENTRO de BrowserRouter)
========================= */
const AppRoutes = () => {
  const navigate = useNavigate();

  // La sesión ahora vive en AuthContext (única fuente de verdad).
  const { user, login, logout } = useAuth();

  // Mensaje que se muestra cuando una cuenta es baneada o suspendida.
  const [blockMessage, setBlockMessage] = useState("");

  /* =========================
     DETECTAR BANEOS / SUSPENSIONES CON LA SESIÓN ABIERTA
     (también comprueba al cargar la página, por ejemplo con F5)
  ========================= */
  useEffect(() => {
    if (!user) return;

    return subscribeToAccountStatus(user, (message) => {
      setBlockMessage(message);
      logout();
      navigate("/login", { replace: true });
    });
  }, [user, navigate, logout]);

  // Ocultar el aviso automáticamente después de 12 segundos.
  useEffect(() => {
    if (!blockMessage) return;

    const timer = window.setTimeout(() => setBlockMessage(""), 12_000);
    return () => window.clearTimeout(timer);
  }, [blockMessage]);

  /* =========================
     LOGIN
  ========================= */
  const handleLogin = (loggedInUser: User) => {
    setBlockMessage("");
    login(loggedInUser); // el contexto normaliza el rol y guarda la sesión
  };

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <Routes>
        {/* =========================
            HOME (el admin NO entra aquí: va a su panel)
        ========================= */}
        <Route
          path="/"
          element={
            user ? (
              normalizeRole(user.role) === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <HomePage user={user} onLogout={handleLogout} />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* =========================
            LOGIN
        ========================= */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={getLandingPath(user.role)} replace />
            ) : (
              <LoginPage
                onLoginSuccess={handleLogin}
                onNavigateToRegister={() => navigate("/register")}
                onNavigateToForgotPassword={() =>
                  navigate("/forgot-password")
                }
              />
            )
          }
        />

        {/* =========================
            REGISTER
        ========================= */}
        <Route
          path="/register"
          element={
            <RegisterPage onNavigateToLogin={() => navigate("/login")} />
          }
        />

        {/* =========================
            FORGOT PASSWORD
        ========================= */}
        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordPage onBack={() => navigate("/login")} />
          }
        />

        {/* =========================
            RESET PASSWORD
        ========================= */}
        <Route
          path="/reset-password"
          element={
            <ResetPasswordPage onFinish={() => navigate("/login")} />
          }
        />

        {/* =========================
            PERFIL (solo user y moderator, el admin NO)
        ========================= */}
        <Route element={<RoleRoute allowedRoles={["user", "moderator"]} />}>
          <Route
            path="/perfil"
            element={
              user ? (
                <MyProfilePage user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Route>

        {/* =========================
            PANEL DE MODERACIÓN (solo moderator, menú propio como el del admin)
        ========================= */}
        <Route element={<RoleRoute allowedRoles={["moderator"]} />}>
          <Route
            path="/moderacion"
            element={
              user ? (
                <ModeratorLayout user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<ModerationPage />} />
            <Route path="usuarios" element={<ModeratorUsersPage />} />
          </Route>
        </Route>

        {/* =========================
            PANEL DE ADMIN (menú propio + subpáginas)
        ========================= */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route
            path="/admin"
            element={
              user ? (
                <AdminLayout user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="roles" element={<AdminRolesPage />} />
            <Route path="activity" element={<AdminActivityPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
          </Route>
        </Route>

        {/* =========================
            FALLBACK
        ========================= */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate to={getLandingPath(user.role)} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>

      {/* 💬 CHAT FLOTANTE (el admin no lo usa) */}
      {user && normalizeRole(user.role) !== "admin" && (
        <MessengerWidget key={user.id} me={user} />
      )}

      {/* Aviso de cuenta baneada o suspendida (se ve sobre el login) */}
      {blockMessage && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: "min(92%, 520px)",
            padding: "14px 18px",
            borderRadius: 10,
            background: "#fff1f0",
            color: "#a12622",
            border: "1px solid #f0b8b5",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          <button
            type="button"
            onClick={() => setBlockMessage("")}
            aria-label="Cerrar mensaje"
            style={{
              float: "right",
              marginLeft: 12,
              border: 0,
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ×
          </button>
          {blockMessage}
        </div>
      )}
    </>
  );
};

/* =========================
   EXPORT: sigue llamándose AppRouter, así App.tsx NO cambia
========================= */
export const AppRouter = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);