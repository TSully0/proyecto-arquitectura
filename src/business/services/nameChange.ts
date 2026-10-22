import type { User } from "../types/user";

// =====================================================
// CONFIGURACIÓN
// Cada usuario puede cambiar su nombre una vez cada 7 días.
// La información se guarda actualmente en localStorage.
// =====================================================

const COOLDOWN_DAYS = 7;

// Clave que guarda la fecha del último cambio de nombre.
const cooldownKey = (userId: string) => `last_name_change_${userId}`;

// =====================================================
// VALIDACIÓN DEL NOMBRE
// =====================================================

/**
 * Valida el formato del nombre.
 *
 * Permitido:
 * - JuanPerez
 * - Juan Pérez
 * - María José
 *
 * No permitido:
 * - " Juan"  (espacio al inicio)
 * - "Juan "  (espacio al final)
 * - "Juan  Pérez" (espacios consecutivos)
 * - "Juan/Pérez"
 * - "Juan&Pérez"
 * - "Juan;Pérez"
 */
const validateName = (name: string): string | null => {
  // No permitir nombres vacíos.
  if (!name.trim()) {
    return "El nombre no puede estar vacío.";
  }

  // No permitir espacios al principio o al final.
  if (name !== name.trim()) {
    return "El nombre no puede comenzar ni terminar con espacios.";
  }

  // Limitar la longitud del nombre.
  if (name.length < 3) {
    return "El nombre debe tener al menos 3 caracteres.";
  }

  if (name.length > 30) {
    return "El nombre no puede superar los 30 caracteres.";
  }

  // Permitir letras Unicode, números, espacios simples,
  // puntos, guiones y guiones bajos.
  // Rechazar espacios consecutivos y otros símbolos.
  if (!/^[\p{L}\p{N}]+(?:[ ._-][\p{L}\p{N}]+)*$/u.test(name)) {
    return "Usa letras, números y espacios simples entre palabras. También puedes usar punto, guion o guion bajo.";
  }

  return null;
};

// =====================================================
// CONSULTAR DÍAS RESTANTES
// =====================================================

/**
 * Devuelve los días que faltan para poder cambiar el nombre.
 * Retorna 0 cuando el usuario ya puede cambiarlo.
 */
export const daysLeftToChangeName = (userId: string): number => {
  const last = localStorage.getItem(cooldownKey(userId));

  if (!last) return 0;

  const lastDate = new Date(last).getTime();

  // Si la fecha guardada no es válida, permitir el cambio.
  if (Number.isNaN(lastDate)) return 0;

  const passed =
    (Date.now() - lastDate) / (1000 * 60 * 60 * 24);

  return passed >= COOLDOWN_DAYS
    ? 0
    : Math.ceil(COOLDOWN_DAYS - passed);
};

// =====================================================
// RESULTADO DE CAMBIAR EL NOMBRE
// =====================================================

export type NameChangeResult =
  | { ok: true }
  | { ok: false; message: string };

// =====================================================
// CAMBIAR NOMBRE DEL USUARIO
// =====================================================

export const changeUserName = (
  user: User,
  newName: string
): NameChangeResult => {
  // Validar el nombre original antes de modificarlo.
  // No usamos trim() para corregirlo automáticamente,
  // porque debemos detectar los espacios sobrantes.
  const validationError = validateName(newName);

  if (validationError) {
    return { ok: false, message: validationError };
  }

  // Evitar que el usuario vuelva a establecer el mismo nombre.
  if (newName === user.name) {
    return { ok: false, message: "Ese ya es tu nombre actual." };
  }

  // Comprobar si ya transcurrieron los 7 días.
  const daysLeft = daysLeftToChangeName(user.id);

  if (daysLeft > 0) {
    return {
      ok: false,
      message: `Podrás cambiar tu nombre de nuevo en ${daysLeft} día${daysLeft === 1 ? "" : "s"}.`,
    };
  }

  // 1. Actualizar la sesión del usuario.
  localStorage.setItem(
    "user",
    JSON.stringify({ ...user, name: newName })
  );

  // 2. Actualizar el usuario guardado en localStorage.
  try {
    const raw = localStorage.getItem("app_users");
    const users: User[] = raw ? JSON.parse(raw) : [];

    const synced = users.map((u) =>
      u.id === user.id ? { ...u, name: newName } : u
    );

    localStorage.setItem("app_users", JSON.stringify(synced));
  } catch {
    // Si falla la sincronización local, la sesión ya fue actualizada.
  }

  // 3. Registrar la fecha del último cambio.
  localStorage.setItem(
    cooldownKey(user.id),
    new Date().toISOString()
  );

  return { ok: true };
};