
import {
  ArrowLeft,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";
import type { User } from "../../../business/types/user";

type ChatHeaderProps = {
  me: User;
  peer: {
    id: string;
    name: string;
    role?: string;
  };
  menuOpen: boolean;
  confirmClear: boolean;
  onToggleMenu: () => void;
  onRequestClear: () => void;
  onCancelClear: () => void;
  onConfirmClear: () => void;
  onBack?: () => void;
  onClose?: () => void;
};

export function ChatHeader({
  peer,
  menuOpen,
  confirmClear,
  onToggleMenu,
  onRequestClear,
  onCancelClear,
  onConfirmClear,
  onBack,
  onClose,
}: ChatHeaderProps) {
  return (
    <header className="chat-header">
      {onBack && (
        <button
          type="button"
          className="chat-icon-btn"
          onClick={onBack}
          aria-label="Volver"
          title="Volver"
        >
          <ArrowLeft size={19} />
        </button>
      )}

      <div className="chat-avatar">
        {peer.name.trim().charAt(0).toUpperCase() || "U"}
      </div>

      <div className="chat-header-info">
        <span className="chat-title">{peer.name}</span>
        <span className="chat-subtitle">
          {peer.role || "Usuario"}
        </span>
      </div>

      <div className="chat-menu-wrap">
        <button
          type="button"
          className="chat-icon-btn"
          onClick={onToggleMenu}
          aria-label="Opciones de conversación"
          title="Opciones"
        >
          <MoreHorizontal size={21} />
        </button>

        {menuOpen && (
          <>
            <button
              type="button"
              className="chat-menu-backdrop"
              onClick={onToggleMenu}
              aria-label="Cerrar menú"
            />

            <div className="chat-menu">
              {confirmClear ? (
                <div className="chat-menu-confirm">
                  <p>¿Vaciar toda la conversación?</p>

                  <div>
                    <button
                      type="button"
                      className="chat-confirm-yes"
                      onClick={onConfirmClear}
                    >
                      Sí, vaciar
                    </button>

                    <button
                      type="button"
                      className="chat-confirm-no"
                      onClick={onCancelClear}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="chat-menu-item"
                  onClick={onRequestClear}
                >
                  <Trash2 size={16} />
                  Vaciar conversación
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          className="chat-icon-btn"
          onClick={onClose}
          aria-label="Cerrar chat"
          title="Cerrar"
        >
          <X size={19} />
        </button>
      )}
    </header>
  );
}
