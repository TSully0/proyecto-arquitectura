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

export type ActivityItem = {
  id: string;
  userId: string;
  type: ActivityType;
  at: string;
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

export const clearActivity = () => localStorage.removeItem(ACTIVITY_KEY);

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
