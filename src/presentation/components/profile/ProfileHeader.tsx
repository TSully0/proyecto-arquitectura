import { Camera } from "lucide-react";

import type { User } from "../../../business/types/user";
import { UserAvatar } from "../ui/UserAvatar";

interface ProfileHeaderProps {
  user: User;
  daysLeft?: number;          // días que faltan para poder cambiar el nombre
  onEditName?: () => void;    // si no se pasa, no sale el botón (perfil de otra persona)
  onEditPhoto?: () => void;   // si no se pasa, no sale el botón de la cámara
}

export function ProfileHeader({ user, daysLeft = 0, onEditName, onEditPhoto }: ProfileHeaderProps) {
  return (
    <section className="profile-header-card">
      <div className="profile-avatar-wrap">
        <UserAvatar userId={user.id} name={user.name} size={100} />

        {onEditPhoto && (
          <button
            type="button"
            className="profile-avatar-edit"
            title="Cambiar foto de perfil"
            aria-label="Cambiar foto de perfil"
            onClick={onEditPhoto}
          >
            <Camera size={16} />
          </button>
        )}
      </div>

      <div className="profile-main-info">
        <h1>{user.name}</h1>
        <p>{user.email}</p>

        <span className={`profile-role ${user.role}`}>
          {user.role}
        </span>

        {onEditName && (
          <>
            <button type="button" className="edit-name-btn" onClick={onEditName}>
              Editar nombre
            </button>

            {daysLeft > 0 && (
              <small className="edit-name-hint">
                Podrás cambiarlo de nuevo en {daysLeft} día
                {daysLeft === 1 ? "" : "s"}
              </small>
            )}
          </>
        )}
      </div>
    </section>
  );
}
