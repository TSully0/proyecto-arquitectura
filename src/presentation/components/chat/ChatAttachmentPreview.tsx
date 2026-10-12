
import { X, FileText, Film } from "lucide-react";
import type { ChatFile } from "../../../data/repositories/messages";

export type PendingAttachment =
  | {
      kind: "image";
      data: string;
      name: string;
    }
  | {
      kind: "file";
      file: ChatFile;
    };

type ChatAttachmentPreviewProps = {
  pending: PendingAttachment | null;
  onRemove: () => void;
};

export function ChatAttachmentPreview({
  pending,
  onRemove,
}: ChatAttachmentPreviewProps) {
  if (!pending) return null;

  const isImage = pending.kind === "image";
  const file = pending.kind === "file" ? pending.file : null;

  return (
    <div className="chat-attachment">
      {isImage ? (
        <img
          src={pending.data}
          alt={pending.name}
          title={pending.name}
        />
      ) : (
        <div className="chat-pending-file">
          {file?.type.startsWith("video/") ? (
            <Film size={24} />
          ) : (
            <FileText size={24} />
          )}

          <span>
            <strong>{file?.name}</strong>
            <small>
              {file
                ? `${(file.size / 1024).toFixed(1)} KB`
                : "Archivo adjunto"}
            </small>
          </span>
        </div>
      )}

      <button
        type="button"
        className="chat-attachment-remove"
        onClick={onRemove}
        aria-label="Quitar archivo adjunto"
        title="Quitar archivo"
      >
        <X size={14} />
      </button>
    </div>
  );
}