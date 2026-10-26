import { useEffect, useSyncExternalStore } from "react";

import {
  getProfilePhoto,
  loadProfilePhoto,
  subscribeProfilePhotos
} from "../../data/repositories/profilePhoto";

/*
  Devuelve la foto de perfil de un usuario (o null si no tiene).
  Se actualiza sola cuando alguien cambia su foto.

    const photo = useProfilePhoto(user.id);
*/
export function useProfilePhoto(userId: string): string | null {
  const photo = useSyncExternalStore(
    (callback) => subscribeProfilePhotos(userId, callback),
    () => getProfilePhoto(userId),
    () => null
  );

  useEffect(() => {
    let isMounted = true;
    loadProfilePhoto(userId).catch((loadError: unknown) => {
      if (isMounted) {
        console.error(
          loadError instanceof Error ? loadError.message : "No se pudo cargar la foto de perfil."
        );
      }
    });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return photo;
}
