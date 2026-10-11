import type { Follow } from "../../business/types/follow";
import type { FollowStatus } from "../../business/types/profile";

// Seguimientos guardados en localStorage (clave app_follows).
// OJO: el archivo follow.ts que ya existía en esta carpeta no se usa;
// este es el que usa la app ahora. Más adelante se pueden unir.

const FOLLOWS_KEY = "app_follows";

export const readFollows = (): Follow[] => {
  try {
    const raw = localStorage.getItem(FOLLOWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeFollows = (data: Follow[]) =>
  localStorage.setItem(FOLLOWS_KEY, JSON.stringify(data));

// ¿cómo está mi relación con esa persona?
export const getFollowStatus = (
  follows: Follow[],
  followerId: string,
  targetId: string
): FollowStatus => {
  const status = follows.find(
    (f) => f.followerId === followerId && f.followingId === targetId
  )?.status;

  if (status === "accepted") return "accepted";
  if (status === "pending") return "pending";
  return "none";
};

// enviar solicitud (si ya existe alguna relación, no hace nada)
export const sendFollowRequest = (followerId: string, followingId: string): Follow[] => {
  const current = readFollows();

  const exists = current.some(
    (f) => f.followerId === followerId && f.followingId === followingId
  );
  if (exists) return current;

  const newFollow: Follow = {
    id: crypto.randomUUID(),
    followerId,
    followingId,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  const updated = [...current, newFollow];
  writeFollows(updated);
  return updated;
};

// dejar de seguir o cancelar una solicitud pendiente
export const removeFollow = (followerId: string, followingId: string): Follow[] => {
  const updated = readFollows().filter(
    (f) => !(f.followerId === followerId && f.followingId === followingId)
  );

  writeFollows(updated);
  return updated;
};
