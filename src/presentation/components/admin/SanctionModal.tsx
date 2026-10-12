
import { useEffect, useState } from "react";

export type SanctionType = "ban" | "suspend";

interface SanctionUser {
  id: string;
  name: string;
}

interface SanctionModalProps {
  isOpen: boolean;
  user: SanctionUser | null;
  type: SanctionType;
  hours: number;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const SanctionModal = ({
  isOpen,
  user,
  type,
  hours,
  onClose,
  onConfirm,
}: SanctionModalProps) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen, user?.id, type, hours]);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    const cleanReason = reason.trim();

    if (!cleanReason) {
      setError("Debes escribir el motivo de la sanción.");
      return;
    }

    onConfirm(cleanReason);
  };

  return (
    <div
      className="sanction-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="sanction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sanction-title"
      >
        <div className="sanction-modal-header">
          <div className="sanction-icon">
            <span>!</span>
          </div>

          <button
            type="button"
            className="sanction-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <p className="sanction-eyebrow">
          GESTIÓN DE USUARIOS
        </p>

        <h2 id="sanction-title">
          {type === "ban"
            ? "Banear permanentemente"
            : `Suspender durante ${hours} hora(s)`}
        </h2>

        <p className="sanction-description">
          Vas a sancionar a{" "}
          <strong>{user?.name ?? "este usuario"}</strong>.
          {" "}Explica el motivo de forma clara y respetuosa.
          El usuario podrá verlo cuando intente iniciar sesión.
        </p>

        <label
          className="sanction-label"
          htmlFor="sanction-reason"
        >
          Motivo de la sanción <span>*</span>
        </label>

        <textarea
          id="sanction-reason"
          className="sanction-textarea"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setError("");
          }}
          placeholder="Ej. Has incumplido las normas de la comunidad al publicar contenido indebido..."
          maxLength={500}
          rows={4}
          autoFocus
          required
        />

        <div className="sanction-helper">
          <span>
            Este motivo se mostrará en el inicio de sesión.
          </span>
          <span>{reason.length}/500</span>
        </div>

        {error && (
          <p className="sanction-error" role="alert">
            {error}
          </p>
        )}

        <div className="sanction-preview">
          <div className="sanction-preview-title">
            <span>◉</span>
            Vista previa del mensaje
          </div>

          <p>
            {type === "ban"
              ? "Cuenta bloqueada permanentemente."
              : "Cuenta suspendida temporalmente."}
            {" "}Motivo:{" "}
            {reason.trim() ||
              "Aquí aparecerá el motivo que escribas."}
          </p>
        </div>

        <div className="sanction-actions">
          <button
            type="button"
            className="sanction-cancel"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="sanction-confirm"
            onClick={handleConfirm}
          >
            {type === "ban"
              ? "Confirmar baneo"
              : "Confirmar suspensión"}
          </button>
        </div>
      </section>
    </div>
  );
};