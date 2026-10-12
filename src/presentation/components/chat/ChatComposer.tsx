import { Image as ImageIcon, Link as LinkIcon, Paperclip, Send, FileText } from "lucide-react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { ChatAttachmentPreview } from "./ChatAttachmentPreview";
import type { PendingAttachment } from "./ChatAttachmentPreview";

type ChatComposerProps = {
  text: string;
  pending: PendingAttachment | null;
  menuOpen: boolean;
  maxLength: number;
  onTextChange: (value: string) => void;
  onSend: () => void;
  onRemoveAttachment: () => void;
  onToggleAttachmentMenu: () => void;
  onSelectImage: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onInsertLink: () => void;
};

export function ChatComposer({
  text,
  pending,
  menuOpen,
  maxLength,
  onTextChange,
  onSend,
  onRemoveAttachment,
  onToggleAttachmentMenu,
  onSelectImage,
  onSelectFile,
  onInsertLink,
}: ChatComposerProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-footer">
      <ChatAttachmentPreview
        pending={pending}
        onRemove={onRemoveAttachment}
      />

      <div className="chat-composer">
        <div className="chat-attach-wrap">
          <button
            type="button"
            className="chat-attach"
            onClick={onToggleAttachmentMenu}
            aria-label="Adjuntar archivo"
            title="Adjuntar archivo"
          >
            <Paperclip size={20} />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                className="chat-attach-backdrop"
                onClick={onToggleAttachmentMenu}
                aria-label="Cerrar menú de adjuntos"
              />

              <div className="chat-attach-menu">
                <label className="chat-attach-option">
                  <span className="chat-attach-option-icon photo">
                    <ImageIcon size={20} />
                  </span>

                  <span>
                    <strong>Fotos y vídeos</strong>
                    <small>Selecciona una imagen o un vídeo</small>
                  </span>

                  <input
                    className="chat-file-input"
                    type="file"
                    accept="image/*,video/*"
                    onChange={onSelectImage}
                  />
                </label>

                <label className="chat-attach-option">
                  <span className="chat-attach-option-icon document">
                    <FileText size={20} />
                  </span>

                  <span>
                    <strong>Documento</strong>
                    <small>PDF, Word, Excel, TXT o CSV</small>
                  </span>

                  <input
                    className="chat-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                    onChange={onSelectFile}
                  />
                </label>

                <button
                  type="button"
                  className="chat-attach-option"
                  onClick={onInsertLink}
                >
                  <span className="chat-attach-option-icon link">
                    <LinkIcon size={20} />
                  </span>

                  <span>
                    <strong>Compartir enlace</strong>
                    <small>Escribe o pega una dirección web</small>
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        <textarea
          className="chat-input"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          maxLength={maxLength}
          rows={1}
        />

        <button
          type="button"
          className="chat-send"
          onClick={onSend}
          disabled={!text.trim() && !pending}
          aria-label="Enviar mensaje"
          title="Enviar mensaje"
        >
          <Send size={19} />
        </button>
      </div>
    </div>
  );
}
