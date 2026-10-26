import { initialUsers } from '../../data/repositories/users';
import {
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH
} from './registerValidation';

// =====================================================
// Lógica del registro que no es de pantalla:
// leer y guardar usuarios, buscar duplicados y validar el paso 2.
// =====================================================

// Datos necesarios para comprobar si un correo o nombre ya está registrado.
export type ExistingUser = {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  banned?: boolean;
};

const USERS_KEY = 'app_users';

// Primero consulta localStorage. Si no hay datos válidos, usa los usuarios iniciales.
export const getUsers = (): ExistingUser[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) && parsed.length > 0
      ? (parsed as ExistingUser[])
      : initialUsers;
  } catch {
    return initialUsers;
  }
};

// Compara correos y nombres sin distinguir mayúsculas ni espacios sobrantes.
export const findDuplicates = (
  users: ExistingUser[],
  name: string,
  email: string
) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.toLowerCase();

  return {
    email: users.some(
      (user) => (user.email || '').trim().toLowerCase() === cleanEmail
    ),
    name: users.some(
      (user) => (user.name || '').trim().toLowerCase() === cleanName
    )
  };
};

export const buildNewUser = (name: string, email: string, password: string) => ({
  id: Date.now().toString(),
  name,
  email: email.trim().toLowerCase(),
  password: btoa(password),
  role: 'user',
  banned: false
});

// Devuelve false si el navegador no deja guardar.
export const saveUsersLocally = (users: unknown[]): boolean => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch {
    return false;
  }
};

export const getStrengthLabel = (strength: number): string =>
  strength === 0 ? 'Sin contraseña' :
  strength === 1 ? 'Débil' :
  strength === 2 ? 'Media' :
  'Fuerte';

// Validación del paso 2. Devuelve el mensaje de error, o '' si todo está bien.
export const validatePasswordStep = (input: {
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
  strength: number;
}): string => {
  const { password, confirmPassword, acceptedTerms, strength } = input;

  // btoa() solo admite caracteres Latin-1. Un emoji u otro carácter
  // fuera de ese rango haría fallar el registro sin mostrar mensaje.
  if (/[^\u0000-ÿ]/.test(password)) {
    return 'La contraseña contiene caracteres no admitidos.';
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return `La contraseña no puede superar los ${MAX_PASSWORD_LENGTH} caracteres.`;
  }

  if (strength < 2) {
    return 'La contraseña es demasiado débil. Combina mayúsculas, minúsculas y números o símbolos.';
  }

  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden.';
  }

  if (!acceptedTerms) {
    return 'Debes aceptar los términos y condiciones para registrarte.';
  }

  return '';
};