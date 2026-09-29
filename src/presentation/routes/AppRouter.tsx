import { BrowserRouter, Routes, Route } from "react-router-dom";

import { HomePage } from "../HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { AdminPanelModal } from "../components/AdminPanelModal";
import { AdminUsersPage } from "../pages/AdminUsersPage";
import { ModerationPage } from "../pages/ModerationPage";

import { RoleRoute } from "./RoleRoute";

// páginas simples
const Perfil = () => <div>Perfil Usuario</div>;

export const AppRouter = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleLogin = (u: any) => {
    localStorage.setItem("user", JSON.stringify(u));
    window.location.href = "/";
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* 🌐 HOME */}
        <Route
          path="/"
          element={
            user ? (
              <HomePage user={user} onLogout={handleLogout} />
            ) : (
              <LoginPage
                onNavigateToRegister={() => (window.location.href = "/register")}
                onLoginSuccess={handleLogin}
              />
            )
          }
        />

        {/* 🔐 LOGIN */}
        <Route
          path="/login"
          element={
            <LoginPage
              onNavigateToRegister={() => (window.location.href = "/register")}
              onLoginSuccess={handleLogin}
            />
          }
        />

        {/* 📝 REGISTER */}
        <Route
          path="/register"
          element={
            <RegisterPage
              onNavigateToLogin={() => (window.location.href = "/login")}
            />
          }
        />

        {/* 👤 PERFIL */}
        <Route element={<RoleRoute allowedRoles={["user", "admin", "moderator"]} />}>
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        {/* 🛠️ MODERACIÓN */}
        <Route element={<RoleRoute allowedRoles={["admin", "moderator"]} />}>
          <Route path="/moderacion" element={<ModerationPage />} />
        </Route>

        {/* 👑 ADMIN PANEL (MODAL) */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route
            path="/admin"
            element={
              user ? (
                <AdminPanelModal
                  isOpen={true}
                  type="admin"
                  user={user}
                  onClose={() => (window.location.href = "/")}
                />
              ) : (
                <div>No autorizado</div>
              )
            }
          />
        </Route>

        {/* 👥 GESTIÓN DE USUARIOS */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};