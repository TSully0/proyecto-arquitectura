
import type { User } from "../types/user";

type ManagedAccount = User & {
  banned?: boolean;
  suspendedUntil?: number | null;
  sanctionReason?: string;
};

const USERS_KEY = "app_users";
const SESSION_KEY = "user";
const ACCOUNT_STATUS_EVENT = "account-status-changed";

export function isAccountBlocked(sessionUser: User): boolean {
  try {
    const rawUsers = localStorage.getItem(USERS_KEY);

    if (!rawUsers) return false;

    const parsed: unknown = JSON.parse(rawUsers);

    if (!Array.isArray(parsed)) return false;

    const users = parsed as ManagedAccount[];

    const current = users.find(
      (item) => String(item.id) === String(sessionUser.id)
    );

    if (!current) return false;

    if (current.banned === true) return true;

    return Boolean(
      current.suspendedUntil &&
      current.suspendedUntil > Date.now()
    );
  } catch (error) {
    console.error("No se pudo verificar el estado de la cuenta:", error);
    return false;
  }
}

export function getAccountBlockMessage(sessionUser: User): string {
  try {
    const rawUsers = localStorage.getItem(USERS_KEY);

    if (!rawUsers) return "Tu cuenta no está disponible.";

    const users = JSON.parse(rawUsers) as ManagedAccount[];

    const current = users.find(
      (item) => String(item.id) === String(sessionUser.id)
    );

    if (!current) return "Tu cuenta no está disponible.";

    const reason = current.sanctionReason?.trim();

    if (current.banned) {
      return reason
        ? `Cuenta bloqueada permanentemente. Motivo: ${reason}`
        : "Tu cuenta está bloqueada permanentemente.";
    }

    if (
      current.suspendedUntil &&
      current.suspendedUntil > Date.now()
    ) {
      return reason
        ? `Tu cuenta está suspendida temporalmente. Motivo: ${reason}`
        : "Tu cuenta está suspendida temporalmente.";
    }

    return "";
  } catch {
    return "No se pudo verificar el estado de tu cuenta.";
  }
}

/**
 * Escucha cambios de sanciones y permite que la aplicación
 * cierre la sesión cuando la cuenta actual quede bloqueada.
 */
export function subscribeToAccountStatus(
  sessionUser: User,
  onBlocked: (message: string) => void
): () => void {
  let handled = false;

  const checkStatus = () => {
    if (handled || !isAccountBlocked(sessionUser)) return;

    handled = true;

    const message = getAccountBlockMessage(sessionUser);

    localStorage.removeItem(SESSION_KEY);
    onBlocked(message || "Tu cuenta ya no tiene acceso.");
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === USERS_KEY) {
      checkStatus();
    }
  };

  const handleCustomEvent = () => {
    checkStatus();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(ACCOUNT_STATUS_EVENT, handleCustomEvent);

  // Comprobar también al iniciar la suscripción.
  checkStatus();

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("account-status-changed", handleCustomEvent);
  };
}