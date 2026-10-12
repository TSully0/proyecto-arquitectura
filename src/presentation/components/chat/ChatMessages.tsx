import {
  Download,
  FileText,
  Trash2,
} from "lucide-react";
import type {
  Message,
  ChatFile,
} from "../../../data/repositories/messages";
import { LinkifiedText } from "./LinkifiedText";

type ChatMessagesProps = {
  messages: Message[];
  myId: string;
  onDelete: (id: string) => void;
  onViewImage: (image: string) => void;
  emptyMessage: string;
};

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dayLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Hoy";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Ayer";
  }

  return date.toLocaleDateString("es-EC");
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileAttachment({ file }: { file: ChatFile }) {
  return (
    <div className="chat-file-card">
      <div className="chat-document">
        <div className="chat-document-icon">
          <FileText size={25} />
        </div>

        <div className="chat-document-info">
          <strong>{file.name}</strong>
          <small>{formatBytes(file.size)}</small>
        </div>
      </div>

      <a
        className="chat-file-download"
        href={file.data}
        download={file.name}
      >
        <Download size={14} />
        Descargar archivo
      </a>
    </div>
  );
}

export function ChatMessages({
  messages,
  myId,
  onDelete,
  onViewImage,
  emptyMessage,
}: ChatMessagesProps) {
  if (messages.length === 0) {
    return (
      <div className="chat-messages">
        <div className="chat-empty">
          {emptyMessage}
        </div>
      </div>
    );
  }

  let previousDay = "";

  return (
    <div className="chat-messages">
      {messages.map((message) => {
        const mine = message.senderId === myId;

        const currentDay = new Date(
          message.createdAt
        ).toDateString();

        const showDay = currentDay !== previousDay;
        previousDay = currentDay;

        return (
          <div key={message.id}>
            {showDay && (
              <div className="chat-day">
                {dayLabel(message.createdAt)}
              </div>
            )}

            <div
              className={`chat-row ${mine ? "mine" : "theirs"}`}
            >
              <div className="chat-bubble">
                {message.image && (
                  <button
                    type="button"
                    className="chat-image-btn"
                    onClick={() => onViewImage(message.image!)}
                    aria-label="Ampliar imagen"
                  >
                    <img
                      src={message.image}
                      alt="Imagen enviada"
                      className="chat-image"
                    />
                  </button>
                )}

                {message.file && (
                  message.file.type.startsWith("video/") ? (
                    <video
                      className="chat-video"
                      controls
                      preload="metadata"
                      src={message.file.data}
                    >
                      Tu navegador no admite la reproducción de vídeo.
                    </video>
                  ) : (
                    <FileAttachment file={message.file} />
                  )
                )}

                {message.text && (
                  <span className="chat-text">
                    <LinkifiedText text={message.text} />
                  </span>
                )}

                <div className="chat-meta">
                  <span>{formatTime(message.createdAt)}</span>

                  {mine && (
                    <button
                      type="button"
                      className="chat-delete"
                      onClick={() => onDelete(message.id)}
                      aria-label="Eliminar mensaje"
                      title="Eliminar mensaje"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
