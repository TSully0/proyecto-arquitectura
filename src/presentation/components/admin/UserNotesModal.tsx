import { useEffect, useState } from "react";
import {
  MAX_NOTE_LENGTH,
  NOTE_TAGS,
  OTHER_TAG,
  addNote,
  canDeleteNote,
  deleteNote,
  getNoteActor,
  getNotesFor,
  type UserNote,
} from "../../../business/services/userNotes";

interface UserNotesModalProps {
  isOpen: boolean;
  userId: string | null;
  userName: string;
  onClose: () => void;
  /** Se llama al guardar o borrar, para actualizar el contador de la tarjeta. */
  onChanged: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  moderator: "Moderador",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* Notas internas sobre un usuario. Solo las ven admin y moderadores. */
export const UserNotesModal = ({
  isOpen,
  userId,
  userName,
  onClose,
  onChanged,
}: UserNotesModalProps) => {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [text, setText] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    if (isOpen && userId) {
      setNotes(getNotesFor(userId));
      setText("");
      setTag("");
    }
  }, [isOpen, userId]);

  if (!isOpen || !userId) return null;

  const actor = getNoteActor();

  const isOther = tag === OTHER_TAG;

  // Con etiqueta basta; con «Otro» (o sin etiqueta) hay que escribir.
  const canSave = Boolean(tag && !isOther) || text.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;

    addNote(userId, text, tag);
    setNotes(getNotesFor(userId));
    setText("");
    setTag("");
    onChanged();
  };

  const handleDelete = (noteId: string) => {
    deleteNote(noteId);
    setNotes(getNotesFor(userId));
    onChanged();
  };

  return (
    <div
      className="sanction-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="sanction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notes-title"
      >
        <div className="sanction-modal-header">
          <div className="sanction-icon notes-icon">
            <span>📝</span>
          </div>

          <button
            type="button"
            className="sanction-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <p className="sanction-eyebrow">NOTAS DEL EQUIPO</p>

        <h2 id="notes-title">{userName}</h2>

        <p className="sanction-description">
          Solo las ven administradores y moderadores. El usuario nunca las ve.
        </p>

        {notes.length === 0 ? (
          <p className="notes-empty">Todavía no hay notas sobre este usuario.</p>
        ) : (
          <ul className="notes-list">
            {notes.map((note) => (
              <li key={note.id} className="notes-item">
                {note.tag && <span className="notes-tag">{note.tag}</span>}

                {note.text && <p className="notes-text">{note.text}</p>}

                <div className="notes-meta">
                  <span>
                    <strong>{note.authorName}</strong>
                    {" · "}
                    {ROLE_LABEL[note.authorRole] ?? note.authorRole}
                    {" · "}
                    {formatDate(note.at)}
                  </span>

                  {canDeleteNote(note, actor) && (
                    <button
                      type="button"
                      className="notes-delete"
                      onClick={() => handleDelete(note.id)}
                    >
                      Borrar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="sanction-label">Nueva nota</p>

        <div className="sanction-tags">
          {NOTE_TAGS.map((item) => (
            <button
              key={item}
              type="button"
              className={`sanction-tag ${tag === item ? "active" : ""}`}
              onClick={() => setTag(tag === item ? "" : item)}
            >
              {item}
            </button>
          ))}
        </div>

        {tag && (
          <>
            <label className="sanction-label" htmlFor="note-text">
              {isOther ? "Escribe la nota" : "Detalle"}
              {!isOther && <small> (opcional)</small>}
            </label>

            <textarea
              id="note-text"
              className="sanction-textarea"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={
                isOther
                  ? "Ej. Pidió disculpas por mensaje, vigilar esta semana."
                  : "Ej. Si reincide, suspender 7 días."
              }
              maxLength={MAX_NOTE_LENGTH}
              rows={3}
              autoFocus
            />

            <div className="sanction-helper">
              <span>Queda con tu nombre y la fecha.</span>
              <span>
                {text.length}/{MAX_NOTE_LENGTH}
              </span>
            </div>
          </>
        )}

        <div className="sanction-actions">
          <button type="button" className="sanction-cancel" onClick={onClose}>
            Cerrar
          </button>

          <button
            type="button"
            className="sanction-confirm"
            onClick={handleSave}
            disabled={!canSave}
          >
            Guardar nota
          </button>
        </div>
      </section>
    </div>
  );
};