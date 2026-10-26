import { useEffect, useState } from "react";
import type { AccountBlockNotice } from "../../business/services/accountStatus";

interface AccountBlockToastProps {
  /** Texto simple, por si no hay detalle de la sanción. */
  message: string;
  notice: AccountBlockNotice | null;
  onClose: () => void;
}

const formatCountdown = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const box = {
  position: "fixed",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 9999,
  width: "min(92%, 520px)",
  padding: "16px 18px",
  borderRadius: 12,
  background: "#fff1f0",
  color: "#a12622",
  border: "1px solid #f0b8b5",
  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
} as const;

/* Aviso que se ve sobre el login cuando sancionan una cuenta con la sesión abierta. */
export function AccountBlockToast({
  message,
  notice,
  onClose,
}: AccountBlockToastProps) {
  const until = notice?.type === "suspension" ? notice.until : null;
  const [left, setLeft] = useState(() => (until ? until - Date.now() : 0));

  useEffect(() => {
    if (!until) return;

    const tick = () => setLeft(until - Date.now());
    tick();

    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [until]);

  const closeButton = (
    <button
      type="button"
      onClick={onClose}
      aria-label="Cerrar mensaje"
      style={{
        float: "right",
        marginLeft: 12,
        border: 0,
        background: "transparent",
        color: "inherit",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "1.2rem",
        lineHeight: 1,
      }}
    >
      ×
    </button>
  );

  // Sin detalle: se muestra el texto simple de siempre.
  if (!notice) {
    return (
      <div role="alert" aria-live="assertive" style={box}>
        {closeButton}
        {message}
      </div>
    );
  }

  const isBan = notice.type === "ban";

  return (
    <div role="alert" aria-live="assertive" style={box}>
      {closeButton}

      <strong style={{ display: "block", fontSize: "1rem" }}>
        {isBan
          ? "Tu cuenta fue bloqueada permanentemente"
          : "Tu cuenta fue suspendida temporalmente"}
      </strong>

      {notice.category && (
        <span
          style={{
            display: "inline-block",
            margin: "8px 0 0",
            padding: "2px 10px",
            borderRadius: 999,
            background: "#fde2e0",
            fontSize: "0.78rem",
            fontWeight: 700,
          }}
        >
          {notice.category}
        </span>
      )}

      {notice.reason !== notice.category && (
        <p style={{ margin: "8px 0 0", fontSize: "0.92rem" }}>
          Motivo: {notice.reason}
        </p>
      )}

      {isBan ? (
        <p style={{ margin: "8px 0 0", fontSize: "0.88rem", fontWeight: 600 }}>
          Esta sanción no tiene fecha de finalización.
        </p>
      ) : (
        <p style={{ margin: "8px 0 0", fontSize: "0.88rem" }}>
          {notice.label && (
            <>
              Duración: <strong>{notice.label}</strong> ·{" "}
            </>
          )}
          Tiempo restante: <strong>{formatCountdown(left)}</strong>
        </p>
      )}
    </div>
  );
}