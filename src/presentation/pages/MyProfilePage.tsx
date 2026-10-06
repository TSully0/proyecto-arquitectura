import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, UserMinus, Users, Heart, MessageCircle, MapPin } from "lucide-react";
import type { User } from "../../business/types/user";
import type { Follow } from "../../business/types/follow";

import { useToast } from "../components/toast-context";

import "../../styles/profile.css";

interface MyProfilePageProps {
  user: User;
}

type CommunityUser = {
  id: string;
  name: string;
  role: "admin" | "moderator" | "user";
};

type ProfilePost = {
  id: string;
  userId: string;
  title: string;
  description: string;
  location: string;
  image: string;
  likes: number;
  comments: number;
};

/* =========================
   HELPERS (localStorage)
========================= */
const FOLLOWS_KEY = "app_follows";
const NAME_COOLDOWN_DAYS = 7;

// 🔑 clave POR USUARIO (antes era una sola para todos)
const nameChangeKey = (userId: string) => `last_name_change_${userId}`;

const readFollows = (): Follow[] => {
  try {
    const raw = localStorage.getItem(FOLLOWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeFollows = (data: Follow[]) =>
  localStorage.setItem(FOLLOWS_KEY, JSON.stringify(data));

// días que faltan para poder cambiar el nombre (0 = ya puede)
const daysLeftToChangeName = (userId: string): number => {
  const last = localStorage.getItem(nameChangeKey(userId));
  if (!last) return 0;

  const passed =
    (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);

  return passed >= NAME_COOLDOWN_DAYS
    ? 0
    : Math.ceil(NAME_COOLDOWN_DAYS - passed);
};

export function MyProfilePage({ user }: MyProfilePageProps) {
  const navigate = useNavigate();

  /* =========================
     STATES
  ========================= */
  const [follows, setFollows] = useState<Follow[]>(readFollows);
  const [showEditName, setShowEditName] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const { success, error } = useToast();

  /* =========================
     LOAD DATA
  ========================= */
  /* =========================
     COMMUNITY USERS
  ========================= */
  const [people] = useState<CommunityUser[]>([
    { id: "10", name: "Luis Mendoza", role: "user" },
    { id: "11", name: "Andrea Pico", role: "user" },
    { id: "12", name: "Carlos Tech", role: "moderator" }
  ]);

  /* =========================
     POSTS
  ========================= */
  const [posts] = useState<ProfilePost[]>([
    {
      id: "p1",
      userId: user.id,
      title: "Cineplex Manta",
      description: "Excelente lugar después de clases",
      location: "Manta",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
      likes: 54,
      comments: 8
    },
    {
      id: "p2",
      userId: user.id,
      title: "Playa Murciélago",
      description: "Atardecer increíble",
      location: "Manta",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      likes: 87,
      comments: 14
    }
  ]);

  /* =========================
     FOLLOW LOGIC
  ========================= */
  const getRelation = (targetId: string) =>
    follows.find(
      (f) => f.followerId === user.id && f.followingId === targetId
    );

  const isAccepted = (id: string) => getRelation(id)?.status === "accepted";
  const isPending = (id: string) => getRelation(id)?.status === "pending";

  const handleFollow = (target: CommunityUser) => {
    if (getRelation(target.id)) return;

    const newFollow: Follow = {
      id: crypto.randomUUID(),
      followerId: user.id,
      followingId: target.id,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    const updated = [...readFollows(), newFollow];
    writeFollows(updated);
    setFollows(updated);

    success(`Solicitud enviada a ${target.name}`);
  };

  // sirve para "Dejar de seguir" y para cancelar una solicitud pendiente
  const handleUnfollow = (target: CommunityUser) => {
    const updated = readFollows().filter(
      (f) => !(f.followerId === user.id && f.followingId === target.id)
    );
    writeFollows(updated);
    setFollows(updated);

    success(`Dejaste de seguir a ${target.name}`);
  };

  /* =========================
     CAMBIO DE NOMBRE
  ========================= */
  const openEditName = () => {
    setNewName(user.name);
    setShowEditName(true);
  };

  const handleChangeName = () => {
    const cleanName = newName.trim();

    if (!cleanName) {
      error("El nombre no puede estar vacío");
      return;
    }

    if (cleanName === user.name) {
      error("Ese ya es tu nombre actual");
      return;
    }

    // se calcula en el momento del clic, y solo para ESTE usuario
    const daysLeft = daysLeftToChangeName(user.id);
    if (daysLeft > 0) {
      error(
        `Podrás cambiar tu nombre de nuevo en ${daysLeft} día${daysLeft === 1 ? "" : "s"}`
      );
      return;
    }

    // 1) sesión actual
    const updatedUser = { ...user, name: cleanName };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // 2) "base de datos" de usuarios (el login lee de aquí)
    try {
      const raw = localStorage.getItem("app_users");
      const users: User[] = raw ? JSON.parse(raw) : [];
      const synced = users.map((u) =>
        u.id === user.id ? { ...u, name: cleanName } : u
      );
      localStorage.setItem("app_users", JSON.stringify(synced));
    } catch {
      /* si falla, la sesión igual queda actualizada */
    }

    // 3) fecha del último cambio, por usuario
    localStorage.setItem(nameChangeKey(user.id), new Date().toISOString());

    // el mensaje se guarda para mostrarlo después de recargar
    sessionStorage.setItem(
      "profile_notice",
      "Tu nombre se cambió correctamente"
    );

    setShowEditName(false);
    window.location.reload();
  };

  // muestra el mensaje de éxito tras la recarga
  useEffect(() => {
    const msg = sessionStorage.getItem("profile_notice");
    if (msg) {
      sessionStorage.removeItem("profile_notice");
      success(msg);
    }
  }, [success]);

  /* =========================
     STATS
  ========================= */
  const followers = follows.filter(
    (f) => f.followingId === user.id && f.status === "accepted"
  ).length;

  const following = follows.filter(
    (f) => f.followerId === user.id && f.status === "accepted"
  ).length;

  const myPosts = posts.filter((p) => p.userId === user.id);

  const daysLeft = daysLeftToChangeName(user.id);

  /* =========================
     UI
  ========================= */
  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* BACK */}
        <button className="profile-back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={18} />
          Volver al inicio
        </button>

        {/* HEADER */}
        <section className="profile-header-card">
          <div className="profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="profile-main-info">
            <h1>{user.name}</h1>
            <p>{user.email}</p>

            <span className={`profile-role ${user.role}`}>
              {user.role}
            </span>

            <button className="edit-name-btn" onClick={openEditName}>
              Editar nombre
            </button>

            {daysLeft > 0 && (
              <small className="edit-name-hint">
                Podrás cambiarlo de nuevo en {daysLeft} día
                {daysLeft === 1 ? "" : "s"}
              </small>
            )}
          </div>
        </section>

        {/* STATS */}
        <section className="profile-stats">
          <div className="profile-stat">
            <strong>{myPosts.length}</strong>
            <span>Publicaciones</span>
          </div>

          <div className="profile-stat">
            <strong>{followers}</strong>
            <span>Seguidores</span>
          </div>

          <div className="profile-stat">
            <strong>{following}</strong>
            <span>Siguiendo</span>
          </div>
        </section>

        {/* ABOUT */}
        <section className="profile-section">
          <h2>Sobre mí</h2>
          <div className="profile-info-card">
            <p><strong>Nombre:</strong> {user.name}</p>
            <p><strong>Correo:</strong> {user.email}</p>
            <p><strong>Estado:</strong> {user.banned ? "Bloqueado" : "Activo"}</p>
          </div>
        </section>

        {/* COMMUNITY */}
        <section className="profile-section">
          <div className="profile-section-title">
            <Users size={20} />
            <h2>Comunidad</h2>
          </div>

          <div className="profile-people-grid">
            {people.map((p) => (
              <div key={p.id} className="profile-person-card">

                <div className="profile-person-avatar">
                  {p.name.charAt(0)}
                </div>

                <div className="profile-person-info">
                  <strong>{p.name}</strong>
                  <span>{p.role}</span>
                </div>

                {isAccepted(p.id) ? (
                  <button
                    className="profile-unfollow-btn"
                    onClick={() => handleUnfollow(p)}
                  >
                    <UserMinus size={16} />
                    Siguiendo
                  </button>
                ) : isPending(p.id) ? (
                  <button
                    className="profile-pending-btn"
                    title="Clic para cancelar la solicitud"
                    onClick={() => handleUnfollow(p)}
                  >
                    ⏳ Pendiente
                  </button>
                ) : (
                  <button
                    className="profile-follow-btn"
                    onClick={() => handleFollow(p)}
                  >
                    <UserPlus size={16} />
                    Seguir
                  </button>
                )}

              </div>
            ))}
          </div>
        </section>

        {/* POSTS */}
        <section className="profile-section">
          <h2>Mis publicaciones</h2>

          <div className="profile-posts-grid">
            {myPosts.map((post) => (
              <article key={post.id} className="profile-post-card">
                <img
                  src={post.image}
                  alt={post.title}
                  className="profile-post-image"
                />

                <div className="profile-post-content">
                  <h3>{post.title}</h3>

                  <div className="profile-post-location">
                    <MapPin size={14} />
                    {post.location}
                  </div>

                  <p>{post.description}</p>

                  <div className="profile-post-stats">
                    <span><Heart size={16} /> {post.likes}</span>
                    <span><MessageCircle size={16} /> {post.comments}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

      </div>

      {/* MODAL */}
      {showEditName && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Cambiar nombre</h3>

            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={40}
              autoFocus
            />

            {daysLeft > 0 ? (
              <p className="modal-warning">
                ⚠️ Podrás cambiar tu nombre de nuevo en {daysLeft} día
                {daysLeft === 1 ? "" : "s"}
              </p>
            ) : (
              <p className="modal-info">
                ℹ️ Después de cambiarlo, no podrás hacerlo por 7 días
              </p>
            )}

            <div className="modal-actions">
              <button onClick={() => setShowEditName(false)}>
                Cancelar
              </button>

              <button onClick={handleChangeName} disabled={daysLeft > 0}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
