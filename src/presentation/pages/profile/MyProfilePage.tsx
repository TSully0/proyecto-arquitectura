import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { User } from "../../../business/types/user";
import type { CommunityUser, ProfilePost } from "../../../business/types/profile";
import { changeUserName, daysLeftToChangeName } from "../../../business/services/nameChange";
import { fetchPostsByUser } from "../../../data/repositories/profile";
import { fetchCommunityPeople } from "../../../data/repositories/publicProfile";
import { useFollows } from "../../hooks/useFollows";
import { useProfilePhoto } from "../../hooks/useProfilePhoto";
import { useToast } from "../../components/ui/toast-context";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { ProfileStats } from "../../components/profile/ProfileStats";
import { CommunityList } from "../../components/profile/CommunityList";
import { FollowRequests } from "../../components/profile/FollowRequests";
import { openChat } from "../../components/chat/openChat";
import { PostGrid } from "../../components/profile/PostGrid";
import { EditNameModal } from "../../components/profile/EditNameModal";
import { ProfilePhotoModal } from "../../components/profile/ProfilePhotoModal";
import "../../../styles/profile/profile.css";

interface MyProfilePageProps {
  user: User;
}

export function MyProfilePage({ user }: MyProfilePageProps) {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const {
    followers,
    following,
    followerIds,
    followingIds,
    incoming,
    statusOf,
    follow,
    unfollow,
    accept,
    reject
  } = useFollows(user);
  const photo = useProfilePhoto(user.id);

  const [showEditName, setShowEditName] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [people, setPeople] = useState<CommunityUser[]>([]);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const daysLeft = daysLeftToChangeName(user.id);

  // muestra el aviso de éxito después de recargar la página
  useEffect(() => {
    const msg = sessionStorage.getItem("profile_notice");
    if (msg) {
      sessionStorage.removeItem("profile_notice");
      success(msg);
    }
  }, [success]);

  // carga "Tus publicaciones" desde Supabase (las reseñas y comentarios del usuario)
  useEffect(() => {
    let isMounted = true;

    fetchPostsByUser(user.email)
      .then((loaded) => {
        if (isMounted) setPosts(loaded);
      })
      .catch((err: unknown) => {
        if (isMounted) {
          error(err instanceof Error ? err.message : "No se pudieron cargar tus publicaciones");
        }
      })
      .finally(() => {
        if (isMounted) setPostsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user.email, error]);

  // personas reales de la comunidad (las cuentas de Supabase, menos la mía)
  useEffect(() => {
    let isMounted = true;

    fetchCommunityPeople(user.email)
      .then((loaded) => {
        if (isMounted) setPeople(loaded);
      })
      .catch((err: unknown) => {
        if (isMounted) {
          error(err instanceof Error ? err.message : "No se pudo cargar la comunidad");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user.email, error]);

  /* ===== seguir ===== */
  const run = async (action: () => Promise<void>, okMessage: string) => {
    try {
      await action();
      success(okMessage);
    } catch (err) {
      error(err instanceof Error ? err.message : "No se pudo completar la acción");
    }
  };

  const handleFollow = (person: CommunityUser) =>
    run(() => follow(person.id), `Solicitud enviada a ${person.name}`);

  const handleUnfollow = (person: CommunityUser) =>
    run(
      () => unfollow(person.id),
      statusOf(person.id) === "pending"
        ? "Solicitud cancelada"
        : `Dejaste de seguir a ${person.name}`
    );

  const handleMessage = (person: CommunityUser) =>
    openChat({ id: person.id, name: person.name, role: person.role });

  /* ===== cambiar nombre ===== */
  const handleChangeName = async (newName: string) => {
    const result = await changeUserName(user, newName);

    if (!result.ok) {
      error(result.message);
      return;
    }

    // el aviso se muestra después de recargar
    sessionStorage.setItem("profile_notice", "Tu nombre se cambió correctamente");

    setShowEditName(false);
    window.location.reload();
  };

  return (
    <div className="profile-page">
      <div className="profile-container">

        <button className="profile-back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={18} />
          Volver al inicio
        </button>

        <ProfileHeader
          user={user}
          daysLeft={daysLeft}
          onEditName={() => setShowEditName(true)}
          onEditPhoto={() => setShowPhoto(true)}
        />

        <ProfileStats
          posts={posts.length}
          followers={followers}
          following={following}
          followerIds={followerIds}
          followingIds={followingIds}
        />

        <section className="profile-section">
          <h2>Sobre mí</h2>
          <div className="profile-info-card">
            <p><strong>Nombre:</strong> {user.name}</p>
            <p><strong>Correo:</strong> {user.email}</p>
            <p><strong>Estado:</strong> {user.banned ? "Bloqueado" : "Activo"}</p>
          </div>
        </section>

        <FollowRequests
          requests={incoming}
          onAccept={(request) => run(() => accept(request.id), "Solicitud aceptada")}
          onReject={(request) => run(() => reject(request.id), "Solicitud rechazada")}
        />

        <CommunityList
          people={people}
          statusOf={statusOf}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
          onMessage={handleMessage}
        />

        <PostGrid posts={posts} loading={postsLoading} />
      </div>

      {showEditName && (
        <EditNameModal
          currentName={user.name}
          daysLeft={daysLeft}
          onClose={() => setShowEditName(false)}
          onConfirm={handleChangeName}
        />
      )}

      {showPhoto && (
        <ProfilePhotoModal
          userId={user.id}
          name={user.name}
          hasPhoto={!!photo}
          onClose={() => setShowPhoto(false)}
        />
      )}
    </div>
  );
}