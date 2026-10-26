import { useEffect, useState } from "react";
import type { User } from "../../business/types/user";
import type { UserStatus } from "../components/admin/UserCard";
import type { ManagedUser, Role } from "../components/admin/user-types";

const USERS_KEY = "app_users";
const SESSION_KEY = "user";
const ACCOUNT_STATUS_EVENT = "account-status-changed";

function normalizeUsers(data: unknown): ManagedUser[] {
  if (!Array.isArray(data)) return [];

  return data.map((item): ManagedUser => {
    const user = item as Partial<ManagedUser>;

    return {
      ...user,
      id: String(user.id ?? ""),
      name: String(user.name ?? ""),
      email: String(user.email ?? ""),
      role: String(user.role ?? "user").toLowerCase().trim() as Role,
      banned: user.banned ?? false,
      suspendedUntil: user.suspendedUntil ?? null,
      sanctionReason: user.sanctionReason ?? "",
      sanctionCategory: user.sanctionCategory ?? "",
      suspensionLabel: user.suspensionLabel ?? "",
    } as ManagedUser;
  });
}

function readStoredUsers(): ManagedUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? normalizeUsers(JSON.parse(raw)) : [];
  } catch (error) {
    console.error("No se pudieron cargar los usuarios:", error);
    return [];
  }
}

/**
 * Lista de usuarios con sanciones: la lee de localStorage, la mantiene al día
 * (otras pestañas y el paso del tiempo) y la guarda avisando a las sesiones abiertas.
 */
export function useManagedUsers() {
  const [users, setUsers] = useState<ManagedUser[]>(readStoredUsers);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Actualizar suspensiones y estados periódicamente.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  // Sincronizar la lista si otra pestaña modifica app_users.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === USERS_KEY) {
        setUsers(readStoredUsers());
        setCurrentTime(Date.now());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Guardar los usuarios y notificar a las sesiones abiertas.
  const saveUsers = (updated: ManagedUser[]) => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(updated));

      setUsers(updated);
      setCurrentTime(Date.now());

      // Actualizar la sesión local si pertenece a una cuenta sancionada.
      const rawSession = localStorage.getItem(SESSION_KEY);

      if (rawSession) {
        try {
          const session = JSON.parse(rawSession) as User;

          const updatedSessionUser = updated.find(
            (item) => String(item.id) === String(session.id)
          );

          if (updatedSessionUser) {
            localStorage.setItem(
              SESSION_KEY,
              JSON.stringify({
                ...session,
                banned: updatedSessionUser.banned ?? false,
                suspendedUntil: updatedSessionUser.suspendedUntil ?? null,
                sanctionReason: updatedSessionUser.sanctionReason ?? "",
                sanctionCategory: updatedSessionUser.sanctionCategory ?? "",
                suspensionLabel: updatedSessionUser.suspensionLabel ?? "",
              })
            );
          }
        } catch (error) {
          console.error("No se pudo actualizar la sesión:", error);
        }
      }

      // El evento personalizado funciona dentro de esta misma pestaña.
      window.dispatchEvent(
        new CustomEvent(ACCOUNT_STATUS_EVENT, {
          detail: { users: updated },
        })
      );
    } catch (error) {
      console.error("No se pudieron guardar los usuarios:", error);

      window.alert(
        "No se pudieron guardar los cambios. Comprueba el almacenamiento del navegador."
      );
    }
  };

  const getStatus = (user: ManagedUser): UserStatus => {
    if (user.banned) return "BANEADO";

    if (user.suspendedUntil && user.suspendedUntil > currentTime) {
      return "SUSPENDIDO";
    }

    return "ACTIVO";
  };

  return { users, saveUsers, getStatus };
}
