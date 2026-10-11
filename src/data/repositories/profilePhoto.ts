// data/repositories/profilePhoto.ts
//
// Foto de perfil de cada usuario (guardada en localStorage como imagen pequeña).
// Cuando exista la base de datos / almacenamiento (por ejemplo Supabase Storage),
// solo se cambia el interior de estas funciones.

const KEY_PREFIX = "profile_photo_";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const getProfilePhoto = (userId: string): string | null => {
  try {
    return localStorage.getItem(KEY_PREFIX + userId);
  } catch {
    return null;
  }
};

// devuelve false si no hubo espacio para guardarla
export const saveProfilePhoto = (userId: string, dataUrl: string): boolean => {
  try {
    localStorage.setItem(KEY_PREFIX + userId, dataUrl);
    emit();
    return true;
  } catch {
    return false;
  }
};

export const removeProfilePhoto = (userId: string): void => {
  localStorage.removeItem(KEY_PREFIX + userId);
  emit();
};

// para que cualquier avatar se actualice solo cuando cambia una foto
// (incluso si el cambio se hizo en otra pestaña)
export const subscribeProfilePhotos = (callback: () => void) => {
  listeners.add(callback);
  window.addEventListener("storage", callback);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
};
