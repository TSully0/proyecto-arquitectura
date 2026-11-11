import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, MessageCircle, Users } from "lucide-react";
import type { CommunityUser, FollowStatus } from "../../../business/types/profile";
import { FollowButton } from "./FollowButton";
import { UserAvatar } from "../ui/UserAvatar";

interface CommunityListProps {
  people: CommunityUser[];
  statusOf: (personId: string) => FollowStatus;
  onFollow: (person: CommunityUser) => void;
  onUnfollow: (person: CommunityUser) => void;
  onMessage?: (person: CommunityUser) => void;
}

// Cuántas personas se ven antes de pulsar «Ver más»
const VISIBLE_BY_DEFAULT = 5;

export function CommunityList({
  people,
  statusOf,
  onFollow,
  onUnfollow,
  onMessage
}: CommunityListProps) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? people : people.slice(0, VISIBLE_BY_DEFAULT);
  const hidden = people.length - VISIBLE_BY_DEFAULT;

  return (
    <section className="profile-section">
      <div className="profile-section-title">
        <Users size={20} />
        <h2>Comunidad</h2>
      </div>

      {people.length === 0 && (
        <p className="profile-empty">Todavía no hay otras personas registradas.</p>
      )}

      <div className="profile-people-grid">
        {visible.map((p) => (
          <div key={p.id} className="profile-person-card">
            <UserAvatar userId={p.id} name={p.name} size={45} shape="circle" />

            <div className="profile-person-info">
              <strong>
                <Link to={`/usuario/${p.id}`} className="profile-person-link">
                  {p.name}
                </Link>
              </strong>
              <span>{p.role}</span>
            </div>

            <FollowButton
              status={statusOf(p.id)}
              onFollow={() => onFollow(p)}
              onUnfollow={() => onUnfollow(p)}
            />

            {onMessage && (
              <button
                type="button"
                className="profile-message-btn"
                title="Enviar mensaje"
                onClick={() => onMessage(p)}
              >
                <MessageCircle size={16} />
                Mensaje
              </button>
            )}
          </div>
        ))}
      </div>

      {people.length > VISIBLE_BY_DEFAULT && (
        <button
          type="button"
          className="profile-show-more-btn"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? (
            <>
              <ChevronUp size={16} />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Ver más ({hidden})
            </>
          )}
        </button>
      )}
    </section>
  );
}