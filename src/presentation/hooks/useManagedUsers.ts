import { useCallback, useEffect, useRef, useState } from "react";
import type { UserStatus } from "../components/admin/UserCard";
import type { ManagedUser } from "../components/admin/user-types";
import { banUserInSupabase, fetchManagedUsers, liftBanInSupabase, liftSuspensionInSupabase, subscribeToSanctions, suspendUserInSupabase } from "../../data/repositories/sanctions";

type SuspensionData = {
  reason: string;
  category: string;
  label: string;
  until: number;
};

/**
 * Lista de usuarios con sus sanciones, leída de Supabase.
 * Se mantiene al día sola: escucha los cambios en tiempo real, al volver a la
 * pestaña y cada cierto tiempo, así que dos navegadores ven lo mismo.
 */
export function useManagedUsers() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const mounted = useRef(true);

  const reload = useCallback(async () => {
    const loaded = await fetchManagedUsers();
    if (!mounted.current) return;

    if (loaded === null) {
      setLoadError("No se pudieron cargar los usuarios desde la base de datos.");
    } else {
      setUsers(loaded);
      setLoadError("");
    }

    setCurrentTime(Date.now());
    setLoading(false);
  }, []);

  useEffect(() => {
    mounted.current = true;
    reload();

    // Cambios hechos desde cualquier navegador.
    const unsubscribe = subscribeToSanctions(() => {
      reload();
    });

    // Respaldo por si el tiempo real no está activado en Supabase.
    const refresh = window.setInterval(reload, 15_000);
    const tick = window.setInterval(() => setCurrentTime(Date.now()), 30_000);

    window.addEventListener("focus", reload);

    return () => {
      mounted.current = false;
      unsubscribe();
      window.clearInterval(refresh);
      window.clearInterval(tick);
      window.removeEventListener("focus", reload);
    };
  }, [reload]);

  // Cada acción guarda primero en Supabase y luego vuelve a leer la lista.
  const run = useCallback(
    async (action: () => Promise<boolean>) => {
      const ok = await action();
      if (ok) await reload();
      return ok;
    },
    [reload]
  );

  const banUser = (id: string, reason: string) =>
    run(() => banUserInSupabase(id, reason));

  const suspendUser = (id: string, data: SuspensionData) =>
    run(() => suspendUserInSupabase(id, data));

  const liftBan = (id: string, liftedBy: string) =>
    run(() => liftBanInSupabase(id, liftedBy));

  const liftSuspension = (id: string, liftedBy: string) =>
    run(() => liftSuspensionInSupabase(id, liftedBy));

  const getStatus = (user: ManagedUser): UserStatus => {
    if (user.banned) return "BANEADO";

    if (user.suspendedUntil && user.suspendedUntil > currentTime) {
      return "SUSPENDIDO";
    }

    return "ACTIVO";
  };

  return {
    users,
    loading,
    loadError,
    getStatus,
    reload,
    banUser,
    suspendUser,
    liftBan,
    liftSuspension,
  };
}