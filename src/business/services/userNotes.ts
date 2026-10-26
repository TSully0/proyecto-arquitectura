// business/services/userNotes.ts
// Notas internas del equipo (admin + moderadores) sobre un usuario.
// Hoy se guardan en localStorage; cuando exista la base de datos solo hay que
// cambiar el cuerpo de estas funciones, las pantallas no se tocan.

export type UserNote = {
  id: string;
  userId: string; // usuario sobre el que se escribe la nota
  tag?: string; // etiqueta rápida, por ejemplo "Reincidente"
  text: string; // detalle (opcional si hay etiqueta)
  authorId: string;
  authorName: string;
  authorRole: string; // "admin" | "moderator"
  at: string; // fecha ISO
};

export type NoteActor = { id: string; name: string; role: string };

const NOTES_KEY = "app_user_notes";
export const MAX_NOTE_LENGTH = 500;

// Etiquetas rápidas. "Otro" abre el cuadro para escribir libremente.
export const OTHER_TAG = "Otro";
export const NOTE_TAGS = [
  "Advertido por chat",
  "Reincidente",
  "Lenguaje ofensivo",
  "Spam",
  "Cuenta sospechosa",
  "Revisar en 7 días",
  OTHER_TAG,
];

/* Quien está logueado ahora (la sesión se guarda en localStorage "user") */
export const getNoteActor = (): NoteActor => {
  try {
    const raw = localStorage.getItem("user");
    const session = raw ? JSON.parse(raw) : null;

    if (session?.id) {
      return {
        id: String(session.id),
        name: String(session.name ?? "Desconocido"),
        role: String(session.role ?? "").toLowerCase().trim(),
      };
    }
  } catch {
    /* sin sesión legible */
  }

  return { id: "desconocido", name: "Desconocido", role: "" };
};

export const getAllNotes = (): UserNote[] => {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveAll = (notes: UserNote[]) => {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("No se pudieron guardar las notas:", error);
  }
};

// Las notas de un usuario, la más reciente primero
export const getNotesFor = (userId: string): UserNote[] =>
  getAllNotes()
    .filter((note) => note.userId === userId)
    .sort((a, b) => b.at.localeCompare(a.at));

export const addNote = (
  userId: string,
  text: string,
  tag?: string
): UserNote | null => {
  const clean = text.trim().slice(0, MAX_NOTE_LENGTH);
  const cleanTag = tag && tag !== OTHER_TAG ? tag : undefined;

  // Hace falta una etiqueta o un texto
  if (!clean && !cleanTag) return null;

  const actor = getNoteActor();

  const note: UserNote = {
    id: crypto.randomUUID(),
    userId,
    tag: cleanTag,
    text: clean,
    authorId: actor.id,
    authorName: actor.name,
    authorRole: actor.role,
    at: new Date().toISOString(),
  };

  saveAll([...getAllNotes(), note]);
  return note;
};

// Cada quien borra sus notas; el admin puede borrar cualquiera.
export const canDeleteNote = (note: UserNote, actor: NoteActor): boolean =>
  actor.role === "admin" || note.authorId === actor.id;

export const deleteNote = (noteId: string) => {
  const actor = getNoteActor();
  const all = getAllNotes();
  const target = all.find((note) => note.id === noteId);

  if (!target || !canDeleteNote(target, actor)) return;

  saveAll(all.filter((note) => note.id !== noteId));
};

export const countNotesByUser = (notes: UserNote[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  notes.forEach((note) => {
    counts[note.userId] = (counts[note.userId] ?? 0) + 1;
  });
  return counts;
};
