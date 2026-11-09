// data/repositories/activity.ts
// Datos y utilidades para el panel de administración (actividad e informes).
// Todo se guarda en Supabase: usuarios, actividad e historial de moderación.

import { supabase } from "../supabase";
import { fetchManagedUsers } from "./sanctions";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned?: boolean;
  suspendedUntil?: number | string | null;
};

// Tipos que guarda la tabla user_activity (más "moderation", que sale de moderation_log)
export type ActivityType = "review" | "like" | "favorite" | "moderation";

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

/* =========================
   USUARIOS (desde Supabase)
========================= */
// null en la lista = no se pudo consultar; las pantallas muestran el aviso.
export const fetchAdminUsers = async (): Promise<AppUser[] | null> => {
  const users = await fetchManagedUsers();
  if (!users) return null;

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    banned: u.banned,
    suspendedUntil: u.suspendedUntil ?? null
  }));
};

export const getStatus = (u: AppUser, now: number) => {
  if (u.banned) return "BANEADO";
  if (u.suspendedUntil && new Date(u.suspendedUntil).getTime() > now) {
    return "SUSPENDIDO";
  }
  return "ACTIVO";
};

/* =========================
   AYUDAS DE LECTURA
========================= */
const PAGE = 1000; // Supabase devuelve como máximo 1000 filas por consulta

type Row = Record<string, unknown>;

// Lee una tabla completa por páginas.
const fetchAllRows = async (
  table: string,
  columns: string,
  orderBy: string
): Promise<Row[] | null> => {
  const all: Row[] = [];

  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order(orderBy, { ascending: false })
      .range(from, from + PAGE - 1);

    if (error || !data) {
      console.warn(`No se pudo leer ${table}:`, error);
      return null;
    }

    all.push(...(data as unknown as Row[]));
    if (data.length < PAGE) return all;
  }
};

/* =========================
   ACTIVIDAD
========================= */
// Actividad de la comunidad + acciones de moderación (cuentan para el ranking).
export const fetchActivity = async (): Promise<ActivityItem[] | null> => {
  const [activity, moderation] = await Promise.all([
    fetchAllRows("user_activity", "id, userId, type, createdAt", "createdAt"),
    fetchAllRows(
      "moderation_log",
      "id, actorId, action, createdAt",
      "createdAt"
    )
  ]);

  if (!activity || !moderation) return null;

  return [
    ...activity.map(
      (r): ActivityItem => ({
        id: String(r.id),
        userId: String(r.userId),
        type: r.type as ActivityType,
        at: String(r.createdAt)
      })
    ),
    ...moderation.map(
      (r): ActivityItem => ({
        id: String(r.id),
        userId: String(r.actorId),
        type: "moderation",
        at: String(r.createdAt)
      })
    )
  ];
};

// 👉 llámala desde donde ocurra la acción real, por ejemplo:
//    logActivity(user.id, "review")
export const logActivity = async (userId: string, type: ActivityType) => {
  const { error } = await supabase
    .from("user_activity")
    .insert({ userId, type });

  if (error) console.warn("No se pudo registrar la actividad:", error);
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
export const logModeration = async (input: ModerationLogInput): Promise<boolean> => {
  const actor = readSessionActor();

  const { error } = await supabase.from("moderation_log").insert({
    action: input.action,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    targetId: input.targetId ?? null,
    targetName: input.targetName ?? null,
    reason: input.reason ?? null,
    duration: input.duration ?? null
  });

  if (error) {
    console.warn("No se pudo guardar el historial de moderación:", error);
    return false;
  }

  return true;
};

// Solo las acciones reales (sin los datos de ejemplo), la más reciente primero
export const fetchModerationLog = async (): Promise<ActivityItem[] | null> => {
  const rows = await fetchAllRows(
    "moderation_log",
    "id, action, actorId, actorName, actorRole, targetId, targetName, reason, duration, createdAt",
    "createdAt"
  );

  if (!rows) return null;

  return rows.map(
    (r): ActivityItem => ({
      id: String(r.id),
      userId: String(r.actorId),
      type: "moderation",
      at: String(r.createdAt),
      action: r.action as ModerationAction,
      actorName: String(r.actorName ?? ""),
      actorRole: String(r.actorRole ?? ""),
      targetId: r.targetId ? String(r.targetId) : undefined,
      targetName: r.targetName ? String(r.targetName) : undefined,
      reason: r.reason ? String(r.reason) : undefined,
      duration: r.duration ? String(r.duration) : undefined
    })
  );
};

export const ACTION_LABELS: Record<ModerationAction, string> = {
  ban: "Baneo",
  unban: "Desbaneo",
  suspend: "Suspensión",
  unsuspend: "Suspensión quitada",
  review_delete: "Reseña eliminada",
  review_restore: "Reseña restaurada"
};

/* =========================
   RANKING
========================= */
export type RankingRow = {
  user: AppUser;
  review: number;
  like: number;
  favorite: number;
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
        review: 0,
        like: 0,
        favorite: 0,
        moderation: 0,
        total: 0
      })
    );

  items.forEach((i) => {
    const row = map.get(i.userId);
    // Un tipo desconocido se ignora, así el total siempre es la suma de las columnas
    if (row && typeof row[i.type] === "number") {
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