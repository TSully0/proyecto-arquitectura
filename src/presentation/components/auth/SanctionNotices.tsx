import { useEffect, useRef, useState } from 'react';

/* Avisos de sanción del inicio de sesión (usan los estilos de auth.css). */

export interface SuspensionNotice {
  until: number;
  label: string;
  category: string;
  reason: string;
}

// Formato horas:minutos:segundos. Los días se cuentan como 24 h (2 días = 48:00:00).
const formatCountdown = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/* ✓ Aviso verde: la cuenta ya está activa. */
export function LiftedNotice({
  title,
  text
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="suspension-notice lifted-notice" role="status">
      <p className="suspension-title">✓ {title}</p>
      <p className="suspension-reason">{text}</p>
    </div>
  );
}

/* Baneo permanente. */
export function BanNotice({ reason }: { reason: string }) {
  return (
    <div className="suspension-notice ban-notice" role="alert">
      <p className="suspension-title">Cuenta bloqueada permanentemente</p>

      <span className="suspension-tag">Baneo permanente</span>

      <p className="suspension-reason">Motivo: {reason}</p>

      <div className="suspension-countdown">
        <span>Duración de la sanción</span>
        <strong>Permanente</strong>
        <small>Esta sanción no tiene fecha de finalización</small>
      </div>
    </div>
  );
}

/* Suspensión temporal con cuenta regresiva. Avisa con onEnd cuando termina. */
export function SuspensionCard({
  notice,
  onEnd
}: {
  notice: SuspensionNotice;
  onEnd: () => void;
}) {
  const [left, setLeft] = useState(() => notice.until - Date.now());

  // Siempre se llama a la última versión de onEnd sin reiniciar el contador.
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  });

  useEffect(() => {
    const tick = () => {
      const remaining = notice.until - Date.now();

      if (remaining <= 0) {
        setLeft(0);
        onEndRef.current();
        return;
      }

      setLeft(remaining);
    };

    tick();
    const interval = window.setInterval(tick, 250);

    return () => window.clearInterval(interval);
  }, [notice.until]);

  return (
    <div className="suspension-notice" role="alert">
      <p className="suspension-title">Cuenta suspendida temporalmente</p>

      {notice.category && (
        <span className="suspension-tag">{notice.category}</span>
      )}

      {notice.reason !== notice.category && (
        <p className="suspension-reason">Motivo: {notice.reason}</p>
      )}

      {notice.label && (
        <p className="suspension-duration">
          Duración de la suspensión: <strong>{notice.label}</strong>
        </p>
      )}

      <div className="suspension-countdown">
        <span>Tiempo restante</span>
        <strong>{formatCountdown(left)}</strong>
        <small>horas : minutos : segundos</small>
      </div>
    </div>
  );
}
