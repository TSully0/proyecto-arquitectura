// =====================================================
// VALIDACIONES DEL REGISTRO
// Archivo: src/business/services/registerValidation.ts
// =====================================================

// Longitudes permitidas.
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 64;
export const MIN_NAME_LENGTH = 3;
export const MAX_NAME_LENGTH = 30;

// =====================================================
// VALIDAR NOMBRE
// Permite espacios simples entre palabras, pero no
// al principio, al final ni repetidos.
// =====================================================

export const validateName = (name: string): string | null => {
  if (name !== name.trim()) {
    return 'El nombre no puede comenzar ni terminar con espacios.';
  }

  if (!name) {
    return 'El nombre no puede estar vacío.';
  }

  if (name.length < MIN_NAME_LENGTH) {
    return `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres.`;
  }

  if (name.length > MAX_NAME_LENGTH) {
    return `El nombre no puede superar los ${MAX_NAME_LENGTH} caracteres.`;
  }

  if (/\s{2,}/.test(name)) {
    return 'El nombre no puede contener espacios consecutivos.';
  }

  if (/[\/&;]/.test(name)) {
    return 'El nombre no puede contener /, & o ;.';
  }

  // Admite letras Unicode, números, espacios simples,
  // puntos, guiones y guiones bajos entre caracteres.
  if (!/^[\p{L}\p{N}]+(?:[ ._-][\p{L}\p{N}]+)*$/u.test(name)) {
    return 'Usa letras, números y espacios simples entre palabras. También puedes usar punto, guion o guion bajo.';
  }

  return null;
};

// =====================================================
// VALIDAR CORREO ELECTRÓNICO
// =====================================================

export const validateEmail = (value: string): string | null => {
  const email = value.trim().toLowerCase();

  const emailPattern =
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i;

  if (!emailPattern.test(email)) {
    return 'Introduce un correo electrónico válido.';
  }

  const domain = email.split('@').pop();

  const allowedDomains = [
    'gmail.com',
    'hotmail.com',
    'outlook.com',
    'email.com'
  ];

  if (!domain || !allowedDomains.includes(domain)) {
    return 'Utiliza una dirección de Gmail, Hotmail, Outlook o Email.com.';
  }

  return null;
};

// =====================================================
// CALCULAR SEGURIDAD DE LA CONTRASEÑA
// =====================================================

export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;

  let score = 0;

  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return 1;
  if (score <= 3) return 2;

  return 3;
};
