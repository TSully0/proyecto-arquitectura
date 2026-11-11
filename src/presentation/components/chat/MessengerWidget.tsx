import { useCallback, useEffect, useState } from "react";
import { MessageCircle, Search, Trash2, X } from "lucide-react";
import type { User } from "../../../business/types/user";
import { ChatBox } from "./ChatBox";
import { OPEN_CHAT_EVENT, type ChatPeer } from "./openChat";
import { UserAvatar } from "../ui/UserAvatar";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useToast } from "../ui/toast-context";
import { deleteChatForMe, fetchChatSummaries, fetchContacts, subscribeToMessages } from "../../../data/repositories/messages";
import type { ChatSummary, Contact } from "../../../data/repositories/messages";
import { getSupabaseUserId } from "../../../data/repositories/places";

import "../../../styles/chat/chat.css";

/*
  Chat flotante (como Messenger / Instagram):
  • Siempre aparece APAGADO: solo se ve el botón redondo.
  • Al pulsarlo se abre la lista de chats.
  • Al elegir una persona se abre la conversación.

  Uso:  <MessengerWidget me={user} />
*/
interface MessengerWidgetProps {
  me: User;
}

const shortTime = (iso: string) => {
  const d = new Date(iso);

  if (d.toDateString() === new Date().toDateString()) {
    return d.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
  }

  return d.toLocaleDateString("es-EC", { day: "numeric", month: "short" });
};

export function MessengerWidget({ me }: MessengerWidgetProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<Contact | null>(null);
  const { success, error } = useToast();
  const [myId, setMyId] = useState<string>(me.id);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [summaries, setSummaries] = useState<Record<string, ChatSummary>>({});

  // el id de la sesión puede no ser el de Supabase (cuentas viejas): se busca por correo
  useEffect(() => {
    let cancelled = false;
    getSupabaseUserId(me.email)
      .then((id) => {
        if (!cancelled) setMyId(id);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [me.email]);

  const refresh = useCallback(async () => {
    try {
      const [people, sums] = await Promise.all([
        fetchContacts(myId),
        fetchChatSummaries(myId)
      ]);
      setContacts(people);
      setSummaries(sums);
    } catch (err) {
      console.warn(err);
    }
  }, [myId]);

  // lista de chats y no leídos en tiempo real (+ respaldo cada 15 s y al volver a la pestaña)
  useEffect(() => {
    void refresh();

    const stop = subscribeToMessages(() => void refresh());
    const timer = window.setInterval(() => void refresh(), 15000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      stop();
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  // al cerrar una conversación se actualiza la lista (ya quedó leída)
  useEffect(() => {
    if (!active) void refresh();
  }, [active, refresh]);

  // abrir una conversación desde otra pantalla (botón «Mensaje» de un perfil)
  useEffect(() => {
    const onOpenChat = (e: Event) => {
      const peer = (e as CustomEvent<ChatPeer>).detail;
      if (!peer?.id) return;

      setActive({ id: peer.id, name: peer.name, role: peer.role });
      setOpen(true);
    };

    window.addEventListener(OPEN_CHAT_EVENT, onOpenChat);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpenChat);
  }, []);

  /* =========================
     LISTA DE CHATS
  ========================= */
  const selfContact: Contact = { id: myId, name: me.name, role: me.role };

  const totalUnread = Object.entries(summaries).reduce(
    (sum, [peerId, entry]) => (peerId === myId ? sum : sum + entry.unread),
    0
  );

  const term = search.trim().toLowerCase();

  const allRows = [selfContact, ...contacts]
    .map((contact) => ({
      contact,
      last: summaries[contact.id]?.last ?? null,
      unread: summaries[contact.id]?.unread ?? 0
    }))
    .filter((r) => r.contact.name.toLowerCase().includes(term));

  // «Chats»: conversaciones con mensajes visibles (tú siempre primero). Lo eliminado vuelve a aparecer si te escriben.
  const chatRows = allRows
    .filter((r) => r.contact.id === myId || r.last)
    .sort((a, b) => {
      if (a.contact.id === myId) return -1;
      if (b.contact.id === myId) return 1;
      return (b.last?.createdAt ?? "").localeCompare(a.last?.createdAt ?? "");
    });

  // «Otras personas»: para empezar un chat nuevo
  const otherRows = allRows
    .filter((r) => r.contact.id !== myId && !r.last)
    .sort((a, b) => a.contact.name.localeCompare(b.contact.name));

  const confirmDeleteChat = async () => {
    const contact = toDelete;
    if (!contact) return;
    setToDelete(null);
    try {
      await deleteChatForMe(myId, contact.id);
      await refresh();
      success(`Chat con ${contact.name} eliminado`);
    } catch (err) {
      error(err instanceof Error ? err.message : "No se pudo eliminar el chat");
    }
  };

  const renderRow = ({ contact, last, unread }: (typeof allRows)[number]) => {
    const isSelf = contact.id === myId;

    const preview = last
      ? `${last.senderId === myId && !isSelf ? "Tú: " : ""}${last.text || (last.image ? "📷 Foto" : "📎 Archivo")}`
      : isSelf
      ? "Escribe una nota para ti"
      : "Sin mensajes todavía";

    return (
      <div key={contact.id} className="msg-item-wrap">
        <button
          type="button"
          className={`msg-item${unread > 0 ? " unread" : ""}`}
          onClick={() => setActive(contact)}
        >
          <UserAvatar userId={contact.id} name={contact.name} size={46} shape="circle" />

          <div className="msg-item-info">
            <span className="msg-item-name">
              {isSelf ? `${contact.name} (Tú)` : contact.name}
            </span>
            <span className="msg-item-preview">{preview}</span>
          </div>

          {last && <span className="msg-item-time">{shortTime(last.createdAt)}</span>}

          {unread > 0 && <span className="msg-unread-badge">{unread}</span>}
        </button>

        {last && (
          <button
            type="button"
            className="msg-item-delete"
            title="Eliminar chat (solo para ti)"
            onClick={() => setToDelete(contact)}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* PANEL (solo existe cuando está abierto) */}
      {open && (
        <div className="msg-panel">
          {active ? (
            <ChatBox
              key={active.id}
              me={me}
              myId={myId}
              peer={active}
              onBack={() => setActive(null)}
              onClose={() => setOpen(false)}
            />
          ) : (
            <>
              <div className="msg-header">
                <span>Chats</span>
                <button
                  type="button"
                  className="msg-close"
                  title="Cerrar"
                  onClick={() => setOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="msg-search-wrap">
                <Search size={16} />
                <input
                  className="msg-search"
                  placeholder="Buscar persona..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="msg-list">
                {chatRows.length === 0 && otherRows.length === 0 && (
                  <div className="msg-empty">No se encontraron personas</div>
                )}

                {chatRows.map(renderRow)}

                {otherRows.length > 0 && (
                  <div className="msg-section-title">Otras personas</div>
                )}
                {otherRows.map(renderRow)}
              </div>
            </>
          )}
        </div>
      )}

      <Modal
        isOpen={toDelete !== null}
        title="Eliminar chat"
        onClose={() => setToDelete(null)}
        maxWidth={400}
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => void confirmDeleteChat()}>
              Eliminar chat
            </Button>
          </>
        }
      >
        <p>
          Se elimina solo para ti. {toDelete?.name} conserva sus mensajes y, si te
          escribe, el chat vuelve a aparecer con los mensajes nuevos.
        </p>
      </Modal>

      {/* BOTÓN REDONDO (siempre visible) */}
      <button
        type="button"
        className="msg-fab"
        title={open ? "Cerrar mensajes" : "Mensajes"}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && totalUnread > 0 && (
          <span className="msg-fab-badge">{totalUnread > 9 ? "9+" : totalUnread}</span>
        )}
      </button>
    </>
  );
}
