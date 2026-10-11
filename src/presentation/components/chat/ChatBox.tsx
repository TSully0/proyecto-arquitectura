import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ImagePlus, MoreHorizontal, Send, Trash2, X } from "lucide-react";

import type { User } from "../../../business/types/user";
import {
  getMessages,
  sendMessage,
  deleteMessage,
  clearConversation,
  MESSAGES_KEY,
  MAX_MESSAGE_LENGTH
} from "../../../data/repositories/messages";
import type { Message } from "../../../data/repositories/messages";
import { fileToChatImage } from "../../../business/services/imageTools";

import { Modal } from "../ui/Modal";
import { UserAvatar } from "../ui/UserAvatar";
import { useToast } from "../ui/toast-context";
import { LinkifiedText } from "./LinkifiedText";

import "../../../styles/chat.css";

/*
  ChatBox reutilizable:

  • Chat contigo mismo:
      <ChatBox me={user} peer={user} />

  • Chat con otra persona:
      <ChatBox key={otro.id} me={user} peer={{ id: otro.id, name: otro.name }} />

  onBack  → muestra la flecha ← (volver a la lista de chats)
  onClose → muestra la ✕ (cerrar la ventana)

  Se pueden enviar textos, fotos y enlaces (los enlaces se abren con un clic).
*/
interface ChatBoxProps {
  me: User;
  peer: { id: string; name: string; role?: string };
  onBack?: () => void;
  onClose?: () => void;
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB (luego se reduce)

/* =========================
   HELPERS
========================= */
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit"
  });

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";

  return d.toLocaleDateString("es-EC", { day: "numeric", month: "long" });
};

const roleLabel = (role?: string) => {
  const r = String(role || "").toLowerCase().trim();
  if (r === "moderator") return "Moderador";
  if (r === "user") return "Estudiante";
  return "Conversación";
};

export function ChatBox({ me, peer, onBack, onClose }: ChatBoxProps) {
  const isSelf = me.id === peer.id;
  const { error } = useToast();

  const [messages, setMessages] = useState<Message[]>(() =>
    getMessages(me.id, peer.id)
  );
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null); // foto por enviar
  const [viewing, setViewing] = useState<string | null>(null);       // foto en grande
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* =========================
     ACTUALIZAR si otra pestaña escribe
  ========================= */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === MESSAGES_KEY || e.key === null) {
        setMessages(getMessages(me.id, peer.id));
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [me.id, peer.id]);

  /* =========================
     BAJAR al último mensaje
     (se mueve solo la caja, no toda la página)
  ========================= */
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  /* =========================
     ACCIONES
  ========================= */
  const refresh = () => setMessages(getMessages(me.id, peer.id));

  const closeMenu = () => {
    setMenuOpen(false);
    setConfirmClear(false);
  };

  const canSend = !!text.trim() || !!attachment;

  const handleSend = () => {
    if (!canSend) return;

    const result = sendMessage(me.id, peer.id, text, attachment ?? undefined);

    if (!result.ok) {
      if (result.reason === "storage") {
        error("No hay espacio para guardar esta foto. Vacía el chat o prueba con otra más pequeña.");
      }
      return;
    }

    refresh();
    setText("");
    setAttachment(null);
  };

  // Enter envía · Shift+Enter hace salto de línea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite elegir el mismo archivo otra vez

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      error("Ese archivo no es una imagen.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      error("La imagen pesa más de 8 MB. Elige una más liviana.");
      return;
    }

    try {
      setAttachment(await fileToChatImage(file));
    } catch {
      error("No se pudo leer esa imagen. Prueba con JPG o PNG.");
    }
  };

  const handleDelete = (id: string) => {
    deleteMessage(id);
    refresh();
  };

  const handleClear = () => {
    clearConversation(me.id, peer.id);
    refresh();
    closeMenu();
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="chat-box">

      {/* HEADER */}
      <div className="chat-header">
        {onBack && (
          <button
            type="button"
            className="chat-icon-btn"
            title="Volver a los chats"
            onClick={onBack}
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <UserAvatar
          userId={peer.id}
          name={isSelf ? me.name : peer.name}
          size={38}
          shape="circle"
        />

        <div className="chat-header-info">
          <span className="chat-title">
            {isSelf ? `${me.name} (Tú)` : peer.name}
          </span>
          <span className="chat-subtitle">
            {isSelf
              ? "Mensajes personales · solo tú los ves"
              : roleLabel(peer.role)}
          </span>
        </div>

        {/* MENÚ ⋯ */}
        <div className="chat-menu-wrap">
          <button
            type="button"
            className="chat-icon-btn"
            title="Opciones"
            onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (
            <>
              <div className="chat-menu-backdrop" onClick={closeMenu} />

              <div className="chat-menu">
                {confirmClear ? (
                  <div className="chat-menu-confirm">
                    <span>¿Vaciar todo el chat?</span>
                    <div>
                      <button
                        type="button"
                        className="chat-confirm-yes"
                        onClick={handleClear}
                      >
                        Vaciar
                      </button>
                      <button
                        type="button"
                        className="chat-confirm-no"
                        onClick={closeMenu}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="chat-menu-item"
                    disabled={messages.length === 0}
                    onClick={() => setConfirmClear(true)}
                  >
                    <Trash2 size={15} />
                    Vaciar chat
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
            title="Cerrar"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* MENSAJES */}
      <div className="chat-messages" ref={listRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            {isSelf
              ? "Escribe notas, enlaces o recordatorios para ti, o guarda una foto 📝"
              : `Empieza la conversación con ${peer.name} 👋`}
          </div>
        )}

        {messages.map((m, i) => {
          const mine = m.senderId === me.id;
          const day = dayLabel(m.createdAt);
          const showDay =
            i === 0 || dayLabel(messages[i - 1].createdAt) !== day;

          return (
            <div key={m.id}>
              {showDay && <div className="chat-day">{day}</div>}

              <div className={`chat-row ${mine ? "mine" : "theirs"}`}>
                <div className="chat-bubble">
                  {m.image && (
                    <button
                      type="button"
                      className="chat-image-btn"
                      title="Ver foto"
                      onClick={() => setViewing(m.image ?? null)}
                    >
                      <img src={m.image} alt="Foto enviada" className="chat-image" />
                    </button>
                  )}

                  {m.text && (
                    <span className="chat-text">
                      <LinkifiedText text={m.text} />
                    </span>
                  )}

                  <span className="chat-meta">
                    {formatTime(m.createdAt)}
                    {mine && (
                      <button
                        type="button"
                        className="chat-delete"
                        title="Eliminar mensaje"
                        onClick={() => handleDelete(m.id)}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ESCRIBIR */}
      <div className="chat-footer">
        {attachment && (
          <div className="chat-attachment">
            <img src={attachment} alt="Foto por enviar" />
            <button
              type="button"
              className="chat-attachment-remove"
              title="Quitar foto"
              onClick={() => setAttachment(null)}
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="chat-composer">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="chat-file-input"
            onChange={handlePickImage}
          />

          <button
            type="button"
            className="chat-attach"
            title="Enviar una foto"
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus size={18} />
          </button>

          <textarea
            className="chat-input"
            rows={1}
            value={text}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder={isSelf ? "Escríbete un mensaje..." : "Escribe un mensaje..."}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            type="button"
            className="chat-send"
            onClick={handleSend}
            disabled={!canSend}
            title="Enviar"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* FOTO EN GRANDE (se dibuja fuera del chat para que no la recorte) */}
      {viewing &&
        createPortal(
          <Modal isOpen title="Foto" maxWidth={680} onClose={() => setViewing(null)}>
            <img src={viewing} alt="Foto enviada" className="chat-lightbox-img" />
          </Modal>,
          document.body
        )}
    </div>
  );
}
