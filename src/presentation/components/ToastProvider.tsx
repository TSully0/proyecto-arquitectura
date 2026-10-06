import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

import { ToastContext } from "./toast-context";
import type { ToastApi, ToastType } from "./toast-context";

import "../../styles/ui.css";

type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

const DURATION_MS = 4000; // cuánto dura cada aviso
const MAX_VISIBLE = 4;    // máximo de avisos a la vez

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = crypto.randomUUID();

      setItems((prev) => [...prev, { id, type, message }].slice(-MAX_VISIBLE));
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), DURATION_MS)
      );
    },
    [dismiss]
  );

  // OJO: aquí NO se limpian los temporizadores al desmontar.
  // Este componente vive en la raíz de la app y nunca se desmonta, y en
  // desarrollo (StrictMode) esa limpieza borraba el temporizador del aviso
  // y lo dejaba pegado en pantalla para siempre.

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      success: (m) => toast(m, "success"),
      error: (m) => toast(m, "error"),
      info: (m) => toast(m, "info")
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div className="ui-toast-stack" aria-live="polite">
        {items.map((t) => {
          const Icon = ICONS[t.type];

          return (
            <div key={t.id} className={`ui-toast ui-toast-${t.type}`} role="status">
              <Icon size={18} className="ui-toast-icon" />
              <span className="ui-toast-text">{t.message}</span>

              <button
                type="button"
                className="ui-toast-close"
                title="Cerrar"
                onClick={() => dismiss(t.id)}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
