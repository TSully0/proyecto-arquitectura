import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import type { User } from "../../../business/types/user";
import { useFollows } from "../../hooks/useFollows";
import { searchUsers, type UserSearchResult } from "../../../data/repositories/publicProfile";
import { UserAvatar } from "../ui/UserAvatar";
import "../../../styles/profile/public-profile.css";

/*
  Botón del header para buscar personas por nombre o correo.
  Al elegir una, abre su perfil (/usuario/:id).
  Si alguien te envió una solicitud de seguimiento, muestra un punto rojo
  y un aviso que lleva a tu perfil, donde se acepta o se rechaza.
*/
interface UserSearchProps {
  user: User;
}

export function UserSearch({ user }: UserSearchProps) {
  const navigate = useNavigate();
  const { incoming } = useFollows(user);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // busca 300 ms después de dejar de escribir
  useEffect(() => {
    const clean = term.trim();

    if (clean.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(() => {
      searchUsers(clean)
        .then((found) => {
          if (!cancelled) setResults(found);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [term]);

  const close = () => {
    setOpen(false);
    setTerm("");
    setResults([]);
  };

  const openProfile = (id: string) => {
    close();
    navigate(`/usuario/${id}`);
  };

  const showEmpty = !loading && term.trim().length >= 2 && results.length === 0;

  return (
    <div className="user-search">
      <button
        type="button"
        className="notification-btn"
        title="Buscar personas"
        aria-label="Buscar personas"
        onClick={() => (open ? close() : setOpen(true))}
      >
        <Users size={20} />
        {incoming.length > 0 && <span className="notification-dot" />}
      </button>

      {open && (
        <>
          <div className="dropdown-overlay" onClick={close} />

          <div className="user-search-popover">
            <input
              ref={inputRef}
              type="text"
              className="user-search-input"
              placeholder="Buscar por nombre o correo..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") close();
              }}
            />

            {incoming.length > 0 && (
              <button
                type="button"
                className="user-search-requests"
                onClick={() => {
                  close();
                  navigate("/perfil");
                }}
              >
                Tienes {incoming.length}{" "}
                {incoming.length === 1 ? "solicitud" : "solicitudes"} de seguimiento · Ver
              </button>
            )}

            {term.trim().length < 2 && (
              <p className="user-search-hint">Escribe al menos 2 letras.</p>
            )}

            {loading && <p className="user-search-hint">Buscando...</p>}

            {showEmpty && (
              <p className="user-search-hint">No se encontró a nadie.</p>
            )}

            <ul className="user-search-list">
              {results.map((person) => (
                <li key={person.id}>
                  <button
                    type="button"
                    className="user-search-item"
                    onClick={() => openProfile(person.id)}
                  >
                    <UserAvatar
                      userId={person.id}
                      name={person.name}
                      size={32}
                      shape="circle"
                    />
                    <span className="user-search-text">
                      <span className="user-search-name">{person.name}</span>
                      <span className="user-search-email">{person.email}</span>
                    </span>
                    <span className={`profile-role ${person.role}`}>
                      {person.role}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
