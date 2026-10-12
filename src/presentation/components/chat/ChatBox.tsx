import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { User } from "../../../business/types/user";
import { getMessages, sendMessage, deleteMessage, clearConversation, MESSAGES_KEY, MAX_MESSAGE_LENGTH } from "../../../data/repositories/messages";
import type { Message } from "../../../data/repositories/messages";
import { fileToChatImage } from "../../../business/services/imageTools";
import { useToast } from "../ui/toast-context";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatComposer } from "./ChatComposer";
import { ChatMediaViewer } from "./ChatMediaViewer";
import type { PendingAttachment } from "./ChatAttachmentPreview";
import "../../../styles/chat/chat.css";

interface ChatBoxProps {
  me: User;
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
  peer,
  onBack,
  onClose,
}: ChatBoxProps) {
  const isSelf = me.id === peer.id;
  const { error } = useToast();
  const [messages, setMessages] = useState<Message[]>(() =>
    getMessages(me.id, peer.id)
  );
  const [text, setText] = useState("");
  const [pending, setPending] =
    useState<PendingAttachment | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === MESSAGES_KEY || event.key === null) {
        setMessages(getMessages(me.id, peer.id));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [me.id, peer.id]);
  useEffect(() => {
    const element = listRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages.length]);
  const refresh = () => {
    setMessages(getMessages(me.id, peer.id));
  };
  const closeMenu = () => {
    setMenuOpen(false);
    setConfirmClear(false);
  };
  const canSend = Boolean(text.trim() || pending);
  const handleSend = () => {
    if (!canSend) return;
    const image =
      pending?.kind === "image" ? pending.data : undefined;
    const file =
      pending?.kind === "file" ? pending.file : undefined;
    const result = sendMessage(
      me.id,
      peer.id,
      text,
      image,
      file
    );
    if (!result.ok) {
      if (result.reason === "storage") {
        error(
          "No hay espacio para guardar este archivo. Vacía algunos chats o elige un archivo más pequeño."
        );
      }
      return;
    }
    refresh();
    setText("");
    setPending(null);
    setAttachMenuOpen(false);
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
  const handleDelete = (id: string) => {
    deleteMessage(id);
    refresh();
  };
  const handleClear = () => {
    clearConversation(me.id, peer.id);
    refresh();
    closeMenu();
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
          myId={me.id}
          onDelete={handleDelete}
          onViewImage={setViewing}
          emptyMessage={
            isSelf
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
        onSend={handleSend}
        onRemoveAttachment={() => setPending(null)}
        onToggleAttachmentMenu={() =>
          setAttachMenuOpen((open) => !open)
        }
        onSelectImage={handlePickMedia}
        onSelectFile={handlePickDocument}
        onInsertLink={handleInsertLink}
      />
      <ChatMediaViewer
        image={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}
