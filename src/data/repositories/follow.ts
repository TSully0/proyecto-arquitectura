import { supabase } from "../supabase";
import type { Follow } from "../../business/types/follow";

/*
  Seguidores en Supabase (tabla follows).
  Una fila = "follower_id sigue a following_id".
  status: "pending" (solicitud enviada) o "accepted" (ya se siguen).
*/

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string | null | undefined): value is string =>
  typeof value === "string" && UUID_RE.test(value);

type FollowRow = {
  id: string;
  follower_id: string;
  following_id: string;
  status: string;
  created_at: string;
};

const toFollow = (row: FollowRow): Follow => ({
  id: String(row.id),
  followerId: String(row.follower_id),
  followingId: String(row.following_id),
  status: row.status === "accepted" ? "accepted" : "pending",
  createdAt: String(row.created_at)
});

// Todas las relaciones donde participa esa persona (como seguidor o como seguida).
export async function fetchFollowsOf(userId: string): Promise<Follow[]> {
  if (!isUuid(userId)) return [];

  const { data, error } = await supabase
    .from("follows")
    .select("id, follower_id, following_id, status, created_at")
    .or(`follower_id.eq.${userId},following_id.eq.${userId}`);

  if (error) {
    throw new Error(`No se pudieron cargar los seguidores: ${error.message}`);
  }

  return (data ?? []).map((row) => toFollow(row as FollowRow));
}

// Envía la solicitud. Si ya existía, no hace nada.
export async function sendFollowRequest(
  followerId: string,
  followingId: string
): Promise<void> {
  const { error } = await supabase
    .from("follows")
    .insert([{ follower_id: followerId, following_id: followingId, status: "pending" }]);

  // 23505 = la relación ya existe
  if (error && error.code !== "23505") {
    throw new Error(`No se pudo enviar la solicitud: ${error.message}`);
  }
}

// Deja de seguir o cancela una solicitud pendiente.
export async function removeFollow(
  followerId: string,
  followingId: string
): Promise<void> {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  if (error) {
    throw new Error(`No se pudo actualizar el seguimiento: ${error.message}`);
  }
}

export async function acceptFollowRequest(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("follows")
    .update({ status: "accepted" })
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(`No se pudo aceptar la solicitud: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error("Esa solicitud ya no existe (quizá la cancelaron).");
  }
}

export async function rejectFollowRequest(id: string): Promise<void> {
  const { error } = await supabase.from("follows").delete().eq("id", id);

  if (error) {
    throw new Error(`No se pudo rechazar la solicitud: ${error.message}`);
  }
}

// Avisa cuando cambia cualquier relación (Realtime). Devuelve la función para dejar de escuchar.
export function subscribeToFollows(onChange: () => void): () => void {
  const channel = supabase
    .channel(`follows-${Math.random().toString(36).slice(2)}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "follows" },
      () => onChange()
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
