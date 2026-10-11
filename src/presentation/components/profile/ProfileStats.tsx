interface ProfileStatsProps {
  posts: number;
  followers: number;
  following: number;
}

export function ProfileStats({ posts, followers, following }: ProfileStatsProps) {
  return (
    <section className="profile-stats">
      <div className="profile-stat">
        <strong>{posts}</strong>
        <span>Publicaciones</span>
      </div>

      <div className="profile-stat">
        <strong>{followers}</strong>
        <span>Seguidores</span>
      </div>

      <div className="profile-stat">
        <strong>{following}</strong>
        <span>Siguiendo</span>
      </div>
    </section>
  );
}
