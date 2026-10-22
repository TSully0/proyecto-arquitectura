// Protección del inicio de sesión:
// - 5 intentos fallidos consecutivos.
// - Bloqueo temporal de 1 minuto.
// - Contador independiente por cuenta en este navegador.
// - Los intentos antiguos dejan de contar después de 15 minutos.
// - Al terminar el bloqueo, el contador se reinicia.
// - Un inicio de sesión correcto limpia los intentos.

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 1;
const ATTEMPT_WINDOW_MINUTES = 15;
const STORAGE_KEY = "login_attempts";

type Entry = {
  count: number;
  lockedUntil: number;
  last: number;
};

type Store = Record<string, Entry>;

const readStore = (): Store => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};

    return parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
};

const writeStore = (store: Store): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

/*
 * Identifica la cuenta mediante correo o nombre de usuario.
 * Si el nombre corresponde a una sola cuenta, utiliza su correo
 * para que ambas formas de identificación compartan el contador.
 */
export const getGuardKey = (
  users: { email: string; name: string }[],
  identifier: string
): string => {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  const matches = users.filter(
    (user) =>
      user.email.trim().toLowerCase() === normalizedIdentifier ||
      user.name.trim().toLowerCase() === normalizedIdentifier
  );

  return matches.length === 1
    ? matches[0].email.trim().toLowerCase()
    : normalizedIdentifier;
};

/*
 * Comprueba si la cuenta está bloqueada.
 * Si el minuto ya terminó, elimina el registro y reinicia el contador.
 */
export const isLoginLocked = (key: string): boolean => {
  const store = readStore();
  const entry = store[key];

  if (!entry) return false;

  const now = Date.now();

  if (entry.lockedUntil > now) {
    return true;
  }

  if (entry.lockedUntil > 0 && entry.lockedUntil <= now) {
    delete store[key];
    writeStore(store);
  }

  return false;
};

/*
 * Registra un intento fallido.
 * Al llegar a 5, bloquea la cuenta durante 60 segundos.
 */
export const registerFailedLogin = (key: string): void => {
  const store = readStore();
  const now = Date.now();

  let entry = store[key];

  // No sumar más intentos durante un bloqueo activo.
  if (entry && entry.lockedUntil > now) {
    return;
  }

  const lockExpired = Boolean(
    entry && entry.lockedUntil > 0 && entry.lockedUntil <= now
  );

  const tooOld = Boolean(
    entry &&
      now - entry.last > ATTEMPT_WINDOW_MINUTES * 60 * 1000
  );

  // Si el bloqueo terminó o los intentos caducaron, empezar de cero.
  if (!entry || lockExpired || tooOld) {
    entry = {
      count: 0,
      lockedUntil: 0,
      last: now
    };
  }

  entry.count += 1;
  entry.last = now;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCK_MINUTES * 60 * 1000;
  }

  store[key] = entry;
  writeStore(store);
};

/*
 * Limpia los intentos fallidos cuando el inicio de sesión
 * es correcto. Las sanciones administrativas se comprueban
 * por separado en LoginPage.tsx.
 */
export const clearLoginAttempts = (key: string): void => {
  const store = readStore();

  if (store[key]) {
    delete store[key];
    writeStore(store);
  }
};