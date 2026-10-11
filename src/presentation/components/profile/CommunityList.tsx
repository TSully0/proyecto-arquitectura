import { Users } from "lucide-react";

import type { CommunityUser, FollowStatus } from "../../../business/types/profile";
import { FollowButton } from "./FollowButton";

interface CommunityListProps {
  people: CommunityUser[];
  statusOf: (personId: string) => FollowStatus;
  onFollow: (person: CommunityUser) => void;
  onUnfollow: (person: CommunityUser) => void;
}

export function CommunityList({ people, statusOf, onFollow, onUnfollow }: CommunityListProps) {
  return (
    <section className="profile-section">
      <div className="profile-section-title">
        <Users size={20} />
        <h2>Comunidad</h2>
      </div>

      <div className="profile-people-grid">
        {people.map((p) => (
          <div key={p.id} className="profile-person-card">
            <div className="profile-person-avatar">
              {p.name.charAt(0)}
            </div>

            <div className="profile-person-info">
              <strong>{p.name}</strong>
              <span>{p.role}</span>
            </div>

            <FollowButton
              status={statusOf(p.id)}
              onFollow={() => onFollow(p)}
              onUnfollow={() => onUnfollow(p)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
