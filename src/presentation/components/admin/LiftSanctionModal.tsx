import { useEffect, useState } from "react";

interface LiftSanctionModalProps {
  isOpen: boolean;
  userName: string;
  /** Qué se va a quitar. */
  kind: "ban" | "suspension";
  onClose: () => void;
  /** El motivo es opcional: puede llegar vacío. */
  onConfirm: (reason: string) => void;
}

/* Confirmación para quitar un baneo o una suspensión, con motivo opcional. */
export const LiftSanctionModal = ({
  isOpen,
  userName,
  kind,
  onClose,
  onConfirm,
}: LiftSanctionModalProps) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) setReason("");
  }, [isOpen, userName, kind]);

  if (!isOpen) return null;

  const isBan = kind === "ban";

  return (
    <div
      className="sanction-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="sanction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lift-title"
      >
        <div className="sanction-modal-header">
          <div className="sanction-icon">
            <span>✓</span>
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

        <p className="sanction-eyebrow">GESTIÓN DE USUARIOS</p>

        <h2 id="lift-title">{isBan ? "Quitar baneo" : "Quitar suspensión"}</h2>

        <p className="sanction-description">
          Vas a {isBan ? "desbanear" : "quitar la suspensión"} a{" "}
          <strong>{userName}</strong>. Podrá volver a iniciar sesión.
        </p>

        <label className="sanction-label" htmlFor="lift-reason">
          Motivo <small>(opcional)</small>
        </label>

        <textarea
          id="lift-reason"
          className="sanction-textarea"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Ej. Apelación aceptada, fue un error..."
          maxLength={500}
          rows={3}
          autoFocus
        />

        <div className="sanction-helper">
          <span>Si lo escribes, queda guardado en el historial.</span>
          <span>{reason.length}/500</span>
        </div>

        <div className="sanction-actions">
          <button type="button" className="sanction-cancel" onClick={onClose}>
            Cancelar
          </button>

          <button
            type="button"
            className="sanction-confirm"
            onClick={() => onConfirm(reason.trim())}
          >
            {isBan ? "Confirmar desbaneo" : "Quitar suspensión"}
          </button>
        </div>
      </section>
    </div>
  );
};