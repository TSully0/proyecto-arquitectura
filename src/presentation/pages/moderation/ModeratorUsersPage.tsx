import { AdminUsersPage } from "../admin/AdminUsersPage";

// Reutiliza la pantalla de usuarios del admin, pero en modo moderador:
// solo ve usuarios normales y solo puede suspender (no banear).
export const ModeratorUsersPage = () => {
  return <AdminUsersPage mode="moderator" />;
};