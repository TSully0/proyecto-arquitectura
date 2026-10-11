import { UserMinus, UserPlus } from "lucide-react";

import type { FollowStatus } from "../../../business/types/profile";

interface FollowButtonProps {
  status: FollowStatus;
  onFollow: () => void;
  onUnfollow: () => void;
}

/*
  Botón Seguir / Pendiente / Siguiendo.
  Sirve en cualquier perfil: solo cambia el "status" que le pasas.
*/
export function FollowButton({ status, onFollow, onUnfollow }: FollowButtonProps) {
  if (status === "accepted") {
    return (
      <button type="button" className="profile-unfollow-btn" onClick={onUnfollow}>
        <UserMinus size={16} />
        Siguiendo
      </button>
    );
  }

  if (status === "pending") {
    return (
      <button
        type="button"
        className="profile-pending-btn"
        title="Clic para cancelar la solicitud"
        onClick={onUnfollow}
      >
        ⏳ Pendiente
      </button>
    );
  }

  return (
    <button type="button" className="profile-follow-btn" onClick={onFollow}>
      <UserPlus size={16} />
      Seguir
    </button>
  );
}
