import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { useState } from "react";

import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { AdminPanelModal } from "../components/AdminPanelModal";
import { AdminRolesPage } from "../pages/AdminRolesPage";
import { AdminUsersPage } from "../pages/AdminUsersPage";
import { ModerationPage } from "../pages/ModerationPage";

import type { User } from "../../business/types/user";
import { RoleRoute } from "./RoleRoute";

const Perfil = () => <div>Perfil Usuario</div>;

export const AppRouter = () => {
  // ✅ estado reactivo (IMPORTANTE)
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  // 🔥 limpiar rol
  const normalizeRole = (role: string) =>
    String(role || "").toLowerCase().trim();

  const getLandingPath = (role?: string) => {
    const r = normalizeRole(role || "");

    if (r === "admin") return "/admin";
    if (r === "moderator") return "/moderacion";
    return "/";
  };

  // ✅ LOGIN
  const handleLogin = (loggedInUser: User) => {
    const cleanUser: User = {
      ...loggedInUser,
      role: normalizeRole(loggedInUser.role) as User["role"],
    };

    localStorage.setItem("user", JSON.stringify(cleanUser));
    setUser(cleanUser);

    window.location.href = getLandingPath(cleanUser.role);
  };

  // ✅ LOGOUT (CORRECTO)
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);

    window.location.href = "/login";
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={
            user ? (
              <HomePage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* LOGIN */}
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

        {/* REGISTER */}
        <Route
          path="/register"
          element={
            <RegisterPage
              onNavigateToLogin={() => (window.location.href = "/login")}
            />
          }
        />

        {/* PERFIL */}
        <Route
          element={
            <RoleRoute allowedRoles={["user", "admin", "moderator"]} />
          }
        >
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        {/* MODERACIÓN */}
        <Route
          element={
            <RoleRoute allowedRoles={["admin", "moderator"]} />
          }
        >
          <Route path="/moderacion" element={<ModerationPage />} />
        </Route>

        {/* ADMIN */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route
            path="/admin"
            element={
              user ? (
                <AdminPanelModal
                  isOpen={true}
                  type="admin"
                  user={user}   // ✅ seguro porque user nunca es null aquí
                  onClose={() => (window.location.href = "/")}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Route>

        {/* USERS */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/roles" element={<AdminRolesPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};