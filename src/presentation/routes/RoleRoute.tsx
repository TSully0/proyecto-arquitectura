import { Navigate, Outlet } from "react-router-dom";

type Role = "admin" | "moderator" | "user";

type Props = {
  allowedRoles: Role[];
};

export const RoleRoute = ({ allowedRoles }: Props) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // 🔐 no logueado
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 🚫 rol no permitido
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  // ✅ acceso permitido
  return <Outlet />;
};