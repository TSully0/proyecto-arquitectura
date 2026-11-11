import { useCallback, useEffect, useRef, useState } from "react";
import type { Follow } from "../../business/types/follow";
import type { FollowStatus } from "../../business/types/profile";
import type { User } from "../../business/types/user";
import { acceptFollowRequest, fetchFollowsOf, isUuid, rejectFollowRequest, removeFollow, sendFollowRequest, subscribeToFollows } from "../../data/repositories/follow";
import { getSupabaseUserId } from "../../data/repositories/places";

// El id de la sesión puede no ser el de Supabase (cuentas viejas): se busca por correo una vez.
const myIdCache = new Map<string, Promise<string | null>>();

const resolveMyId = (email: string): Promise<string | null> => {
  let cached = myIdCache.get(email);
  if (!cached) {
    cached = getSupabaseUserId(email).catch(() => null);
    myIdCache.set(email, cached);
  }
  return cached;
};

/*
  Todo lo de "seguir" en un solo lugar, contra Supabase.

    useFollows(user)            → mis relaciones (mi perfil)
    useFollows(user, otroId)    → las relaciones de otra persona (su perfil)

  statusOf(id)     → "none" | "pending" | "accepted"  (yo → esa persona)
  requestFrom(id)  → solicitud pendiente que ESA persona me envió (o null)
  incoming         → solicitudes pendientes que me enviaron (solo en mi perfil)
  follow / unfollow / accept / reject → acciones (lanzan error si algo falla)

  Se actualiza solo: Realtime, cada 10 s y al volver a la pestaña.
*/
export function useFollows(user: User, subjectId?: string) {
  const [myId, setMyId] = useState<string | null>(null);
  const [rows, setRows] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);

  const subject = subjectId ?? myId;
  const subjectRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void resolveMyId(user.email).then((id) => {
      if (!cancelled) setMyId(id);
    });
    return () => {
      cancelled = true;
    };
  }, [user.email]);

  const refresh = useCallback(async () => {
    const target = subjectRef.current;
    if (!target) return;

    try {
      const data = await fetchFollowsOf(target);
      if (subjectRef.current === target) setRows(data);
    } catch (err) {
      console.warn(err);
    } finally {
      if (subjectRef.current === target) setLoading(false);
    }
  }, []);

  useEffect(() => {
    subjectRef.current = isUuid(subject) ? subject : null;
    setRows([]);

    if (!subjectRef.current) {
      setLoading(false);
      return;
    }

    setLoading(true);
    void refresh();

    const stopListening = subscribeToFollows(() => void refresh());
    const timer = window.setInterval(() => void refresh(), 10000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      stopListening();
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [subject, refresh]);

  const followerIds = rows
    .filter((row) => row.followingId === subject && row.status === "accepted")
    .map((row) => row.followerId);

  const followingIds = rows
    .filter((row) => row.followerId === subject && row.status === "accepted")
    .map((row) => row.followingId);

  const followers = followerIds.length;
  const following = followingIds.length;

  const mine = (otherId: string) =>
    rows.find((row) => row.followerId === myId && row.followingId === otherId);

  const theirs = (otherId: string) =>
    rows.find((row) => row.followerId === otherId && row.followingId === myId);

  const statusOf = (otherId: string): FollowStatus => mine(otherId)?.status ?? "none";

  const requestFrom = (otherId: string): Follow | null => {
    const row = theirs(otherId);
    return row && row.status === "pending" ? row : null;
  };

  const followsMe = (otherId: string) => theirs(otherId)?.status === "accepted";

  const incoming =
    myId && subject === myId
      ? rows.filter((row) => row.followingId === myId && row.status === "pending")
      : [];

  const requireMyId = () => {
    if (!myId) {
      throw new Error("Tu cuenta todavía no está sincronizada con Supabase. Cierra sesión e inténtalo de nuevo.");
    }
    return myId;
  };

  return {
    loading,
    followers,
    following,
    followerIds,
    followingIds,
    incoming,
    statusOf,
    requestFrom,
    followsMe,
    follow: async (otherId: string) => {
      await sendFollowRequest(requireMyId(), otherId);
      await refresh();
    },
    unfollow: async (otherId: string) => {
      await removeFollow(requireMyId(), otherId);
      await refresh();
    },
    accept: async (requestId: string) => {
      await acceptFollowRequest(requestId);
      await refresh();
    },
    reject: async (requestId: string) => {
      await rejectFollowRequest(requestId);
      await refresh();
    }
  };
}