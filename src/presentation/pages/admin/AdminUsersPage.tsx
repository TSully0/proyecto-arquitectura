import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../../business/types/user";
import {
  SanctionModal,
  type SanctionType,
  type SanctionConfirmPayload,
} from "../../components/admin/SanctionModal";
import { UserCard, type UserStatus } from "../../components/admin/UserCard";
import "../../../styles/admin/admin-users.css";

type Role = "admin" | "moderator" | "user";

type ManagedUser = User & {
  banned?: boolean;
  suspendedUntil?: number | null;
  sanctionReason?: string;
  sanctionCategory?: string;
  suspensionLabel?: string;
};

const USERS_KEY = "app_users";
const SESSION_KEY = "user";
const ACCOUNT_STATUS_EVENT = "account-status-changed";

function normalizeUsers(data: unknown): ManagedUser[] {
  if (!Array.isArray(data)) return [];

  return data.map((item): ManagedUser => {
    const user = item as Partial<ManagedUser>;

    return {
      ...user,
      id: String(user.id ?? ""),
      name: String(user.name ?? ""),
      email: String(user.email ?? ""),
      role: String(user.role ?? "user").toLowerCase().trim() as Role,
      banned: user.banned ?? false,
      suspendedUntil: user.suspendedUntil ?? null,
      sanctionReason: user.sanctionReason ?? "",
      sanctionCategory: user.sanctionCategory ?? "",
      suspensionLabel: user.suspensionLabel ?? "",
    } as ManagedUser;
  });
}

function readStoredUsers(): ManagedUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? normalizeUsers(JSON.parse(raw)) : [];
  } catch (error) {
    console.error("No se pudieron cargar los usuarios:", error);
    return [];
  }
}

interface AdminUsersPageProps {
  /**
   * "admin": ve todos los usuarios, puede banear y suspender.
   * "moderator": solo ve usuarios con rol "user" y solo puede suspender.
   */
  mode?: "admin" | "moderator";
}

export const AdminUsersPage = ({ mode = "admin" }: AdminUsersPageProps) => {
  const isModerator = mode === "moderator";
  const [users, setUsers] = useState<ManagedUser[]>(readStoredUsers);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Role>("all");

  const [sanctionModalOpen, setSanctionModalOpen] = useState(false);
  const [sanctionUserId, setSanctionUserId] = useState<string | null>(null);
  const [sanctionType, setSanctionType] = useState<SanctionType>("ban");

  const navigate = useNavigate();

  // Actualizar suspensiones y estados periódicamente.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  // Sincronizar la lista si otra pestaña modifica app_users.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === USERS_KEY) {
        setUsers(readStoredUsers());
        setCurrentTime(Date.now());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Guardar los usuarios y notificar a las sesiones abiertas.
  const saveUsers = (updated: ManagedUser[]) => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(updated));

      setUsers(updated);
      setCurrentTime(Date.now());

      // Actualizar la sesión local si pertenece a una cuenta sancionada.
      const rawSession = localStorage.getItem(SESSION_KEY);

      if (rawSession) {
        try {
          const session = JSON.parse(rawSession) as User;

          const updatedSessionUser = updated.find(
            (item) => String(item.id) === String(session.id)
          );

          if (updatedSessionUser) {
            localStorage.setItem(
              SESSION_KEY,
              JSON.stringify({
                ...session,
                banned: updatedSessionUser.banned ?? false,
                suspendedUntil: updatedSessionUser.suspendedUntil ?? null,
                sanctionReason: updatedSessionUser.sanctionReason ?? "",
                sanctionCategory: updatedSessionUser.sanctionCategory ?? "",
                suspensionLabel: updatedSessionUser.suspensionLabel ?? "",
              })
            );
          }
        } catch (error) {
          console.error("No se pudo actualizar la sesión:", error);
        }
      }

      // El evento personalizado funciona dentro de esta misma pestaña.
      window.dispatchEvent(
        new CustomEvent(ACCOUNT_STATUS_EVENT, {
          detail: { users: updated },
        })
      );
    } catch (error) {
      console.error("No se pudieron guardar los usuarios:", error);

      window.alert(
        "No se pudieron guardar los cambios. Comprueba el almacenamiento del navegador."
      );
    }
  };

  const openSanctionModal = (id: string, type: SanctionType) => {
    setSanctionUserId(id);
    setSanctionType(type);
    setSanctionModalOpen(true);
  };

  const handleBan = (id: string) => {
    if (isModerator) return;
    openSanctionModal(id, "ban");
  };

  const handleUnban = (id: string) => {
    if (isModerator) return;

    saveUsers(
      users.map((user) =>
        user.id === id
          ? {
              ...user,
              banned: false,
              sanctionReason: "",
              sanctionCategory: "",
              suspensionLabel: "",
            }
          : user
      )
    );
  };

  const handleSuspend = (id: string) => {
    openSanctionModal(id, "suspend");
  };

  const handleUnsuspend = (id: string) => {
    saveUsers(
      users.map((user) =>
        user.id === id
          ? {
              ...user,
              suspendedUntil: null,
              sanctionReason: "",
              sanctionCategory: "",
              suspensionLabel: "",
            }
          : user
      )
    );
  };

  const closeSanctionModal = () => {
    setSanctionModalOpen(false);
    setSanctionUserId(null);
  };

  // Aplicar el baneo o la suspensión.
  const confirmSanction = ({
    reason,
    category,
    detail,
    durationLabel,
    durationMinutes,
  }: SanctionConfirmPayload) => {
    if (!sanctionUserId || !reason.trim()) return;
    if (sanctionType === "suspend" && !durationMinutes) return;

    // El moderador no banea y solo puede sancionar a usuarios normales sin baneo.
    if (isModerator) {
      const target = users.find((user) => user.id === sanctionUserId);

      if (sanctionType === "ban" || !target || target.role !== "user" || target.banned) {
        return;
      }
    }

    const cleanReason = reason.trim();
    const suspensionEnd = Date.now() + (durationMinutes ?? 0) * 60 * 1000;

    const updated = users.map((user) => {
      if (user.id !== sanctionUserId) return user;

      if (sanctionType === "ban") {
        return {
          ...user,
          banned: true,
          suspendedUntil: null,
          sanctionReason: cleanReason,
          sanctionCategory: "",
          suspensionLabel: "",
        };
      }

      return {
        ...user,
        banned: false,
        suspendedUntil: suspensionEnd,
        // Etiqueta y detalle se guardan por separado para mostrarlos en el login.
        sanctionReason: detail?.trim() || category || cleanReason,
        sanctionCategory: category ?? "",
        suspensionLabel: durationLabel ?? "",
      };
    });

    saveUsers(updated);
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

    const matchesScope = !isModerator || user.role === "user";

    return matchesSearch && matchesFilter && matchesScope;
  });

  const selectedUser =
    users.find((user) => user.id === sanctionUserId) ?? null;

  return (
    <div className="users-container">
      {!isModerator && (
        <button
          type="button"
          className="btn-back"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>
      )}

      <h1>{isModerator ? "👥 Usuarios" : "👥 Gestión de Usuarios"}</h1>

      {isModerator && (
        <p className="users-subtitle">
          Puedes suspender usuarios por un tiempo. El baneo permanente solo lo
          aplica un administrador.
        </p>
      )}

      <div className="users-toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="search-input"
          aria-label="Buscar usuarios"
        />

        {!isModerator && (
          <>
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
          </>
        )}
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
            canBan={!isModerator}
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
        onClose={closeSanctionModal}
        onConfirm={confirmSanction}
      />
    </div>
  );
};