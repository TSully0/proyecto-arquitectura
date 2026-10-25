import { useEffect, useMemo, useState } from "react";

export type SanctionType = "ban" | "suspend";
export type DurationUnit = "minutes" | "hours" | "days";

interface SanctionUser {
  id: string;
  name: string;
}

export interface SanctionConfirmPayload {
  /** Motivo completo (etiqueta + detalle). */
  reason: string;
  /** Solo suspensiones: etiqueta elegida y texto escrito por separado. */
  category?: string;
  detail?: string;
  /** Solo suspensiones: texto legible, por ejemplo "2 días". */
  durationLabel?: string;
  /** Solo viene en suspensiones. Ya convertido a minutos. */
  durationMinutes?: number;
}

interface SanctionModalProps {
  isOpen: boolean;
  user: SanctionUser | null;
  type: SanctionType;
  onClose: () => void;
  onConfirm: (payload: SanctionConfirmPayload) => void;
}

const UNITS: Record<
  DurationUnit,
  { label: string; max: number; factor: number; singular: string; plural: string }
> = {
  minutes: { label: "Minutos", max: 59, factor: 1, singular: "minuto", plural: "minutos" },
  hours: { label: "Horas", max: 23, factor: 60, singular: "hora", plural: "horas" },
  days: { label: "Días", max: 28, factor: 60 * 24, singular: "día", plural: "días" },
};

const REASON_TAGS = [
  "Spam",
  "Contenido sensible",
  "Contenido ilegal",
  "Contenido inapropiado",
  "Publicación improbable",
  "Tema no relacionado",
  "Otro",
] as const;

export const SanctionModal = ({
  isOpen,
  user,
  type,
  onClose,
  onConfirm,
}: SanctionModalProps) => {
  const [reason, setReason] = useState("");
  const [tag, setTag] = useState<string>("");
  const [unit, setUnit] = useState<DurationUnit>("hours");
  const [amount, setAmount] = useState(1);
  const [error, setError] = useState("");

  const isSuspend = type === "suspend";

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setTag("");
      setUnit("hours");
      setAmount(1);
      setError("");
    }
  }, [isOpen, user?.id, type]);

  const unitConfig = UNITS[unit];
  const durationLabel = `${amount} ${
    amount === 1 ? unitConfig.singular : unitConfig.plural
  }`;

  // Motivo final que se guarda y se muestra al usuario.
  const finalReason = useMemo(() => {
    const detail = reason.trim();
    if (!isSuspend) return detail;
    if (tag && tag !== "Otro") return detail ? `${tag}. ${detail}` : tag;
    return detail;
  }, [isSuspend, tag, reason]);

  if (!isOpen) {
    return null;
  }

  const handleUnitChange = (next: DurationUnit) => {
    setUnit(next);
    setAmount(1);
  };

  const handleConfirm = () => {
    if (isSuspend && !tag) {
      setError("Elige una etiqueta para el motivo.");
      return;
    }

    if (!finalReason) {
      setError(
        isSuspend && tag === "Otro"
          ? "Escribe el motivo cuando eliges «Otro»."
          : "Debes escribir el motivo de la sanción."
      );
      return;
    }

    onConfirm(
      isSuspend
        ? {
            reason: finalReason,
            category: tag,
            detail: reason.trim(),
            durationLabel,
            durationMinutes: amount * unitConfig.factor,
          }
        : { reason: finalReason }
    );
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

        <p className="sanction-eyebrow">GESTIÓN DE USUARIOS</p>

        <h2 id="sanction-title">
          {isSuspend
            ? `Suspender durante ${durationLabel}`
            : "Banear permanentemente"}
        </h2>

        <p className="sanction-description">
          Vas a sancionar a <strong>{user?.name ?? "este usuario"}</strong>.{" "}
          {isSuspend
            ? "Elige la duración y el motivo."
            : "Explica el motivo de forma clara y respetuosa."}{" "}
          El usuario podrá verlo cuando intente iniciar sesión.
        </p>

        {isSuspend && (
          <>
            <span className="sanction-label">
              Duración de la suspensión <span>*</span>
            </span>

            <div className="sanction-duration">
              <div className="sanction-unit-tabs" role="tablist">
                {(Object.keys(UNITS) as DurationUnit[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={unit === key}
                    className={`sanction-unit-tab ${unit === key ? "active" : ""}`}
                    onClick={() => handleUnitChange(key)}
                  >
                    {UNITS[key].label}
                  </button>
                ))}
              </div>

              <select
                className="sanction-select"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                aria-label="Cantidad"
              >
                {Array.from({ length: unitConfig.max }, (_, i) => i + 1).map(
                  (n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? unitConfig.singular : unitConfig.plural}
                    </option>
                  )
                )}
              </select>
            </div>

            <p className="sanction-range-hint">
              Rango: 1–59 minutos · 1–23 horas · 1–28 días
            </p>
          </>
        )}

        <label className="sanction-label" htmlFor="sanction-reason">
          Motivo de la sanción <span>*</span>
        </label>

        {isSuspend && (
          <div className="sanction-tags">
            {REASON_TAGS.map((item) => (
              <button
                key={item}
                type="button"
                className={`sanction-tag ${tag === item ? "active" : ""}`}
                onClick={() => {
                  setTag(item);
                  setError("");
                }}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        <textarea
          id="sanction-reason"
          className="sanction-textarea"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setError("");
          }}
          placeholder={
            isSuspend && tag && tag !== "Otro"
              ? "Detalle adicional (opcional)..."
              : "Ej. Has incumplido las normas de la comunidad al publicar contenido indebido..."
          }
          maxLength={500}
          rows={4}
          autoFocus={!isSuspend}
        />

        <div className="sanction-helper">
          <span>Este motivo se mostrará en el inicio de sesión.</span>
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
            {isSuspend
              ? `Cuenta suspendida temporalmente por ${durationLabel}.`
              : "Cuenta bloqueada permanentemente."}{" "}
            Motivo: {finalReason || "Aquí aparecerá el motivo que escribas."}
          </p>
        </div>

        <div className="sanction-actions">
          <button type="button" className="sanction-cancel" onClick={onClose}>
            Cancelar
          </button>

          <button
            type="button"
            className="sanction-confirm"
            onClick={handleConfirm}
          >
            {isSuspend ? "Confirmar suspensión" : "Confirmar baneo"}
          </button>
        </div>
      </section>
    </div>
  );
};