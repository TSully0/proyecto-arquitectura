import { useEffect, useState } from "react";
import { MessageCircle, Search, X } from "lucide-react";
import type { User } from "../../business/types/user";
import { ChatBox } from "./ChatBox";
import { getContacts, getMessages, MESSAGES_KEY } from "../../data/repositories/messages";
import type { Contact } from "../../data/repositories/messages";

import "../../styles/chat.css";

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
    const [, setTick] = useState(0);

    // refrescar la lista si otra pestaña escribe un mensaje
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
        if (e.key === MESSAGES_KEY || e.key === null) setTick((t) => t + 1);
        };

        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    /* =========================
        LISTA DE CHATS
    ========================= */
    const selfContact: Contact = { id: me.id, name: me.name, role: me.role };

    const rows = [selfContact, ...getContacts(me.id)]
        .map((contact) => {
        const msgs = getMessages(me.id, contact.id);
        return { contact, last: msgs[msgs.length - 1] };
        })
        .filter((r) =>
        r.contact.name.toLowerCase().includes(search.trim().toLowerCase())
        )
        .sort((a, b) => {
        if (a.contact.id === me.id) return -1; // tú siempre primero
        if (b.contact.id === me.id) return 1;
        if (a.last && b.last) return b.last.createdAt.localeCompare(a.last.createdAt);
        if (a.last) return -1;
        if (b.last) return 1;
        return a.contact.name.localeCompare(b.contact.name);
        });

    return (
        <>
        {/* PANEL (solo existe cuando está abierto) */}
        {open && (
            <div className="msg-panel">
            {active ? (
                <ChatBox
                key={active.id}
                me={me}
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
                    {rows.length === 0 && (
                    <div className="msg-empty">No se encontraron personas</div>
                    )}

                    {rows.map(({ contact, last }) => {
                    const isSelf = contact.id === me.id;

                    const preview = last
                        ? `${last.senderId === me.id && !isSelf ? "Tú: " : ""}${last.text}`
                        : isSelf
                        ? "Escribe una nota para ti"
                        : "Sin mensajes todavía";

                    return (
                        <button
                        key={contact.id}
                        type="button"
                        className="msg-item"
                        onClick={() => setActive(contact)}
                        >
                        <div className="msg-item-avatar">
                            {contact.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="msg-item-info">
                            <span className="msg-item-name">
                            {isSelf ? `${contact.name} (Tú)` : contact.name}
                            </span>
                            <span className="msg-item-preview">{preview}</span>
                        </div>

                        {last && (
                            <span className="msg-item-time">
                            {shortTime(last.createdAt)}
                            </span>
                        )}
                        </button>
                    );
                    })}
                </div>
                </>
            )}
            </div>
        )}

        {/* BOTÓN REDONDO (siempre visible) */}
        <button
            type="button"
            className="msg-fab"
            title={open ? "Cerrar mensajes" : "Mensajes"}
            onClick={() => setOpen((o) => !o)}
        >
            {open ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
        </>
    );
}
