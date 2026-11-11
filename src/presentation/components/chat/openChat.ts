/*
  Abre el chat flotante con una persona desde cualquier pantalla
  (por ejemplo, el botón «Mensaje» de un perfil).
  MessengerWidget escucha este evento.
*/
export const OPEN_CHAT_EVENT = "open-chat";

export type ChatPeer = { id: string; name: string; role?: string };

export const openChat = (peer: ChatPeer) => {
  window.dispatchEvent(new CustomEvent<ChatPeer>(OPEN_CHAT_EVENT, { detail: peer }));
};
