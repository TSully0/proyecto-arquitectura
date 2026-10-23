import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type Role = "admin" | "moderator" | "user";

type Props = {
  allowedRoles: Role[];
};

export const RoleRoute = ({ allowedRoles }: Props) => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = String(user.role || "").toLowerCase().trim() as Role;

  // Solo redirige, no borra la sesión.
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};