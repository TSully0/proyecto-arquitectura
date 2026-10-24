export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 64;

export interface PasswordStrengthResult {
  strength: number; // 0 = vacía, 1 = débil, 2 = media, 3 = fuerte
  strengthLabel: string;
}

// Criterios: longitud mínima, mayúsculas + minúsculas, números y símbolos.
export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { strength: 0, strengthLabel: '—' };
  }

  const score = [
    password.length >= MIN_PASSWORD_LENGTH,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ].filter(Boolean).length;

  if (password.length < MIN_PASSWORD_LENGTH || score <= 2) {
    return { strength: 1, strengthLabel: 'Débil' };
  }

  if (score === 3) {
    return { strength: 2, strengthLabel: 'Media' };
  }

  return { strength: 3, strengthLabel: 'Fuerte' };
}