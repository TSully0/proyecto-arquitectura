import type { User } from "../types/user";

// Regla de negocio: cada usuario puede cambiar su nombre una vez cada 7 días.
// (Por ahora guarda en localStorage; cuando reunamos el acceso a datos,
//  estas tres escrituras pasan a un repositorio.)

const COOLDOWN_DAYS = 7;

const cooldownKey = (userId: string) => `last_name_change_${userId}`;

// días que faltan para poder cambiar el nombre (0 = ya puede)
export const daysLeftToChangeName = (userId: string): number => {
  const last = localStorage.getItem(cooldownKey(userId));
  if (!last) return 0;

  const passed =
    (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);

  return passed >= COOLDOWN_DAYS ? 0 : Math.ceil(COOLDOWN_DAYS - passed);
};

export type NameChangeResult =
  | { ok: true }
  | { ok: false; message: string };

export const changeUserName = (user: User, newName: string): NameChangeResult => {
  const cleanName = newName.trim();

  if (!cleanName) {
    return { ok: false, message: "El nombre no puede estar vacío" };
  }

  if (cleanName === user.name) {
    return { ok: false, message: "Ese ya es tu nombre actual" };
  }

  const daysLeft = daysLeftToChangeName(user.id);
  if (daysLeft > 0) {
    return {
      ok: false,
      message: `Podrás cambiar tu nombre de nuevo en ${daysLeft} día${daysLeft === 1 ? "" : "s"}`
    };
  }

  // 1) sesión actual
  localStorage.setItem("user", JSON.stringify({ ...user, name: cleanName }));

  // 2) "base de datos" de usuarios (el login lee de aquí)
  try {
    const raw = localStorage.getItem("app_users");
    const users: User[] = raw ? JSON.parse(raw) : [];
    const synced = users.map((u) =>
      u.id === user.id ? { ...u, name: cleanName } : u
    );
    localStorage.setItem("app_users", JSON.stringify(synced));
  } catch {
    /* si falla, la sesión igual queda actualizada */
  }

  // 3) fecha del último cambio, por usuario
  localStorage.setItem(cooldownKey(user.id), new Date().toISOString());

  return { ok: true };
};
