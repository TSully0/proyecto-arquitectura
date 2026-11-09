// business/services/userNotes.ts
// Notas internas del equipo (admin + moderadores) sobre un usuario.
// Se guardan en Supabase (tabla user_notes), así las ven todos los navegadores.

import { supabase } from "../../data/supabase";

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

const NOTE_COLUMNS =
  "id, userId, tag, text, authorId, authorName, authorRole, createdAt";

type NoteRow = {
  id: string;
  userId: string;
  tag: string | null;
  text: string | null;
  authorId: string;
  authorName: string | null;
  authorRole: string | null;
  createdAt: string;
};

const toNote = (row: NoteRow): UserNote => ({
  id: String(row.id),
  userId: String(row.userId),
  tag: row.tag ?? undefined,
  text: row.text ?? "",
  authorId: String(row.authorId),
  authorName: row.authorName ?? "Desconocido",
  authorRole: row.authorRole ?? "",
  at: String(row.createdAt),
});

// Todas las notas, la más reciente primero. [] si no se pudo consultar.
export const getAllNotes = async (): Promise<UserNote[]> => {
  const { data, error } = await supabase
    .from("user_notes")
    .select(NOTE_COLUMNS)
    .order("createdAt", { ascending: false })
    .limit(1000);

  if (error || !data) {
    console.warn("No se pudieron leer las notas:", error);
    return [];
  }

  return (data as unknown as NoteRow[]).map(toNote);
};

// Las notas de un usuario, la más reciente primero
export const getNotesFor = async (userId: string): Promise<UserNote[]> => {
  const { data, error } = await supabase
    .from("user_notes")
    .select(NOTE_COLUMNS)
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error || !data) {
    console.warn("No se pudieron leer las notas:", error);
    return [];
  }

  return (data as unknown as NoteRow[]).map(toNote);
};

export const addNote = async (
  userId: string,
  text: string,
  tag?: string
): Promise<UserNote | null> => {
  const clean = text.trim().slice(0, MAX_NOTE_LENGTH);
  const cleanTag = tag && tag !== OTHER_TAG ? tag : undefined;

  // Hace falta una etiqueta o un texto
  if (!clean && !cleanTag) return null;

  const actor = getNoteActor();

  const { data, error } = await supabase
    .from("user_notes")
    .insert({
      userId,
      tag: cleanTag ?? null,
      text: clean,
      authorId: actor.id,
      authorName: actor.name,
      authorRole: actor.role,
    })
    .select(NOTE_COLUMNS)
    .single();

  if (error || !data) {
    console.warn("No se pudo guardar la nota:", error);
    return null;
  }

  return toNote(data as unknown as NoteRow);
};

// Cada quien borra sus notas; el admin puede borrar cualquiera.
export const canDeleteNote = (note: UserNote, actor: NoteActor): boolean =>
  actor.role === "admin" || note.authorId === actor.id;

export const deleteNote = async (note: UserNote): Promise<boolean> => {
  const actor = getNoteActor();

  if (!canDeleteNote(note, actor)) return false;

  const { error } = await supabase.from("user_notes").delete().eq("id", note.id);

  if (error) {
    console.warn("No se pudo borrar la nota:", error);
    return false;
  }

  return true;
};

export const countNotesByUser = (notes: UserNote[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  notes.forEach((note) => {
    counts[note.userId] = (counts[note.userId] ?? 0) + 1;
  });
  return counts;
};
