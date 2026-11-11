import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, UserPlus, X } from "lucide-react";
import type { Follow } from "../../../business/types/follow";
import { fetchUsersByIds, type UserBasic } from "../../../data/repositories/publicProfile";
import { UserAvatar } from "../ui/UserAvatar";

interface FollowRequestsProps {
  requests: Follow[];
  onAccept: (request: Follow) => Promise<void> | void;
  onReject: (request: Follow) => Promise<void> | void;
}

/*
  Solicitudes de seguimiento que me enviaron otras personas.
  Se aceptan o se rechazan desde aquí.
*/
export function FollowRequests({ requests, onAccept, onReject }: FollowRequestsProps) {
  const [people, setPeople] = useState<Record<string, UserBasic>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const idsKey = requests.map((request) => request.followerId).sort().join(",");

  useEffect(() => {
    if (!idsKey) return;
    let cancelled = false;

    fetchUsersByIds(idsKey.split(","))
      .then((list) => {
        if (!cancelled) {
          setPeople(Object.fromEntries(list.map((person) => [person.id, person])));
        }
      })
      .catch(() => {
        /* si falla se muestra "Cargando..." y se reintenta en la próxima actualización */
      });

    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  const run = async (request: Follow, action: (request: Follow) => Promise<void> | void) => {
    setBusyId(request.id);
    try {
      await action(request);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="profile-section">
      <div className="profile-section-title">
        <UserPlus size={20} />
        <h2>
          Solicitudes de seguimiento
          {requests.length > 0 && (
            <span className="follow-requests-count">{requests.length}</span>
          )}
        </h2>
      </div>

      {requests.length === 0 && (
        <p className="profile-empty">No tienes solicitudes pendientes.</p>
      )}

      <div className="profile-people-grid">
        {requests.map((request) => {
          const person = people[request.followerId];
          const disabled = busyId === request.id;

          return (
            <div key={request.id} className="profile-person-card">
              <UserAvatar
                userId={request.followerId}
                name={person?.name ?? "?"}
                size={45}
                shape="circle"
              />

              <div className="profile-person-info">
                <strong>
                  <Link to={`/usuario/${request.followerId}`} className="profile-person-link">
                    {person?.name ?? "Cargando..."}
                  </Link>
                </strong>
                <span>quiere seguirte</span>
              </div>

              <div className="follow-request-actions">
                <button
                  type="button"
                  className="profile-accept-btn"
                  disabled={disabled}
                  onClick={() => void run(request, onAccept)}
                >
                  <Check size={16} />
                  Aceptar
                </button>
                <button
                  type="button"
                  className="profile-reject-btn"
                  disabled={disabled}
                  onClick={() => void run(request, onReject)}
                >
                  <X size={16} />
                  Rechazar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}