
export type ChatFile = {
  name: string;
  type: string;
  size: number;
  data: string;
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
};

export const MESSAGES_KEY = "app_messages";
export const MAX_MESSAGE_LENGTH = 500;

export const getConversationId = (a: string, b: string) =>
  [a, b].sort().join("__");

const readAll = (): Message[] => {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAll = (messages: Message[]) =>
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

export const getMessages = (a: string, b: string): Message[] => {
  const id = getConversationId(a, b);

  return readAll()
    .filter((m) => m.conversationId === id)
    .sort((x, y) => x.createdAt.localeCompare(y.createdAt));
};

export type SendResult =
  | { ok: true; message: Message }
  | { ok: false; reason: "empty" | "storage" };

export const sendMessage = (
  senderId: string,
  receiverId: string,
  text: string,
  image?: string,
  file?: ChatFile
): SendResult => {
  const clean = text.trim().slice(0, MAX_MESSAGE_LENGTH);

  if (!clean && !image && !file) {
    return { ok: false, reason: "empty" };
  }

  const message: Message = {
    id: crypto.randomUUID(),
    conversationId: getConversationId(senderId, receiverId),
    senderId,
    receiverId,
    text: clean,
    ...(image ? { image } : {}),
    ...(file ? { file } : {}),
    createdAt: new Date().toISOString()
  };

  try {
    writeAll([...readAll(), message]);
  } catch {
    return { ok: false, reason: "storage" };
  }

  return { ok: true, message };
};

export const deleteMessage = (id: string) =>
  writeAll(readAll().filter((m) => m.id !== id));

export const clearConversation = (a: string, b: string) => {
  const id = getConversationId(a, b);
  writeAll(readAll().filter((m) => m.conversationId !== id));
};

/* =========================
   CONTACTOS (lista de chats)
========================= */

export type Contact = {
  id: string;
  name: string;
  role?: string;
};

export const getContacts = (meId: string): Contact[] => {
  try {
    const raw = localStorage.getItem("app_users");
    const users = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(users)) return [];

    return users
      .filter(
        (u: any) =>
          u &&
          u.id !== meId &&
          String(u.role).toLowerCase().trim() !== "admin" &&
          !u.banned
      )
      .map((u: any) => ({
        id: String(u.id),
        name: String(u.name),
        role: u.role
      }))
      .sort((a: Contact, b: Contact) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
};
