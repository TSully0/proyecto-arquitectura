
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
  onSuspend: (id: string, hours: number) => void;
  onUnsuspend: (id: string) => void;
}

export const UserCard = ({
  user,
  status,
  onBan,
  onUnban,
  onSuspend,
  onUnsuspend,
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
        <span className={`role ${user.role}`}>
          {user.role}
        </span>

        <span className={`status ${normalizedStatus}`}>
          {status}
        </span>
      </div>

      <div className="user-actions">
        {user.role !== "admin" && (
          <>
            {user.banned ? (
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
            )}

            {status === "SUSPENDIDO" ? (
              <button
                type="button"
                className="btn-unsuspend"
                onClick={() => onUnsuspend(user.id)}
              >
                Quitar suspensión
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-suspend"
                  onClick={() => onSuspend(user.id, 1)}
                >
                  Suspender 1h
                </button>

                <button
                  type="button"
                  className="btn-suspend"
                  onClick={() => onSuspend(user.id, 24)}
                >
                  Suspender 24h
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};