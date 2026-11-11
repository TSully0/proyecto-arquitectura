import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchUsersByIds, type UserBasic } from "../../../data/repositories/publicProfile";
import { Modal } from "../ui/Modal";
import { UserAvatar } from "../ui/UserAvatar";

interface ProfileStatsProps {
  posts: number;
  followers: number;
  following: number;
  followerIds?: string[]; // quiénes siguen a esta persona
  followingIds?: string[]; // a quiénes sigue esta persona
}

type Panel = "followers" | "following" | null;

const roleLabel: Record<string, string> = {
  admin: "Administrador",
  moderator: "Moderador",
  user: "Estudiante"
};

/*
  Contadores del perfil. «Seguidores» y «Siguiendo» se pueden pulsar
  para ver la lista de personas (con enlace a su perfil).
*/
export function ProfileStats({
  posts,
  followers,
  following,
  followerIds,
  followingIds
}: ProfileStatsProps) {
  const [panel, setPanel] = useState<Panel>(null);
  const [people, setPeople] = useState<UserBasic[]>([]);
  const [loading, setLoading] = useState(false);

  const ids = panel === "followers" ? followerIds : panel === "following" ? followingIds : undefined;
  const idsKey = (ids ?? []).join(",");

  // carga los datos de las personas mientras el panel está abierto
  useEffect(() => {
    if (!panel) return;

    let cancelled = false;
    setLoading(true);

    fetchUsersByIds(idsKey ? idsKey.split(",") : [])
      .then((loaded) => {
        if (!cancelled) {
          setPeople(loaded.sort((a, b) => a.name.localeCompare(b.name)));
        }
      })
      .catch(() => {
        if (!cancelled) setPeople([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [panel, idsKey]);

  const clickable = followerIds !== undefined && followingIds !== undefined;

  return (
    <>
      <section className="profile-stats">
        <div className="profile-stat">
          <strong>{posts}</strong>
          <span>Publicaciones</span>
        </div>

        {clickable ? (
          <button
            type="button"
            className="profile-stat profile-stat-btn"
            onClick={() => setPanel("followers")}
          >
            <strong>{followers}</strong>
            <span>Seguidores</span>
          </button>
        ) : (
          <div className="profile-stat">
            <strong>{followers}</strong>
            <span>Seguidores</span>
          </div>
        )}

        {clickable ? (
          <button
            type="button"
            className="profile-stat profile-stat-btn"
            onClick={() => setPanel("following")}
          >
            <strong>{following}</strong>
            <span>Siguiendo</span>
          </button>
        ) : (
          <div className="profile-stat">
            <strong>{following}</strong>
            <span>Siguiendo</span>
          </div>
        )}
      </section>

      <Modal
        isOpen={panel !== null}
        title={panel === "followers" ? "Seguidores" : "Siguiendo"}
        onClose={() => setPanel(null)}
        maxWidth={440}
      >
        {loading && <p className="people-modal-empty">Cargando...</p>}

        {!loading && people.length === 0 && (
          <p className="people-modal-empty">
            {panel === "followers"
              ? "Todavía no tiene seguidores."
              : "Todavía no sigue a nadie."}
          </p>
        )}

        {!loading && people.length > 0 && (
          <div className="people-modal-list">
            {people.map((p) => (
              <Link
                key={p.id}
                to={`/usuario/${p.id}`}
                className="people-modal-item"
                onClick={() => setPanel(null)}
              >
                <UserAvatar userId={p.id} name={p.name} size={44} shape="circle" />
                <div>
                  <strong>{p.name}</strong>
                  <span>{roleLabel[p.role] ?? p.role}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}