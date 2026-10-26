import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  SanctionModal,
  type SanctionType,
  type SanctionConfirmPayload,
} from "../../components/admin/SanctionModal";
import { LiftSanctionModal } from "../../components/admin/LiftSanctionModal";
import { UserNotesModal } from "../../components/admin/UserNotesModal";
import { UserCard } from "../../components/admin/UserCard";
import { UsersFilters } from "../../components/admin/UsersFilters";
import {
  STATUS_PARAMS,
  type Role,
  type StatusFilter,
} from "../../components/admin/user-types";
import { useManagedUsers } from "../../hooks/useManagedUsers";
import { logModeration } from "../../../data/repositories/activity";
import {
  countNotesByUser,
  getAllNotes,
} from "../../../business/services/userNotes";
import "../../../styles/admin/admin-users.css";

interface AdminUsersPageProps {
  /**
   * "admin": ve todos los usuarios, puede banear y suspender.
   * "moderator": solo ve usuarios con rol "user" y solo puede suspender.
   */
  mode?: "admin" | "moderator";
}

export const AdminUsersPage = ({ mode = "admin" }: AdminUsersPageProps) => {
  const isModerator = mode === "moderator";
  const { users, saveUsers, getStatus } = useManagedUsers();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Role>("all");
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    () => STATUS_PARAMS[searchParams.get("estado") ?? ""] ?? "all"
  );

  const [sanctionModalOpen, setSanctionModalOpen] = useState(false);
  const [sanctionUserId, setSanctionUserId] = useState<string | null>(null);
  const [sanctionType, setSanctionType] = useState<SanctionType>("ban");

  // Quitar baneo / suspensión (con motivo opcional)
  const [lift, setLift] = useState<{
    id: string;
    kind: "ban" | "suspension";
  } | null>(null);

  // Notas internas del equipo
  const [notes, setNotes] = useState(getAllNotes);
  const [notesUserId, setNotesUserId] = useState<string | null>(null);
  const noteCounts = useMemo(() => countNotesByUser(notes), [notes]);

  const navigate = useNavigate();

  const openSanctionModal = (id: string, type: SanctionType) => {
    setSanctionUserId(id);
    setSanctionType(type);
    setSanctionModalOpen(true);
  };

  const closeSanctionModal = () => {
    setSanctionModalOpen(false);
    setSanctionUserId(null);
  };

  const handleBan = (id: string) => {
    if (isModerator) return;
    openSanctionModal(id, "ban");
  };

  const handleSuspend = (id: string) => {
    openSanctionModal(id, "suspend");
  };

  const handleUnban = (id: string) => {
    if (isModerator) return;
    setLift({ id, kind: "ban" });
  };

  const handleUnsuspend = (id: string) => {
    setLift({ id, kind: "suspension" });
  };

  // Quitar el baneo o la suspensión (el motivo puede venir vacío).
  const confirmLift = (reason: string) => {
    if (!lift) return;

    const target = users.find((user) => user.id === lift.id);
    const isBan = lift.kind === "ban";

    if (target) {
      logModeration({
        action: isBan ? "unban" : "unsuspend",
        targetId: lift.id,
        targetName: target.name,
        reason: reason || undefined,
      });
    }

    saveUsers(
      users.map((user) => {
        if (user.id !== lift.id) return user;

        const cleaned = {
          ...user,
          sanctionReason: "",
          sanctionCategory: "",
          suspensionLabel: "",
        };

        return isBan
          ? {
              ...cleaned,
              banned: false,
              liftedNotice: "ban" as const,
              liftedBy: "admin",
            }
          : {
              ...cleaned,
              suspendedUntil: null,
              liftedNotice: "suspension" as const,
              liftedBy: isModerator ? "moderator" : "admin",
            };
      })
    );

    setLift(null);
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

    const target = users.find((user) => user.id === sanctionUserId);

    // El moderador no banea y solo puede sancionar a usuarios normales sin baneo.
    if (isModerator) {
      if (sanctionType === "ban" || !target || target.role !== "user" || target.banned) {
        return;
      }
    }

    const cleanReason = reason.trim();

    logModeration({
      action: sanctionType === "ban" ? "ban" : "suspend",
      targetId: sanctionUserId,
      targetName: target?.name,
      reason: cleanReason,
      duration: sanctionType === "suspend" ? durationLabel : undefined,
    });

    const suspensionEnd = Date.now() + (durationMinutes ?? 0) * 60 * 1000;

    const updated = users.map((user) => {
      if (user.id !== sanctionUserId) return user;

      if (sanctionType === "ban") {
        return {
          ...user,
          banned: true,
          liftedNotice: undefined,
          liftedBy: undefined,
          suspendedUntil: null,
          sanctionReason: cleanReason,
          sanctionCategory: "",
          suspensionLabel: "",
        };
      }

      return {
        ...user,
        banned: false,
        liftedNotice: undefined,
        liftedBy: undefined,
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

  /* ===== Lista filtrada y contadores ===== */
  const normalizedSearch = search.trim().toLowerCase();

  // El moderador solo trabaja con usuarios normales.
  const scopedUsers = users.filter((user) => !isModerator || user.role === "user");

  const filteredUsers = scopedUsers.filter((user) => {
    const status = getStatus(user);

    const matchesSearch =
      user.name.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch);

    const matchesRole = filter === "all" || user.role === filter;

    const matchesStatus =
      statusFilter === "all" ||
      status === statusFilter ||
      (statusFilter === "sanctioned" && status !== "ACTIVO");

    return matchesSearch && matchesRole && matchesStatus;
  });

  const countStatus = (status: string) =>
    scopedUsers.filter((user) => getStatus(user) === status).length;

  const counts: Record<StatusFilter, number> = {
    all: scopedUsers.length,
    ACTIVO: countStatus("ACTIVO"),
    SUSPENDIDO: countStatus("SUSPENDIDO"),
    BANEADO: countStatus("BANEADO"),
    sanctioned: scopedUsers.length - countStatus("ACTIVO"),
  };

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

      <UsersFilters
        isModerator={isModerator}
        search={search}
        onSearchChange={setSearch}
        roleFilter={filter}
        onRoleChange={setFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        counts={counts}
      />

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
            noteCount={noteCounts[user.id] ?? 0}
            onNotes={setNotesUserId}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <p className="empty">No se encontraron usuarios</p>
      )}

      <LiftSanctionModal
        isOpen={lift !== null}
        userName={users.find((user) => user.id === lift?.id)?.name ?? "este usuario"}
        kind={lift?.kind ?? "ban"}
        onClose={() => setLift(null)}
        onConfirm={confirmLift}
      />

      <UserNotesModal
        isOpen={notesUserId !== null}
        userId={notesUserId}
        userName={users.find((user) => user.id === notesUserId)?.name ?? ""}
        onClose={() => setNotesUserId(null)}
        onChanged={() => setNotes(getAllNotes())}
      />

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