import type { User } from "../types/user";

type ManagedAccount = User & {
  banned?: boolean;
  suspendedUntil?: number | null;
  sanctionReason?: string;
  sanctionCategory?: string;
  suspensionLabel?: string;
};

/** Datos de la sanción para mostrarlos con detalle (motivo, tiempo...). */
export interface AccountBlockNotice {
  type: "ban" | "suspension";
  reason: string;
  category: string;
  /** Texto legible de la duración, por ejemplo "2 días". */
  label: string;
  /** Solo suspensiones: momento (ms) en que termina. */
  until: number | null;
}

const USERS_KEY = "app_users";
const SESSION_KEY = "user";
const ACCOUNT_STATUS_EVENT = "account-status-changed";
const DEFAULT_REASON = "Incumplimiento de las normas de la comunidad.";

function findAccount(sessionUser: User): ManagedAccount | null {
  try {
    const rawUsers = localStorage.getItem(USERS_KEY);
    if (!rawUsers) return null;

    const parsed: unknown = JSON.parse(rawUsers);
    if (!Array.isArray(parsed)) return null;

    return (
      (parsed as ManagedAccount[]).find(
        (item) => String(item.id) === String(sessionUser.id)
      ) ?? null
    );
  } catch (error) {
    console.error("No se pudo verificar el estado de la cuenta:", error);
    return null;
  }
}

export function isAccountBlocked(sessionUser: User): boolean {
  const current = findAccount(sessionUser);

  if (!current) return false;
  if (current.banned === true) return true;

  return Boolean(current.suspendedUntil && current.suspendedUntil > Date.now());
}

export function getAccountBlockNotice(
  sessionUser: User
): AccountBlockNotice | null {
  const current = findAccount(sessionUser);
  if (!current) return null;

  const reason = current.sanctionReason?.trim() || DEFAULT_REASON;
  const category = current.sanctionCategory?.trim() || "";

  if (current.banned) {
    return { type: "ban", reason, category: "", label: "", until: null };
  }

  if (current.suspendedUntil && current.suspendedUntil > Date.now()) {
    return {
      type: "suspension",
      reason,
      category,
      label: current.suspensionLabel?.trim() || "",
      until: current.suspendedUntil,
    };
  }

  return null;
}

export function getAccountBlockMessage(sessionUser: User): string {
  try {
    const rawUsers = localStorage.getItem(USERS_KEY);

    if (!rawUsers) return "Tu cuenta no está disponible.";

    if (!findAccount(sessionUser)) return "Tu cuenta no está disponible.";

    const notice = getAccountBlockNotice(sessionUser);
    if (!notice) return "";

    return notice.type === "ban"
      ? `Cuenta bloqueada permanentemente. Motivo: ${notice.reason}`
      : `Tu cuenta está suspendida temporalmente. Motivo: ${notice.reason}`;
  } catch {
    return "No se pudo verificar el estado de tu cuenta.";
  }
}

/**
 * Borra la sesión guardada SOLO si pertenece a la cuenta sancionada.
 * Las pestañas del mismo navegador comparten localStorage: si en otra
 * pestaña hay otra persona (por ejemplo un administrador), no se debe
 * borrar su sesión.
 */
function clearSessionIfOwnedBy(sessionUser: User): void {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const stored = raw ? JSON.parse(raw) : null;

    if (!stored || String(stored.id) === String(sessionUser.id)) {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Escucha cambios de sanciones y permite que la aplicación
 * cierre la sesión cuando la cuenta actual quede bloqueada.
 * El segundo argumento de onBlocked trae el detalle de la sanción.
 */
export function subscribeToAccountStatus(
  sessionUser: User,
  onBlocked: (message: string, notice: AccountBlockNotice | null) => void
): () => void {
  let handled = false;

  const checkStatus = () => {
    if (handled || !isAccountBlocked(sessionUser)) return;

    handled = true;

    const message = getAccountBlockMessage(sessionUser);
    const notice = getAccountBlockNotice(sessionUser);

    clearSessionIfOwnedBy(sessionUser);
    onBlocked(message || "Tu cuenta ya no tiene acceso.", notice);
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
    window.removeEventListener(ACCOUNT_STATUS_EVENT, handleCustomEvent);
  };
}