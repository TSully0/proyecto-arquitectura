// data/repositories/activity.ts
// Datos y utilidades para el panel de administración (actividad e informes)

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned?: boolean;
  suspendedUntil?: number | string | null;
};

export type ActivityType = "post" | "comment" | "like" | "follow" | "moderation";

/* Acciones de moderación que quedan en el historial */
export type ModerationAction =
  | "ban"
  | "unban"
  | "suspend"
  | "unsuspend"
  | "review_delete"
  | "review_restore";

export type ActivityItem = {
  id: string;
  userId: string; // quien hizo la acción
  type: ActivityType;
  at: string;
  // Solo para type === "moderation" (los datos de ejemplo no los traen)
  action?: ModerationAction;
  actorName?: string;
  actorRole?: string;
  targetId?: string;
  targetName?: string;
  reason?: string;
  duration?: string; // por ejemplo "2 días"
};

const ACTIVITY_KEY = "app_activity";

/* =========================
   USUARIOS
========================= */
export const readUsers = (): AppUser[] => {
  try {
    const raw = localStorage.getItem("app_users");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getStatus = (u: AppUser, now: number) => {
  if (u.banned) return "BANEADO";
  if (u.suspendedUntil && new Date(u.suspendedUntil).getTime() > now) {
    return "SUSPENDIDO";
  }
  return "ACTIVO";
};

/* =========================
   ACTIVIDAD
========================= */
export const getActivity = (): ActivityItem[] => {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// 👉 llámala desde donde ocurra la acción real, por ejemplo:
//    logActivity(user.id, "comment")
export const logActivity = (userId: string, type: ActivityType) => {
  const items = getActivity();
  items.push({
    id: crypto.randomUUID(),
    userId,
    type,
    at: new Date().toISOString()
  });
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(items));
};

/* =========================
   HISTORIAL DE MODERACIÓN
========================= */
export type ModerationLogInput = {
  action: ModerationAction;
  targetId?: string;
  targetName?: string;
  reason?: string;
  duration?: string;
};

// Quien está logueado ahora (la sesión se guarda en localStorage "user")
const readSessionActor = (): { id: string; name: string; role: string } => {
  try {
    const raw = localStorage.getItem("user");
    const s = raw ? JSON.parse(raw) : null;
    if (s?.id) {
      return {
        id: String(s.id),
        name: String(s.name ?? "Desconocido"),
        role: String(s.role ?? "").toLowerCase().trim()
      };
    }
  } catch {
    /* sin sesión legible */
  }
  return { id: "desconocido", name: "Desconocido", role: "" };
};

// 👉 llámala cuando alguien banea, suspende, desbanea, elimina una reseña, etc.
export const logModeration = (input: ModerationLogInput) => {
  const actor = readSessionActor();
  const items = getActivity();
  items.push({
    id: crypto.randomUUID(),
    userId: actor.id,
    type: "moderation",
    at: new Date().toISOString(),
    actorName: actor.name,
    actorRole: actor.role,
    ...input
  });
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(items));
};

// Solo las acciones reales (sin los datos de ejemplo), la más reciente primero
export const getModerationLog = (): ActivityItem[] =>
  getActivity()
    .filter((i) => i.type === "moderation" && i.action)
    .sort((a, b) => b.at.localeCompare(a.at));

export const ACTION_LABELS: Record<ModerationAction, string> = {
  ban: "Baneo",
  unban: "Desbaneo",
  suspend: "Suspensión",
  unsuspend: "Suspensión quitada",
  review_delete: "Reseña eliminada",
  review_restore: "Reseña restaurada"
};

// Borra la actividad (publicaciones, comentarios, datos de ejemplo...), pero conserva
// el historial de moderación (items con "action"): es un registro que no debe perderse.
export const clearActivity = () => {
  const moderationLog = getActivity().filter(
    (item) => item.type === "moderation" && item.action
  );

  if (moderationLog.length === 0) {
    localStorage.removeItem(ACTIVITY_KEY);
    return;
  }

  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(moderationLog));
};

// datos de ejemplo para ver cómo luce el ranking
export const seedDemoActivity = (users: AppUser[]) => {
  const types: ActivityType[] = ["post", "comment", "like", "follow"];
  const items: ActivityItem[] = [];
  const rnd = (max: number) => Math.floor(Math.random() * max);

  users
    .filter((u) => u.role !== "admin")
    .forEach((u) => {
      types.forEach((type) => {
        const n = rnd(12);
        for (let i = 0; i < n; i++) {
          items.push({
            id: crypto.randomUUID(),
            userId: u.id,
            type,
            at: new Date().toISOString()
          });
        }
      });

      if (u.role === "moderator") {
        const n = 5 + rnd(20);
        for (let i = 0; i < n; i++) {
          items.push({
            id: crypto.randomUUID(),
            userId: u.id,
            type: "moderation",
            at: new Date().toISOString()
          });
        }
      }
    });

  localStorage.setItem(ACTIVITY_KEY, JSON.stringify([...getActivity(), ...items]));
};

/* =========================
   RANKING
========================= */
export type RankingRow = {
  user: AppUser;
  post: number;
  comment: number;
  like: number;
  follow: number;
  moderation: number;
  total: number;
};

export const buildRanking = (
  users: AppUser[],
  items: ActivityItem[]
): RankingRow[] => {
  const map = new Map<string, RankingRow>();

  users
    .filter((u) => u.role !== "admin")
    .forEach((u) =>
      map.set(u.id, {
        user: u,
        post: 0,
        comment: 0,
        like: 0,
        follow: 0,
        moderation: 0,
        total: 0
      })
    );

  items.forEach((i) => {
    const row = map.get(i.userId);
    if (row) {
      row[i.type] += 1;
      row.total += 1;
    }
  });

  return [...map.values()].sort((a, b) => b.total - a.total);
};

/* =========================
   DESCARGAR CSV
========================= */
export const downloadCSV = (filename: string, rows: (string | number)[][]) => {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

  // \uFEFF para que Excel muestre bien las tildes
  const csv = "\uFEFF" + rows.map((r) => r.map(escape).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
};