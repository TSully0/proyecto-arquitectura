import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import type { User } from "../../business/types/user";
import type { CommunityUser, ProfilePost } from "../../business/types/profile";
import { changeUserName, daysLeftToChangeName } from "../../business/services/nameChange";
import { getCommunityPeople, fetchPostsByUser } from "../../data/repositories/profile";

import { useFollows } from "../hooks/useFollows";
import { useProfilePhoto } from "../hooks/useProfilePhoto";
import { useToast } from "../components/ui/toast-context";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfileStats } from "../components/profile/ProfileStats";
import { CommunityList } from "../components/profile/CommunityList";
import { PostGrid } from "../components/profile/PostGrid";
import { EditNameModal } from "../components/profile/EditNameModal";
import { ProfilePhotoModal } from "../components/profile/ProfilePhotoModal";

import "../../styles/profile/profile.css";

interface MyProfilePageProps {
  user: User;
}

export function MyProfilePage({ user }: MyProfilePageProps) {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { followers, following, statusOf, follow, unfollow } = useFollows(user.id);
  const photo = useProfilePhoto(user.id);

  const [showEditName, setShowEditName] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [people] = useState(getCommunityPeople);
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

  /* ===== seguir ===== */
  const handleFollow = (person: CommunityUser) => {
    follow(person.id);
    success(`Solicitud enviada a ${person.name}`);
  };

  const handleUnfollow = (person: CommunityUser) => {
    unfollow(person.id);
    success(`Dejaste de seguir a ${person.name}`);
  };

  /* ===== cambiar nombre ===== */
  const handleChangeName = (newName: string) => {
    const result = changeUserName(user, newName);

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
        />

        <section className="profile-section">
          <h2>Sobre mí</h2>
          <div className="profile-info-card">
            <p><strong>Nombre:</strong> {user.name}</p>
            <p><strong>Correo:</strong> {user.email}</p>
            <p><strong>Estado:</strong> {user.banned ? "Bloqueado" : "Activo"}</p>
          </div>
        </section>

        <CommunityList
          people={people}
          statusOf={statusOf}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
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
