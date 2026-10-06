import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { AdminRolesPage } from "../pages/AdminRolesPage";
import { AdminUsersPage } from "../pages/AdminUsersPage";
import { AdminLayout } from "../pages/AdminLayout";                       // 👈 NUEVO
import { AdminOverviewPage, AdminActivityPage, AdminReportsPage } from "../pages/AdminSections";
import { ModerationPage } from "../pages/ModerationPage";
import { MyProfilePage } from "../pages/MyProfilePage";

import type { User } from "../../business/types/user";
import { RoleRoute } from "./RoleRoute";
import { MessengerWidget } from "../components/MessengerWidget";   // 👈 NUEVO

export const AppRouter = () => {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

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
     LOGIN
  ========================= */
  const handleLogin = (loggedInUser: User) => {
    const cleanUser: User = {
      ...loggedInUser,
      role: normalizeRole(loggedInUser.role) as User["role"],
    };

    localStorage.setItem("user", JSON.stringify(cleanUser));
    setUser(cleanUser);
  };

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            HOME (el admin NO entra aquí: va a su panel)
        ========================= */}
        <Route
          path="/"
          element={
            user ? (
              normalizeRole(user.role) === "admin" ? (
                <Navigate to="/admin" replace />          // 👈 CAMBIO
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
                onNavigateToRegister={() => (window.location.href = "/register")}
                onNavigateToForgotPassword={() =>
                  (window.location.href = "/forgot-password")
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
            <RegisterPage
              onNavigateToLogin={() => (window.location.href = "/login")}
            />
          }
        />

        {/* =========================
            FORGOT PASSWORD
        ========================= */}
        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordPage
              onBack={() => (window.location.href = "/login")}
            />
          }
        />

        {/* =========================
            RESET PASSWORD
        ========================= */}
        <Route
          path="/reset-password"
          element={
            <ResetPasswordPage
              onFinish={() => (window.location.href = "/login")}
            />
          }
        />

        {/* =========================
            PERFIL (solo user y moderator, el admin NO)
        ========================= */}
        <Route
          element={
            <RoleRoute allowedRoles={["user", "moderator"]} />
          }
        >
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
            MODERACIÓN (solo moderator)
        ========================= */}
        <Route
          element={
            <RoleRoute allowedRoles={["moderator"]} />
          }
        >
          <Route path="/moderacion" element={<ModerationPage />} />
        </Route>

        {/* =========================
            PANEL DE ADMIN (menú propio + subpáginas)  👈 NUEVO
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
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>

      {/* 💬 CHAT FLOTANTE (apagado hasta que se pulse el botón; el admin no lo usa) 👈 NUEVO */}
      {user && normalizeRole(user.role) !== "admin" && (
        <MessengerWidget key={user.id} me={user} />
      )}
    </BrowserRouter>
  );
};
