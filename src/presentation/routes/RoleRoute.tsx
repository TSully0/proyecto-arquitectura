import { Navigate, Outlet, useLocation } from "react-router-dom";

type Role = "admin" | "moderator" | "user";

type Props = {
  allowedRoles: Role[];
};

export const RoleRoute = ({ allowedRoles }: Props) => {
  const location = useLocation();

  const rawUser = localStorage.getItem("user");

  if (!rawUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  let user: any;

  try {
    user = JSON.parse(rawUser);
  } catch {
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  const role = String(user?.role || "")
    .toLowerCase()
    .trim() as Role;

  // 🚫 acceso denegado
  if (!allowedRoles.includes(role)) {
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};