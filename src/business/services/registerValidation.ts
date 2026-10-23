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
// VALIDAR NOMBRE DE USUARIO
// =====================================================

export const validateName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return 'El nombre no puede estar vacío.';
  }

  // No permitir correos electrónicos como nombre de usuario.
  if (name.includes('@')) {
    return 'El nombre de usuario no puede ser un correo electrónico. No uses @.';
  }

  // No permitir espacios al inicio o al final.
  if (name !== name.trim()) {
    return 'El nombre no puede comenzar ni terminar con espacios.';
  }

  // Validar longitud mínima.
  if (name.length < MIN_NAME_LENGTH) {
    return `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres.`;
  }

  // Validar longitud máxima.
  if (name.length > MAX_NAME_LENGTH) {
    return `El nombre no puede superar los ${MAX_NAME_LENGTH} caracteres.`;
  }

  // No permitir espacios consecutivos.
  if (/\s{2,}/.test(name)) {
    return 'El nombre no puede contener espacios consecutivos.';
  }

  // No permitir barra, ampersand ni punto y coma.
  if (/[\/&;]/.test(name)) {
    return 'El nombre no puede contener /, & o ;.';
  }

  // Permitir letras Unicode (incluye tildes y ñ), números
  // y separadores simples: espacio, punto, guion y guion bajo.
  if (!/^[\p{L}\p{N}]+(?:[ ._-][\p{L}\p{N}]+)*$/u.test(name)) {
    return 'Usa letras, números y separadores simples entre palabras. También puedes usar punto, guion o guion bajo.';
  }

  return null;
};

// =====================================================
// VALIDAR CORREO ELECTRÓNICO
// =====================================================

export const validateEmail = (value: string): string | null => {
  // Conservar el valor original para rechazar mayúsculas.
  const email = value;

  if (!email || !email.trim()) {
    return 'El correo electrónico es obligatorio.';
  }

  // Longitud máxima del correo.
  if (email.length > 254) {
    return 'El correo electrónico no puede superar los 254 caracteres.';
  }

  // Rechazar espacios y caracteres de control.
  if (/[\s\u0000-\u001F\u007F]/.test(email)) {
    return 'El correo electrónico no puede contener espacios.';
  }

  // Debe existir exactamente un símbolo @.
  const parts = email.split('@');

  if (parts.length !== 2) {
    return 'Introduce un correo electrónico válido.';
  }

  const [localPart, domain] = parts;

  // Validar la parte anterior a @.
  if (
    !localPart ||
    localPart.length > 64 ||
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..')
  ) {
    return 'La parte anterior a @ no es válida.';
  }

  // Solo letras minúsculas, números, guion bajo y punto.
  // No permitir puntos consecutivos, al inicio ni al final.
  if (!/^[a-z0-9_]+(?:\.[a-z0-9_]+)*$/.test(localPart)) {
    return 'El correo debe usar solo letras minúsculas, números, guion bajo (_) y punto (.). No se permiten mayúsculas, tildes, ñ ni otros caracteres especiales.';
  }

  // Validar el dominio.
  if (!domain || domain.length > 253) {
    return 'Introduce un dominio de correo válido.';
  }

  const labels = domain.split('.');

  if (
    labels.length < 2 ||
    labels.some(
      (label) =>
        !label ||
        label.length > 63 ||
        label.startsWith('-') ||
        label.endsWith('-') ||
        !/^[a-z0-9-]+$/.test(label)
    )
  ) {
    return 'Introduce un dominio de correo válido.';
  }

  // Proveedores permitidos por el proyecto.
  const allowedDomains = [
    'gmail.com',
    'hotmail.com',
    'outlook.com',
    'email.com',
  ];

  if (!allowedDomains.includes(domain)) {
    return 'Utiliza una dirección de Gmail, Hotmail, Outlook o Email.com.';
  }

  return null;
};

// =====================================================
// VALIDAR CONTRASEÑA
// =====================================================

export const validatePassword = (password: string): string | null => {
  if (!password || !password.trim()) {
    return 'La contraseña es obligatoria.';
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return `La contraseña no puede superar los ${MAX_PASSWORD_LENGTH} caracteres.`;
  }

  return null;
};

// =====================================================
// CALCULAR SEGURIDAD DE LA CONTRASEÑA
// Resultado:
// 0 = sin contraseña
// 1 = débil
// 2 = media
// 3 = fuerte
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