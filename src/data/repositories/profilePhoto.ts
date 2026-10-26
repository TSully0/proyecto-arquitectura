import { supabase } from "../supabase";

const BUCKET = "profile-photos";

const photoCache = new Map<string, string | null>();
const listeners = new Map<string, Set<() => void>>();
const pendingLoads = new Map<string, Promise<void>>();

const emit = (userId: string) => {
  listeners.get(userId)?.forEach((listener) => listener());
};

export const getProfilePhoto = (userId: string): string | null =>
  photoCache.get(userId) ?? null;

export const loadProfilePhoto = (userId: string): Promise<void> => {
  if (photoCache.has(userId)) return Promise.resolve();
  const pendingLoad = pendingLoads.get(userId);
  if (pendingLoad) return pendingLoad;

  const request = (async () => {
    const { data, error } = await supabase
      .from("profile_photos")
      .select("photo_url")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`No se pudo cargar la foto de perfil: ${error.message}`);
    }

    photoCache.set(userId, data?.photo_url ?? null);
    emit(userId);
  })();

  pendingLoads.set(userId, request);
  return request.finally(() => pendingLoads.delete(userId));
};

export const saveProfilePhoto = async (userId: string, photo: string): Promise<void> => {
  if (!userId.trim()) {
    throw new Error("No se pudo guardar la foto porque falta el usuario.");
  }

  const { data: previousPhoto, error: previousPhotoError } = await supabase
    .from("profile_photos")
    .select("storage_path")
    .eq("user_id", userId)
    .maybeSingle();

  if (previousPhotoError) {
    throw new Error(`No se pudo consultar la foto anterior: ${previousPhotoError.message}`);
  }

  let photoUrl = photo;
  let storagePath: string | null = null;

  if (photo.startsWith("data:")) {
    let image: Blob;
    try {
      image = await (await fetch(photo)).blob();
    } catch {
      throw new Error("No se pudo preparar la imagen para guardarla.");
    }

    const extensionByType: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp"
    };
    const extension = extensionByType[image.type];
    if (!extension || image.size > 5 * 1024 * 1024) {
      throw new Error("La imagen debe ser JPG, PNG o WebP y pesar hasta 5 MB.");
    }

    storagePath = `avatars/${encodeURIComponent(userId)}/profile.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, image, {
        cacheControl: "0",
        contentType: image.type,
        upsert: true
      });

    if (uploadError) {
      throw new Error(`No se pudo subir la foto de perfil: ${uploadError.message}`);
    }

    photoUrl = `${supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl}?v=${Date.now()}`;
  }

  const { error: saveError } = await supabase
    .from("profile_photos")
    .upsert(
      {
        user_id: userId,
        photo_url: photoUrl,
        storage_path: storagePath,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );

  if (saveError) {
    throw new Error(`No se pudo guardar la foto de perfil: ${saveError.message}`);
  }

  photoCache.set(userId, photoUrl);
  emit(userId);

  if (previousPhoto?.storage_path && previousPhoto.storage_path !== storagePath) {
    const { error: removeOldPhotoError } = await supabase.storage
      .from(BUCKET)
      .remove([previousPhoto.storage_path]);
    if (removeOldPhotoError) {
      console.warn("No se pudo eliminar la foto anterior de Storage:", removeOldPhotoError);
    }
  }
};

export const removeProfilePhoto = async (userId: string): Promise<void> => {
  const { data: previousPhoto, error: previousPhotoError } = await supabase
    .from("profile_photos")
    .select("storage_path")
    .eq("user_id", userId)
    .maybeSingle();

  if (previousPhotoError) {
    throw new Error(`No se pudo consultar la foto de perfil: ${previousPhotoError.message}`);
  }

  const { error: removeRecordError } = await supabase
    .from("profile_photos")
    .delete()
    .eq("user_id", userId);

  if (removeRecordError) {
    throw new Error(`No se pudo eliminar el registro de la foto: ${removeRecordError.message}`);
  }

  photoCache.set(userId, null);
  emit(userId);

  if (previousPhoto?.storage_path) {
    const { error: removeFileError } = await supabase.storage
      .from(BUCKET)
      .remove([previousPhoto.storage_path]);
    if (removeFileError) {
      console.warn("No se pudo eliminar el archivo anterior de Storage:", removeFileError);
    }
  }
};

export const subscribeProfilePhotos = (userId: string, callback: () => void) => {
  const userListeners = listeners.get(userId) ?? new Set<() => void>();
  userListeners.add(callback);
  listeners.set(userId, userListeners);

  return () => {
    userListeners.delete(callback);
    if (userListeners.size === 0) listeners.delete(userId);
  };
};
