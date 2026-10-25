import type { User } from "../../../business/types/user";

export type UserStatus = "BANEADO" | "SUSPENDIDO" | "ACTIVO";

interface UserCardProps {
  user: User & {
    banned?: boolean;
    suspendedUntil?: number | null;
    sanctionReason?: string;
  };
  status: UserStatus;
  onBan: (id: string) => void;
  onUnban: (id: string) => void;
  onSuspend: (id: string) => void;
  onUnsuspend: (id: string) => void;
  /** false para moderadores: no ven Banear ni Desbanear. */
  canBan?: boolean;
}

export const UserCard = ({
  user,
  status,
  onBan,
  onUnban,
  onSuspend,
  onUnsuspend,
  canBan = true,
}: UserCardProps) => {
  const normalizedStatus = status.toLowerCase();

  return (
    <div className={`user-card ${normalizedStatus}`}>
      <div className="user-header">
        <div className="avatar">
          {user.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="user-info">
        <span className={`role ${user.role}`}>{user.role}</span>

        <span className={`status ${normalizedStatus}`}>{status}</span>
      </div>

      <div className="user-actions">
        {user.role === "admin" && (
          <p className="user-note user-note-admin">
            Los administradores no se pueden banear ni suspender
          </p>
        )}

        {user.role !== "admin" && (
          <>
            {canBan &&
              (user.banned ? (
                <button
                  type="button"
                  className="btn-unban"
                  onClick={() => onUnban(user.id)}
                >
                  Desbanear
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-ban"
                  onClick={() => onBan(user.id)}
                >
                  Banear permanente
                </button>
              ))}

            {/* Suspender un usuario baneado le quitaría el baneo, por eso no se ofrece. */}
            {user.banned ? (
              !canBan && (
                <p className="user-note">Baneado por un administrador</p>
              )
            ) : status === "SUSPENDIDO" ? (
              <button
                type="button"
                className="btn-unsuspend"
                onClick={() => onUnsuspend(user.id)}
              >
                Quitar suspensión
              </button>
            ) : (
              <button
                type="button"
                className="btn-suspend"
                onClick={() => onSuspend(user.id)}
              >
                Suspender
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};