// data/repositories/messages.ts
// "Base de datos" de mensajes (localStorage).
// Más adelante se puede cambiar por Supabase/API sin tocar el componente:
// solo hay que reemplazar el cuerpo de estas funciones.

export type Message = {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    text: string;
    createdAt: string;
    };

    export const MESSAGES_KEY = "app_messages";
    export const MAX_MESSAGE_LENGTH = 500;

    // misma conversación sin importar quién la abra (A-B = B-A).
    // Si a === b es el chat "contigo mismo".
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

    // mensajes de una conversación, del más viejo al más nuevo
    export const getMessages = (a: string, b: string): Message[] => {
    const id = getConversationId(a, b);

    return readAll()
        .filter((m) => m.conversationId === id)
        .sort((x, y) => x.createdAt.localeCompare(y.createdAt));
    };

    export const sendMessage = (
    senderId: string,
    receiverId: string,
    text: string
    ): Message | null => {
    const clean = text.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!clean) return null;

    const message: Message = {
        id: crypto.randomUUID(),
        conversationId: getConversationId(senderId, receiverId),
        senderId,
        receiverId,
        text: clean,
        createdAt: new Date().toISOString()
    };

    writeAll([...readAll(), message]);
    return message;
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

    // otras personas registradas con las que se puede chatear
    // (sin admins ni cuentas baneadas). Para chatear SOLO contigo mismo,
    // haz que esta función devuelva [].
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
        .map((u: any) => ({ id: String(u.id), name: String(u.name), role: u.role }))
        .sort((a: Contact, b: Contact) => a.name.localeCompare(b.name));
    } catch {
        return [];
    }
};