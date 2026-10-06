import { useEffect, useId } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

import "../../styles/ui.css";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  tag?: string;        // texto pequeño sobre el título (opcional)
  footer?: ReactNode;  // botones de abajo (opcional)
  maxWidth?: number;
}

/*
  Modal compartido. Se cierra con la ✕, con Esc y al hacer clic fuera.

    <Modal
      isOpen={open}
      title="Eliminar reseña"
      onClose={() => setOpen(false)}
      footer={
        <>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="danger" onClick={eliminar}>Eliminar</Button>
        </>
      }
    >
      ¿Seguro que quieres eliminarla?
    </Modal>
*/
export function Modal({
  isOpen,
  title,
  onClose,
  children,
  tag,
  footer,
  maxWidth = 520
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // evita scroll de fondo

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ui-modal-backdrop" onClick={onClose}>
      <div
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ui-modal-header">
          <div>
            {tag && <span className="ui-modal-tag">{tag}</span>}
            <h3 id={titleId} className="ui-modal-title">
              {title}
            </h3>
          </div>

          <button
            type="button"
            className="ui-modal-close"
            title="Cerrar"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="ui-modal-body">{children}</div>

        {footer && <div className="ui-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
