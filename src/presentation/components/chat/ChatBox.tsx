import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { User } from "../../../business/types/user";
import { fetchMessages, sendMessage, deleteMessageForEveryone, deleteMessageForMe, deleteChatForMe, markConversationRead, subscribeToMessages, MAX_MESSAGE_LENGTH } from "../../../data/repositories/messages";
import type { Message } from "../../../data/repositories/messages";
import { fileToChatImage } from "../../../business/services/imageTools";
import { useToast } from "../ui/toast-context";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatComposer } from "./ChatComposer";
import { ChatMediaViewer } from "./ChatMediaViewer";
import type { PendingAttachment } from "./ChatAttachmentPreview";
import "../../../styles/chat/chat.css";

interface ChatBoxProps {
  me: User;
  myId: string; // id de Supabase de quien tiene la sesión
  peer: { id: string; name: string; role?: string };
  onBack?: () => void;
  onClose?: () => void;
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 1024 * 1024;
const MAX_VIDEO_BYTES = 2 * 1024 * 1024;
const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
]);

const ALLOWED_DOCUMENT_EXTENSIONS =
  /\.(pdf|doc|docx|xls|xlsx|txt|csv)$/i;
const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("No se pudo leer el archivo."));
      }
    };
    reader.onerror = () =>
      reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
export function ChatBox({
  me,
  myId,
  peer,
  onBack,
  onClose,
}: ChatBoxProps) {
  const isSelf = myId === peer.id;
  const { error } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [pending, setPending] =
    useState<PendingAttachment | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [deleting, setDeleting] = useState<Message | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const refresh = useCallback(async () => {
    try {
      const loaded = await fetchMessages(myId, peer.id);
      setMessages(loaded);

      // si tengo mensajes nuevos de esta persona, quedan leídos
      if (loaded.some((m) => m.receiverId === myId && m.senderId !== myId && !m.readAt)) {
        void markConversationRead(myId, peer.id);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }, [myId, peer.id]);

  // carga inicial + tiempo real (+ respaldo cada 8 s y al volver a la pestaña)
  useEffect(() => {
    setLoading(true);
    void refresh();

    const stop = subscribeToMessages(() => void refresh());
    const timer = window.setInterval(() => void refresh(), 8000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      stop();
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  useEffect(() => {
    const element = listRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages.length]);
  const closeMenu = () => {
    setMenuOpen(false);
    setConfirmClear(false);
  };
  const canSend = Boolean(text.trim() || pending) && !sending;
  const handleSend = async () => {
    if (!canSend) return;
    const image =
      pending?.kind === "image" ? pending.data : undefined;
    const file =
      pending?.kind === "file" ? pending.file : undefined;

    setSending(true);
    const result = await sendMessage(myId, peer.id, text, image, file);
    setSending(false);

    if (!result.ok) {
      if (result.reason !== "empty") {
        error(result.detail ?? "No se pudo enviar el mensaje.");
      }
      return;
    }
    setText("");
    setPending(null);
    setAttachMenuOpen(false);
    await refresh();
  };
  const handlePickMedia = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type.startsWith("image/")) {
      if (file.size > MAX_IMAGE_BYTES) {
        error(
          "La imagen pesa más de 8 MB. Elige una más liviana."
        );
        return;
      }
      try {
        const data = await fileToChatImage(file);
        setPending({
          kind: "image",
          data,
          name: file.name,
        });
        setAttachMenuOpen(false);
      } catch {
        error(
          "No se pudo procesar esa imagen. Prueba con JPG o PNG."
        );
      }
      return;
    }
    if (file.type.startsWith("video/")) {
      if (file.size > MAX_VIDEO_BYTES) {
        error(
          "El vídeo supera los 2 MB permitidos para el chat."
        );
        return;
      }
      try {
        const data = await readFileAsDataUrl(file);
        setPending({
          kind: "file",
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
            data,
          },
        });
        setAttachMenuOpen(false);
      } catch {
        error("No se pudo leer el vídeo.");
      }
      return;
    }
    error("Selecciona una imagen o un vídeo válido.");
  };
  const handlePickDocument = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const validType =
      ALLOWED_DOCUMENT_TYPES.has(file.type) ||
      ALLOWED_DOCUMENT_EXTENSIONS.test(file.name);
    if (!validType) {
      error(
        "Formato no permitido. Usa PDF, DOC, DOCX, XLS, XLSX, TXT o CSV."
      );
      return;
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      error(
        "El documento supera 1 MB. Elige un archivo más pequeño."
      );
      return;
    }
    try {
      const data = await readFileAsDataUrl(file);
      setPending({
        kind: "file",
        file: {
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          data,
        },
      });
      setAttachMenuOpen(false);
    } catch {
      error("No se pudo leer el documento.");
    }
  };
  const handleInsertLink = () => {
    setText((current) => {
      const separator =
        current && !current.endsWith(" ") ? " " : "";
      return `${current}${separator}https://`;
    });
    setAttachMenuOpen(false);
    requestAnimationFrame(() => {
      textRef.current?.focus();
    });
  };
  // abre la ventana «Eliminar mensaje»
  const handleDelete = (id: string) => {
    setDeleting(messages.find((m) => m.id === id) ?? null);
  };
  const confirmDelete = async (scope: "me" | "everyone") => {
    const target = deleting;
    if (!target) return;
    setDeleting(null);
    try {
      if (scope === "everyone") {
        await deleteMessageForEveryone(target);
      } else {
        await deleteMessageForMe(target, myId);
      }
      await refresh();
    } catch (err) {
      error(err instanceof Error ? err.message : "No se pudo eliminar el mensaje.");
    }
  };
  const handleClear = async () => {
    try {
      await deleteChatForMe(myId, peer.id);
      await refresh();
    } catch (err) {
      error(err instanceof Error ? err.message : "No se pudo eliminar el chat.");
    }
    closeMenu();
    onBack?.(); // vuelve a la lista, como en Instagram
  };
  return (
    <div className="chat-box">
      <ChatHeader
        me={me}
        peer={peer}
        menuOpen={menuOpen}
        confirmClear={confirmClear}
        onToggleMenu={() => {
          if (menuOpen) {
            closeMenu();
          } else {
            setMenuOpen(true);
          }
        }}
        onRequestClear={() => setConfirmClear(true)}
        onCancelClear={closeMenu}
        onConfirmClear={handleClear}
        onBack={onBack}
        onClose={onClose}
      />
      <div ref={listRef} className="chat-messages-container">
        <ChatMessages
          messages={messages}
          myId={myId}
          onDelete={handleDelete}
          onViewImage={setViewing}
          emptyMessage={
            loading
              ? "Cargando mensajes..."
              : isSelf
              ? "Escribe notas, enlaces o recordatorios para ti, o guarda una foto 📝"
              : `Empieza la conversación con ${peer.name} 👋`
          }
        />
      </div>
      <ChatComposer
        text={text}
        pending={pending}
        menuOpen={attachMenuOpen}
        maxLength={MAX_MESSAGE_LENGTH}
        onTextChange={setText}
        onSend={() => void handleSend()}
        onRemoveAttachment={() => setPending(null)}
        onToggleAttachmentMenu={() =>
          setAttachMenuOpen((open) => !open)
        }
        onSelectImage={handlePickMedia}
        onSelectFile={handlePickDocument}
        onInsertLink={handleInsertLink}
      />
      <Modal
        isOpen={deleting !== null}
        title="Eliminar mensaje"
        onClose={() => setDeleting(null)}
        maxWidth={380}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="secondary" onClick={() => void confirmDelete("me")}>
              Eliminar para mí
            </Button>
            {deleting?.senderId === myId && !isSelf && (
              <Button variant="danger" onClick={() => void confirmDelete("everyone")}>
                Eliminar para todos
              </Button>
            )}
          </>
        }
      >
        <p>
          «Para mí» lo oculta solo en tu chat.
          {deleting?.senderId === myId && !isSelf
            ? ` «Para todos» también lo borra del chat de ${peer.name}.`
            : ""}
        </p>
      </Modal>
      <ChatMediaViewer
        image={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}
