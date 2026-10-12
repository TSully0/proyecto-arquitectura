
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../../business/types/user";
import {
  SanctionModal,
  type SanctionType,
} from "../../components/admin/SanctionModal";
import {
  UserCard,
  type UserStatus,
} from "../../components/admin/UserCard";
import "../../../styles/admin/admin-users.css";

type Role = "admin" | "moderator" | "user";

type ManagedUser = User & {
  banned?: boolean;
  suspendedUntil?: number | null;
  sanctionReason?: string;
};

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<ManagedUser[]>(() => {
    try {
      const stored = localStorage.getItem("app_users");

      if (!stored) return [];

      const parsed: unknown = JSON.parse(stored);

      if (!Array.isArray(parsed)) return [];

      return parsed.map((item): ManagedUser => {
        const user = item as Partial<ManagedUser>;

        return {
          ...user,
          id: String(user.id ?? ""),
          name: String(user.name ?? ""),
          email: String(user.email ?? ""),
          role: (String(user.role ?? "user").toLowerCase().trim() as Role),
          banned: user.banned ?? false,
          suspendedUntil: user.suspendedUntil ?? null,
          sanctionReason: user.sanctionReason ?? "",
        } as ManagedUser;
      });
    } catch (error) {
      console.error("No se pudieron cargar los usuarios:", error);
      return [];
    }
  });

  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Role>("all");

  const [sanctionModalOpen, setSanctionModalOpen] = useState(false);
  const [sanctionUserId, setSanctionUserId] = useState<string | null>(null);
  const [sanctionType, setSanctionType] = useState<SanctionType>("ban");
  const [sanctionHours, setSanctionHours] = useState(1);

  const navigate = useNavigate();

  // Actualiza los estados cuando una suspensión llega a su fin.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  // Guarda los cambios y actualiza la lista.
  const saveUsers = (updated: ManagedUser[]) => {
    try {
      localStorage.setItem("app_users", JSON.stringify(updated));
      setUsers(updated);
    } catch (error) {
      console.error("No se pudieron guardar los usuarios:", error);
      window.alert(
        "No se pudieron guardar los cambios. Comprueba el almacenamiento del navegador."
      );
    }
  };

  const openSanctionModal = (
    id: string,
    type: SanctionType,
    hours = 1
  ) => {
    setSanctionUserId(id);
    setSanctionType(type);
    setSanctionHours(hours);
    setSanctionModalOpen(true);
  };

  const handleBan = (id: string) => {
    openSanctionModal(id, "ban");
  };

  const handleUnban = (id: string) => {
    saveUsers(
      users.map((user) =>
        user.id === id
          ? { ...user, banned: false, sanctionReason: "" }
          : user
      )
    );
  };

  const handleSuspend = (id: string, hours: number) => {
    openSanctionModal(id, "suspend", hours);
  };

  const handleUnsuspend = (id: string) => {
    saveUsers(
      users.map((user) =>
        user.id === id
          ? {
              ...user,
              suspendedUntil: null,
              sanctionReason: "",
            }
          : user
      )
    );
  };

  const closeSanctionModal = () => {
    setSanctionModalOpen(false);
    setSanctionUserId(null);
  };

  // El modal valida el motivo y lo entrega a esta función.
  const confirmSanction = (reason: string) => {
    if (!sanctionUserId || !reason.trim()) return;

    const cleanReason = reason.trim();
    const suspensionEnd =
      Date.now() + sanctionHours * 60 * 60 * 1000;

    const updated = users.map((user) => {
      if (user.id !== sanctionUserId) return user;

      if (sanctionType === "ban") {
        return {
          ...user,
          banned: true,
          suspendedUntil: null,
          sanctionReason: cleanReason,
        };
      }

      return {
        ...user,
        banned: false,
        suspendedUntil: suspensionEnd,
        sanctionReason: cleanReason,
      };
    });

    saveUsers(updated);
    setCurrentTime(Date.now());
    closeSanctionModal();
  };

  const getStatus = (user: ManagedUser): UserStatus => {
    if (user.banned) return "BANEADO";

    if (
      user.suspendedUntil &&
      user.suspendedUntil > currentTime
    ) {
      return "SUSPENDIDO";
    }

    return "ACTIVO";
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch);

    const matchesFilter =
      filter === "all" || user.role === filter;

    return matchesSearch && matchesFilter;
  });

  const selectedUser =
    users.find((user) => user.id === sanctionUserId) ?? null;

  return (
    <div className="users-container">
      <button
        type="button"
        className="btn-back"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </button>

      <h1>👥 Gestión de Usuarios</h1>

      <div className="users-toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="search-input"
          aria-label="Buscar usuarios"
        />

        <button
          type="button"
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Todos
        </button>

        <button
          type="button"
          className={`filter-btn ${filter === "admin" ? "active" : ""}`}
          onClick={() => setFilter("admin")}
        >
          Admin
        </button>

        <button
          type="button"
          className={`filter-btn ${filter === "moderator" ? "active" : ""}`}
          onClick={() => setFilter("moderator")}
        >
          Moderadores
        </button>

        <button
          type="button"
          className={`filter-btn ${filter === "user" ? "active" : ""}`}
          onClick={() => setFilter("user")}
        >
          Usuarios
        </button>
      </div>

      <div className="users-grid">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            status={getStatus(user)}
            onBan={handleBan}
            onUnban={handleUnban}
            onSuspend={handleSuspend}
            onUnsuspend={handleUnsuspend}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <p className="empty">No se encontraron usuarios</p>
      )}

      <SanctionModal
        isOpen={sanctionModalOpen}
        user={selectedUser}
        type={sanctionType}
        hours={sanctionHours}
        onClose={closeSanctionModal}
        onConfirm={confirmSanction}
      />
    </div>
  );
};