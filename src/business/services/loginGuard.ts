// business/services/loginGuard.ts
//
// Filtro de seguridad del login:
//   • 5 intentos fallidos seguidos → esa cuenta se bloquea 5 minutos EN ESE NAVEGADOR.
//   • Es por cuenta y por dispositivo: otra cuenta, otro navegador u otro
//     computador no se ven afectados (el dueño puede entrar desde otro lado).
//   • No muestra contadores ni avisos hasta que el bloqueo ya está activo.

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 5;            // cámbialo a 10 si quieres
const ATTEMPT_WINDOW_MINUTES = 15; // los fallos viejos dejan de contar pasado este tiempo
const STORAGE_KEY = "login_attempts";

type Entry = { count: number; lockedUntil: number; last: number };
type Store = Record<string, Entry>;

const readStore = (): Store => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const writeStore = (store: Store) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

/*
  Clave del contador. Si lo escrito corresponde a UNA cuenta, se usa su correo:
  así escribir el correo o el nombre cuenta como la misma cuenta.
  Si no existe o hay varias con ese nombre, se usa lo escrito.
  (Para quien mira desde fuera, el comportamiento es idéntico: no se revela
   si la cuenta existe.)
*/
export const getGuardKey = (
  users: { email: string; name: string }[],
  identifier: string
): string => {
  const matches = users.filter(
    (u) =>
      u.email.toLowerCase() === identifier ||
      u.name.toLowerCase() === identifier
  );

  return matches.length === 1 ? matches[0].email.toLowerCase() : identifier;
};

// ¿está bloqueado ahora mismo?
export const isLoginLocked = (key: string): boolean => {
  const entry = readStore()[key];
  return !!entry && entry.lockedUntil > Date.now();
};

// anotar un intento fallido
export const registerFailedLogin = (key: string): void => {
  const store = readStore();
  const now = Date.now();
  let entry = store[key];

  const lockExpired = !!entry && entry.lockedUntil > 0 && entry.lockedUntil <= now;
  const tooOld = !!entry && now - entry.last > ATTEMPT_WINDOW_MINUTES * 60 * 1000;

  // bloqueo vencido o intentos muy viejos → se empieza de cero
  if (!entry || lockExpired || tooOld) {
    entry = { count: 0, lockedUntil: 0, last: now };
  }

  entry.count += 1;
  entry.last = now;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCK_MINUTES * 60 * 1000;
  }

  store[key] = entry;
  writeStore(store);
};

// inicio de sesión correcto → se borra el contador de esa cuenta
export const clearLoginAttempts = (key: string): void => {
  const store = readStore();

  if (store[key]) {
    delete store[key];
    writeStore(store);
  }
};