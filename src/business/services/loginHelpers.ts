// Constantes y funciones auxiliares de la pantalla de inicio de sesión.

export const LOCK_SECONDS = 60;
export const LOGIN_ATTEMPTS_KEY = 'login_attempts';
export const DEFAULT_REASON = 'Incumplimiento de las normas de la comunidad.';

export const MSG_LOCKED = 'Tu cuenta está bloqueada temporalmente por seguridad.';
export const MSG_LOCKED_NOW =
  'Has alcanzado 5 intentos fallidos. El inicio de sesión está bloqueado temporalmente.';

// Segundos restantes de bloqueo según la hora real de desbloqueo.
export const getRemainingSeconds = (key: string): number => {
  try {
    const store = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
    const lockedUntil = store[key]?.lockedUntil;

    return typeof lockedUntil === 'number'
      ? Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
      : LOCK_SECONDS;
  } catch {
    return LOCK_SECONDS;
  }
};

export const encodePassword = (value: string): string | null => {
  try {
    return btoa(value);
  } catch {
    return null;
  }
};