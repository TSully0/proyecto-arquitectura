import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, MessageCircle, X } from "lucide-react";
import type { User } from "../../../business/types/user";
import type { ProfilePost } from "../../../business/types/profile";
import { fetchPublicProfile, type PublicProfile } from "../../../data/repositories/publicProfile";
import { fetchPostsByUserId } from "../../../data/repositories/profile";
import { getSupabaseUserId } from "../../../data/repositories/places";
import { useFollows } from "../../hooks/useFollows";
import { useToast } from "../../components/ui/toast-context";
import { UserAvatar } from "../../components/ui/UserAvatar";
import { PostGrid } from "../../components/profile/PostGrid";
import { ProfileStats } from "../../components/profile/ProfileStats";
import { FollowButton } from "../../components/profile/FollowButton";
import { openChat } from "../../components/chat/openChat";
import "../../../styles/profile/profile.css";
import "../../../styles/profile/public-profile.css";

interface PublicProfilePageProps {
  user: User; // quien tiene la sesión abierta
}

type LoadState = "loading" | "ready" | "notfound" | "error";

/*
  Perfil de otra persona (/usuario/:id).
  Muestra foto, nombre, correo, rol, desde cuándo está, contadores y sus reseñas,
  y permite seguirla, aceptar su solicitud o escribirle un mensaje.
  Si el id es el de quien tiene la sesión, lo manda a su propio perfil (/perfil).
*/
export function PublicProfilePage({ user }: PublicProfilePageProps) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const {
    loading: followsLoading,
    followers,
    following,
    followerIds,
    followingIds,
    statusOf,
    requestFrom,
    followsMe,
    follow,
    unfollow,
    accept,
    reject
  } = useFollows(user, id);

  const [state, setState] = useState<LoadState>("loading");
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isMe, setIsMe] = useState(id === user.id);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setState("loading");
    setProfile(null);
    setPosts([]);
    setPostsLoading(true);

    const load = async () => {
      // ¿es mi propio perfil? (la sesión puede traer otro id que el de Supabase, por eso se comprueba también por correo)
      if (id === user.id) {
        if (!cancelled) setIsMe(true);
        return;
      }
      const myId = await getSupabaseUserId(user.email).catch(() => null);
      if (cancelled) return;
      if (myId === id) {
        setIsMe(true);
        return;
      }
      setIsMe(false);

      let loaded: PublicProfile | null;
      try {
        loaded = await fetchPublicProfile(id);
      } catch (err) {
        if (!cancelled) {
          setState("error");
          error(err instanceof Error ? err.message : "No se pudo cargar el perfil");
        }
        return;
      }
      if (cancelled) return;

      if (!loaded) {
        setState("notfound");
        return;
      }

      setProfile(loaded);
      setState("ready");

      try {
        const loadedPosts = await fetchPostsByUserId(id);
        if (!cancelled) setPosts(loadedPosts);
      } catch (err) {
        if (!cancelled) {
          error(
            err instanceof Error ? err.message : "No se pudieron cargar sus publicaciones"
          );
        }
      } finally {
        if (!cancelled) setPostsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, user.id, user.email, error]);

  if (isMe) return <Navigate to="/perfil" replace />;

  const run = async (action: () => Promise<void>, okMessage: string) => {
    setBusy(true);
    try {
      await action();
      success(okMessage);
    } catch (err) {
      error(err instanceof Error ? err.message : "No se pudo completar la acción");
    } finally {
      setBusy(false);
    }
  };

  const since = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("es-EC", {
        year: "numeric",
        month: "long"
      })
    : null;

  const status = statusOf(id);
  const request = requestFrom(id);

  return (
    <div className="profile-page">
      <div className="profile-container">
        <button className="profile-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Volver
        </button>

        {state === "loading" && (
          <p className="profile-empty">Cargando perfil...</p>
        )}

        {state === "notfound" && (
          <section className="profile-header-card">
            <div className="profile-main-info">
              <h1>Usuario no encontrado</h1>
              <p>Esta cuenta no existe o ya no está disponible.</p>
            </div>
          </section>
        )}

        {state === "error" && (
          <section className="profile-header-card">
            <div className="profile-main-info">
              <h1>No se pudo cargar el perfil</h1>
              <p>Revisa tu conexión e inténtalo de nuevo.</p>
            </div>
          </section>
        )}

        {state === "ready" && profile && (
          <>
            <section className="profile-header-card">
              <div className="profile-avatar-wrap">
                <UserAvatar userId={profile.id} name={profile.name} size={100} />
              </div>

              <div className="profile-main-info">
                <h1>{profile.name}</h1>
                <p>{profile.email}</p>

                <span className={`profile-role ${profile.role}`}>
                  {profile.role}
                </span>

                {followsMe(id) && (
                  <span className="public-profile-follows-you">Te sigue</span>
                )}

                {since && (
                  <small className="public-profile-since">
                    Miembro desde {since}
                  </small>
                )}

                <div className="public-profile-actions">
                  <FollowButton
                    status={status}
                    onFollow={() =>
                      void run(() => follow(id), `Solicitud enviada a ${profile.name}`)
                    }
                    onUnfollow={() =>
                      void run(
                        () => unfollow(id),
                        status === "pending"
                          ? "Solicitud cancelada"
                          : `Dejaste de seguir a ${profile.name}`
                      )
                    }
                  />

                  <button
                    type="button"
                    className="profile-message-btn"
                    onClick={() =>
                      openChat({ id: profile.id, name: profile.name, role: profile.role })
                    }
                  >
                    <MessageCircle size={16} />
                    Mensaje
                  </button>
                </div>

                {request && (
                  <div className="follow-request-banner">
                    <span>{profile.name} quiere seguirte</span>
                    <button
                      type="button"
                      className="profile-accept-btn"
                      disabled={busy}
                      onClick={() => void run(() => accept(request.id), "Solicitud aceptada")}
                    >
                      <Check size={16} />
                      Aceptar
                    </button>
                    <button
                      type="button"
                      className="profile-reject-btn"
                      disabled={busy}
                      onClick={() => void run(() => reject(request.id), "Solicitud rechazada")}
                    >
                      <X size={16} />
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </section>

            <ProfileStats
              posts={posts.length}
              followers={followsLoading ? 0 : followers}
              following={followsLoading ? 0 : following}
              followerIds={followerIds}
              followingIds={followingIds}
            />

            <PostGrid
              posts={posts}
              loading={postsLoading}
              title={`Publicaciones de ${profile.name}`}
              loadingMessage="Cargando sus publicaciones..."
              emptyMessage="Todavía no tiene publicaciones."
            />
          </>
        )}
      </div>
    </div>
  );
}