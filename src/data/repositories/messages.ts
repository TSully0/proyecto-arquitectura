import { supabase } from "../supabase";
import { isUuid } from "./follow";

/*
  Chat en Supabase (tabla messages + bucket chat-files).
  Los mensajes llegan en tiempo real entre navegadores y dispositivos.

  Los adjuntos (foto, vídeo, documento) se suben al bucket y en el mensaje
  se guarda solo su URL. Por eso `image` y `file.data` son URLs.
*/

export type ChatFile = {
  name: string;
  type: string;
  size: number;
  data: string; // al enviar: data URL; al recibir: URL pública del archivo
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  image?: string;
  file?: ChatFile;
  createdAt: string;
  readAt?: string | null;
  deletedFor?: string[];
};

export const MAX_MESSAGE_LENGTH = 500;

const BUCKET = "chat-files";

export const getConversationId = (a: string, b: string) =>
  [a, b].sort().join("__");

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  body: string | null;
  image_url: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  read_at: string | null;
  created_at: string;
  deleted_for: string[] | null;
};

const COLUMNS =
  "id, conversation_id, sender_id, receiver_id, body, image_url, file_url, file_name, file_type, file_size, read_at, created_at, deleted_for";

const toMessage = (row: MessageRow): Message => ({
  id: String(row.id),
  conversationId: String(row.conversation_id),
  senderId: String(row.sender_id),
  receiverId: String(row.receiver_id),
  text: row.body ?? "",
  ...(row.image_url ? { image: row.image_url } : {}),
  ...(row.file_url
    ? {
        file: {
          name: row.file_name ?? "archivo",
          type: row.file_type ?? "application/octet-stream",
          size: Number(row.file_size ?? 0),
          data: row.file_url
        }
      }
    : {}),
  createdAt: String(row.created_at),
  readAt: row.read_at,
  deletedFor: row.deleted_for ?? []
});

/* =========================
   MENSAJES DE UNA CONVERSACIÓN
========================= */
// Momento desde el cual yo veo esta conversación (después de «Eliminar chat»).
async function fetchClearState(
  meId: string
): Promise<Record<string, { clearedAt: string }>> {
  const { data, error } = await supabase
    .from("chat_state")
    .select("peer_id, cleared_at")
    .eq("user_id", meId);

  if (error) {
    throw new Error(`No se pudo leer el estado de tus chats: ${error.message}`);
  }

  const state: Record<string, { clearedAt: string }> = {};
  for (const row of data ?? []) {
    state[String(row.peer_id)] = { clearedAt: String(row.cleared_at) };
  }
  return state;
}

// Mensajes de la conversación tal como los veo YO (sin lo que eliminé).
export async function fetchMessages(a: string, b: string): Promise<Message[]> {
  if (!isUuid(a) || !isUuid(b)) return [];

  const state = (await fetchClearState(a))[b];

  let query = supabase
    .from("messages")
    .select(COLUMNS)
    .eq("conversation_id", getConversationId(a, b))
    .order("created_at", { ascending: true })
    .limit(500);

  if (state) query = query.gt("created_at", state.clearedAt);

  const { data, error } = await query;

  if (error) {
    throw new Error(`No se pudieron cargar los mensajes: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => toMessage(row as MessageRow))
    .filter((m) => !m.deletedFor?.includes(a));
}

/* =========================
   ENVIAR
========================= */
const safeName = (name: string) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);

// Sube un archivo (data URL) al bucket y devuelve su URL pública y su ruta.
async function uploadAttachment(
  conversationId: string,
  dataUrl: string,
  name: string,
  mime: string
): Promise<{ url: string; path: string }> {
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${conversationId}/${crypto.randomUUID()}-${safeName(name)}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: mime || blob.type, upsert: false });

  if (error) {
    throw new Error(`No se pudo subir el archivo: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

// Ruta del archivo dentro del bucket a partir de su URL pública.
const pathFromUrl = (url: string): string | null => {
  const marker = `/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
};

export type SendResult =
  | { ok: true; message: Message }
  | { ok: false; reason: "empty" | "invalid" | "failed"; detail?: string };

export async function sendMessage(
  senderId: string,
  receiverId: string,
  text: string,
  image?: string, // data URL de la foto
  file?: ChatFile // file.data es un data URL
): Promise<SendResult> {
  const clean = text.trim().slice(0, MAX_MESSAGE_LENGTH);

  if (!clean && !image && !file) {
    return { ok: false, reason: "empty" };
  }
  if (!isUuid(senderId) || !isUuid(receiverId)) {
    return {
      ok: false,
      reason: "invalid",
      detail: "Tu cuenta todavía no está sincronizada con Supabase. Cierra sesión e inténtalo de nuevo."
    };
  }

  const conversationId = getConversationId(senderId, receiverId);

  try {
    let imageUrl: string | null = null;
    let fileInfo: { url: string; name: string; type: string; size: number } | null = null;

    if (image) {
      imageUrl = (await uploadAttachment(conversationId, image, "foto.jpg", "image/jpeg")).url;
    }
    if (file) {
      const uploaded = await uploadAttachment(conversationId, file.data, file.name, file.type);
      fileInfo = { url: uploaded.url, name: file.name, type: file.type, size: file.size };
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          body: clean,
          image_url: imageUrl,
          file_url: fileInfo?.url ?? null,
          file_name: fileInfo?.name ?? null,
          file_type: fileInfo?.type ?? null,
          file_size: fileInfo?.size ?? null,
          // las notas para uno mismo nacen leídas
          read_at: senderId === receiverId ? new Date().toISOString() : null
        }
      ])
      .select(COLUMNS)
      .single();

    if (error) throw new Error(error.message);

    return { ok: true, message: toMessage(data as MessageRow) };
  } catch (err) {
    return {
      ok: false,
      reason: "failed",
      detail: err instanceof Error ? err.message : "No se pudo enviar el mensaje."
    };
  }
}

/* =========================
   BORRAR
========================= */

// «Eliminar para todos»: solo para mensajes míos. Desaparece también en el chat de la otra persona.
export async function deleteMessageForEveryone(message: Message): Promise<void> {
  const { error } = await supabase.from("messages").delete().eq("id", message.id);

  if (error) {
    throw new Error(`No se pudo eliminar el mensaje: ${error.message}`);
  }

  // limpia también los archivos del bucket (si falla no importa)
  const paths = [message.image, message.file?.data]
    .map((url) => (url ? pathFromUrl(url) : null))
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    void supabase.storage.from(BUCKET).remove(paths);
  }
}

// «Eliminar para mí»: el mensaje sigue existiendo para la otra persona.
export async function deleteMessageForMe(message: Message, meId: string): Promise<void> {
  const { data, error: readError } = await supabase
    .from("messages")
    .select("deleted_for")
    .eq("id", message.id)
    .maybeSingle();

  if (readError) {
    throw new Error(`No se pudo eliminar el mensaje: ${readError.message}`);
  }
  if (!data) return; // ya no existe

  const current = (data.deleted_for as string[] | null) ?? [];
  if (current.includes(meId)) return;

  const { error } = await supabase
    .from("messages")
    .update({ deleted_for: [...current, meId] })
    .eq("id", message.id);

  if (error) {
    throw new Error(`No se pudo eliminar el mensaje: ${error.message}`);
  }
}

// «Eliminar chat» (como Instagram): solo para mí. La otra persona conserva todo.
// Sale de mis chats y vuelve sola cuando llega un mensaje nuevo (solo se ve lo posterior).
export async function deleteChatForMe(meId: string, peerId: string): Promise<void> {
  if (!isUuid(meId) || !isUuid(peerId)) return;

  // Se usa la hora del último mensaje (del servidor) para no depender del reloj del navegador.
  const { data: last, error: lastError } = await supabase
    .from("messages")
    .select("created_at")
    .eq("conversation_id", getConversationId(meId, peerId))
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastError) {
    throw new Error(`No se pudo eliminar el chat: ${lastError.message}`);
  }

  const { error } = await supabase.from("chat_state").upsert(
    [
      {
        user_id: meId,
        peer_id: peerId,
        cleared_at: last?.created_at ?? new Date().toISOString()
      }
    ],
    { onConflict: "user_id,peer_id" }
  );

  if (error) {
    throw new Error(`No se pudo eliminar el chat: ${error.message}`);
  }
}

/* =========================
   NO LEÍDOS
========================= */

// Marca como leídos los mensajes que `peerId` me envió.
export async function markConversationRead(meId: string, peerId: string): Promise<void> {
  if (!isUuid(meId) || !isUuid(peerId) || meId === peerId) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("sender_id", peerId)
    .eq("receiver_id", meId)
    .is("read_at", null);
}

/* =========================
   LISTA DE CHATS
========================= */
export type Contact = {
  id: string;
  name: string;
  role?: string;
};

export type ChatSummary = {
  last: Message | null;
  unread: number;
};

// Personas con las que se puede chatear: cuentas activas de Supabase, sin administradores.
export async function fetchContacts(meId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, fullName, role, isActive")
    .neq("role", "ADMIN")
    .order("fullName", { ascending: true })
    .limit(200);

  if (error) {
    throw new Error(`No se pudieron cargar los contactos: ${error.message}`);
  }

  return (data ?? [])
    .filter((u) => String(u.id) !== meId && u.isActive !== false)
    .map((u) => ({
      id: String(u.id),
      name: String(u.fullName ?? ""),
      role:
        u.role === "MODERATOR" ? "moderator" : "user"
    }));
}

// Último mensaje y no leídos de cada conversación en la que participo.
export async function fetchChatSummaries(
  meId: string
): Promise<Record<string, ChatSummary>> {
  if (!isUuid(meId)) return {};

  const [state, { data, error }] = await Promise.all([
    fetchClearState(meId),
    supabase
      .from("messages")
      .select(COLUMNS)
      .or(`sender_id.eq.${meId},receiver_id.eq.${meId}`)
      .order("created_at", { ascending: false })
      .limit(300)
  ]);

  if (error) {
    throw new Error(`No se pudieron cargar tus chats: ${error.message}`);
  }

  const summaries: Record<string, ChatSummary> = {};

  for (const row of (data ?? []) as MessageRow[]) {
    const message = toMessage(row);
    const peerId = message.senderId === meId ? message.receiverId : message.senderId;

    // lo que eliminé (el chat entero o solo ese mensaje) no cuenta
    const clearedAt = state[peerId]?.clearedAt;
    if (clearedAt && message.createdAt <= clearedAt) continue;
    if (message.deletedFor?.includes(meId)) continue;

    const entry = (summaries[peerId] ??= { last: null, unread: 0 });
    if (!entry.last) entry.last = message; // vienen del más nuevo al más viejo

    if (message.receiverId === meId && message.senderId !== meId && !message.readAt) {
      entry.unread += 1;
    }
  }

  return summaries;
}

/* =========================
   TIEMPO REAL
========================= */
// Avisa cuando se inserta, cambia o borra cualquier mensaje. Devuelve la función para dejar de escuchar.
export function subscribeToMessages(onChange: () => void): () => void {
  const channel = supabase
    .channel(`messages-${Math.random().toString(36).slice(2)}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "messages" },
      () => onChange()
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}