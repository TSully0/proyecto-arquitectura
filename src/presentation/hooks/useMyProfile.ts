import { useEffect, useState } from "react";
import type { Follow } from "../../business/types/follow";
import type { User } from "../../business/types/user";
import type {
  CommunityUser,
  ProfilePost
} from "../components/profile/ProfileTypes";
import { useToast } from "../components/ui/toast-context";

const FOLLOWS_KEY = "app_follows";
const NAME_COOLDOWN_DAYS = 7;
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

const daysLeftToChangeName = (userId: string): number => {
  const last = localStorage.getItem(nameChangeKey(userId));
  if (!last) return 0;

  const passed =
    (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
  return passed >= NAME_COOLDOWN_DAYS
    ? 0
    : Math.ceil(NAME_COOLDOWN_DAYS - passed);
};

export function useMyProfile(user: User) {
  const [follows, setFollows] = useState<Follow[]>(readFollows);
  const [showEditName, setShowEditName] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [people] = useState<CommunityUser[]>([
    { id: "10", name: "Luis Mendoza", role: "user" },
    { id: "11", name: "Andrea Pico", role: "user" },
    { id: "12", name: "Carlos Tech", role: "moderator" }
  ]);
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
  const { success, error } = useToast();

  const getRelation = (targetId: string) =>
    follows.find(
      (follow) => follow.followerId === user.id && follow.followingId === targetId
    );

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

  const handleUnfollow = (target: CommunityUser) => {
    const updated = readFollows().filter(
      (follow) =>
        !(follow.followerId === user.id && follow.followingId === target.id)
    );
    writeFollows(updated);
    setFollows(updated);
    success(`Dejaste de seguir a ${target.name}`);
  };

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

    const daysLeft = daysLeftToChangeName(user.id);
    if (daysLeft > 0) {
      error(
        `Podrás cambiar tu nombre de nuevo en ${daysLeft} día${daysLeft === 1 ? "" : "s"}`
      );
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, name: cleanName })
    );

    try {
      const raw = localStorage.getItem("app_users");
      const users: User[] = raw ? JSON.parse(raw) : [];
      const synced = users.map((storedUser) =>
        storedUser.id === user.id
          ? { ...storedUser, name: cleanName }
          : storedUser
      );
      localStorage.setItem("app_users", JSON.stringify(synced));
    } catch {
      // La sesión actual ya quedó actualizada.
    }

    localStorage.setItem(nameChangeKey(user.id), new Date().toISOString());
    sessionStorage.setItem(
      "profile_notice",
      "Tu nombre se cambió correctamente"
    );
    setShowEditName(false);
    window.location.reload();
  };

  useEffect(() => {
    const message = sessionStorage.getItem("profile_notice");
    if (message) {
      sessionStorage.removeItem("profile_notice");
      success(message);
    }
  }, [success]);

  const followers = follows.filter(
    (follow) => follow.followingId === user.id && follow.status === "accepted"
  ).length;
  const following = follows.filter(
    (follow) => follow.followerId === user.id && follow.status === "accepted"
  ).length;
  const myPosts = posts.filter((post) => post.userId === user.id);

  return {
    follows,
    people,
    myPosts,
    followers,
    following,
    daysLeft: daysLeftToChangeName(user.id),
    showEditName,
    newName,
    setNewName,
    setShowEditName,
    openEditName,
    handleFollow,
    handleUnfollow,
    handleChangeName
  };
}
