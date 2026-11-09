import type { User } from "../types/user";
import {
  fetchSanctionOf,
  subscribeToSanctions,
  type SanctionFields,
} from "../../data/repositories/sanctions";

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

const SESSION_KEY = "user";
const DEFAULT_REASON = "Incumplimiento de las normas de la comunidad.";

// Cada cuánto se comprueba la base de datos como respaldo del tiempo real.
const POLL_MS = 5_000;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** La sanción vigente, o null si la cuenta está libre. */
export function getBlockNotice(state: SanctionFields): AccountBlockNotice | null {
  const reason = state.sanctionReason?.trim() || DEFAULT_REASON;

  if (state.banned) {
    return { type: "ban", reason, category: "", label: "", until: null };
  }

  if (state.suspendedUntil && state.suspendedUntil > Date.now()) {
    return {
      type: "suspension",
      reason,
      category: state.sanctionCategory?.trim() || "",
      label: state.suspensionLabel?.trim() || "",
      until: state.suspendedUntil,
    };
  }

  return null;
}

export function getBlockMessage(notice: AccountBlockNotice): string {
  return notice.type === "ban"
    ? `Cuenta bloqueada permanentemente. Motivo: ${notice.reason}`
    : `Tu cuenta está suspendida temporalmente. Motivo: ${notice.reason}`;
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
 * Vigila la cuenta con la sesión abierta. Si la banean o la suspenden (desde
 * cualquier navegador), Supabase avisa en tiempo real y la sesión se cierra
 * al instante. También comprueba al abrir la página, al volver a la pestaña y
 * cada pocos segundos, por si el tiempo real no estuviera activado.
 * El segundo argumento de onBlocked trae el detalle de la sanción.
 */
export function subscribeToAccountStatus(
  sessionUser: User,
  onBlocked: (message: string, notice: AccountBlockNotice | null) => void
): () => void {
  const userId = String(sessionUser.id);

  // Las cuentas de prueba que solo existen en el navegador no están en Supabase.
  if (!UUID.test(userId)) return () => {};

  let handled = false;
  let disposed = false;

  const check = async () => {
    if (handled || disposed) return;

    const state = await fetchSanctionOf(userId);

    // Si no se pudo consultar no se cierra la sesión por error.
    if (handled || disposed || !state) return;

    const notice = getBlockNotice(state);
    if (!notice) return;

    handled = true;

    clearSessionIfOwnedBy(sessionUser);
    onBlocked(getBlockMessage(notice), notice);
  };

  check();

  const unsubscribe = subscribeToSanctions((changedId) => {
    if (changedId === null || changedId === userId) check();
  });

  const interval = window.setInterval(check, POLL_MS);
  window.addEventListener("focus", check);

  return () => {
    disposed = true;
    unsubscribe();
    window.clearInterval(interval);
    window.removeEventListener("focus", check);
  };
}
