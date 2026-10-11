import { useSyncExternalStore } from "react";

import {
  getProfilePhoto,
  subscribeProfilePhotos
} from "../../data/repositories/profilePhoto";

/*
  Devuelve la foto de perfil de un usuario (o null si no tiene).
  Se actualiza sola cuando alguien cambia su foto.

    const photo = useProfilePhoto(user.id);
*/
export function useProfilePhoto(userId: string): string | null {
  return useSyncExternalStore(subscribeProfilePhotos, () => getProfilePhoto(userId));
}
