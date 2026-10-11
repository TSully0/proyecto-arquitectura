import { UserMinus, UserPlus, Users } from "lucide-react";
import type { Follow } from "../../../business/types/follow";
import type { CommunityUser } from "./ProfileTypes";

interface CommunitySectionProps {
  people: CommunityUser[];
  userId: string;
  follows: Follow[];
  onFollow: (person: CommunityUser) => void;
  onUnfollow: (person: CommunityUser) => void;
}

export function CommunitySection({
  people,
  userId,
  follows,
  onFollow,
  onUnfollow
}: CommunitySectionProps) {
  return (
    <section className="profile-section">
      <div className="profile-section-title">
        <Users size={20} />
        <h2>Comunidad</h2>
      </div>
      <div className="profile-people-grid">
        {people.map((person) => {
          const relation = follows.find(
            (follow) =>
              follow.followerId === userId && follow.followingId === person.id
          );

          return (
            <div key={person.id} className="profile-person-card">
              <div className="profile-person-avatar">
                {person.name.charAt(0)}
              </div>
              <div className="profile-person-info">
                <strong>{person.name}</strong>
                <span>{person.role}</span>
              </div>
              {relation?.status === "accepted" ? (
                <button
                  className="profile-unfollow-btn"
                  onClick={() => onUnfollow(person)}
                >
                  <UserMinus size={16} />
                  Siguiendo
                </button>
              ) : relation?.status === "pending" ? (
                <button
                  className="profile-pending-btn"
                  title="Clic para cancelar la solicitud"
                  onClick={() => onUnfollow(person)}
                >
                  ⏳ Pendiente
                </button>
              ) : (
                <button
                  className="profile-follow-btn"
                  onClick={() => onFollow(person)}
                >
                  <UserPlus size={16} />
                  Seguir
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
