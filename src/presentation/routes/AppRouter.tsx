import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Routes, Route, useNavigate } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { MyProfilePage } from "../pages/MyProfilePage";
import type { User } from "../../business/types/user";
import { RoleRoute } from "./RoleRoute";
import { MessengerWidget } from "../components/chat/MessengerWidget";
import {
  subscribeToAccountStatus,
  type AccountBlockNotice,
} from "../../business/services/accountStatus";
import { AccountBlockToast } from "./AccountBlockToast";
import { useAuth } from "../auth/AuthContext";
import { PageLoader } from "../components/ui/PageLoader";

/* =========================
   PANELES CON CARGA PEREZOSA
   Se descargan solo cuando alguien entra a ellos, así los usuarios
   normales no bajan el código de admin ni de moderación.
========================= */
const AdminLayout = lazy(() =>
  import("../pages/admin/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);
const AdminOverviewPage = lazy(() =>
  import("../pages/admin/AdminSections").then((m) => ({ default: m.AdminOverviewPage }))
);
const AdminActivityPage = lazy(() =>
  import("../pages/admin/AdminSections").then((m) => ({ default: m.AdminActivityPage }))
);
const AdminReportsPage = lazy(() =>
  import("../pages/admin/AdminSections").then((m) => ({ default: m.AdminReportsPage }))
);
const AdminUsersPage = lazy(() =>
  import("../pages/admin/AdminUsersPage").then((m) => ({ default: m.AdminUsersPage }))
);
const AdminRolesPage = lazy(() =>
  import("../pages/admin/AdminRolesPage").then((m) => ({ default: m.AdminRolesPage }))
);
const AdminHistoryPage = lazy(() =>
  import("../pages/admin/AdminHistoryPage").then((m) => ({ default: m.AdminHistoryPage }))
);
const ModeratorLayout = lazy(() =>
  import("../pages/moderation/ModeratorLayout").then((m) => ({ default: m.ModeratorLayout }))
);
const ModerationPage = lazy(() =>
  import("../pages/moderation/ModerationPage").then((m) => ({ default: m.ModerationPage }))
);
const ModeratorUsersPage = lazy(() =>
  import("../pages/moderation/ModeratorUsersPage").then((m) => ({ default: m.ModeratorUsersPage }))
);

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
  const [blockNotice, setBlockNotice] = useState<AccountBlockNotice | null>(null);

  /* =========================
     DETECTAR BANEOS / SUSPENSIONES CON LA SESIÓN ABIERTA
     (también comprueba al cargar la página, por ejemplo con F5)
  ========================= */
  useEffect(() => {
    if (!user) return;

    return subscribeToAccountStatus(user, (message, notice) => {
      setBlockMessage(message);
      setBlockNotice(notice);
      logout();
      navigate("/login", { replace: true });
    });
  }, [user, navigate, logout]);

  // Ocultar el aviso automáticamente después de 12 segundos.
  useEffect(() => {
    if (!blockMessage) return;

    // Con detalle y cuenta regresiva se deja más tiempo en pantalla.
    const timer = window.setTimeout(() => {
      setBlockMessage("");
      setBlockNotice(null);
    }, blockNotice ? 30_000 : 12_000);
    return () => window.clearTimeout(timer);
  }, [blockMessage, blockNotice]);

  /* =========================
     LOGIN
  ========================= */
  const handleLogin = (loggedInUser: User) => {
    setBlockMessage("");
    setBlockNotice(null);
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
      <Suspense fallback={<PageLoader />}>
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
            <Route path="historial" element={<AdminHistoryPage />} />
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
            <Route path="history" element={<AdminHistoryPage />} />
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
      </Suspense>

      {/* 💬 CHAT FLOTANTE (el admin no lo usa) */}
      {user && normalizeRole(user.role) !== "admin" && (
        <MessengerWidget key={user.id} me={user} />
      )}

      {/* Aviso de cuenta baneada o suspendida (se ve sobre el login) */}
      {blockMessage && (
        <AccountBlockToast
          message={blockMessage}
          notice={blockNotice}
          onClose={() => {
            setBlockMessage("");
            setBlockNotice(null);
          }}
        />
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