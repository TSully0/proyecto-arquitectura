import { Heart, MapPin, MessageCircle } from "lucide-react";
import type { ProfilePost } from "../../../business/types/profile";

interface PostGridProps {
  posts: ProfilePost[];
  title?: string;
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
}

export function PostGrid({
  posts,
  title = "Tus publicaciones",
  loading = false,
  loadingMessage = "Cargando tus publicaciones...",
  emptyMessage = "Aún no tienes publicaciones. Comenta o reseña un lugar desde el inicio y aparecerá aquí."
}: PostGridProps) {
  return (
    <section className="profile-section">
      <h2>{title}</h2>

      {loading && <p className="profile-empty">{loadingMessage}</p>}

      {!loading && posts.length === 0 && (
        <p className="profile-empty">{emptyMessage}</p>
      )}

      <div className="profile-posts-grid">
        {posts.map((post) => (
          <article key={post.id} className="profile-post-card">
            <img
              src={post.image}
              alt={post.title}
              className="profile-post-image"
            />

            <div className="profile-post-content">
              <h3>{post.title}</h3>

              <div className="profile-post-location">
                <MapPin size={14} />
                {post.location}
              </div>

              <p>{post.description}</p>

              <div className="profile-post-stats">
                <span><Heart size={16} /> {post.likes}</span>
                <span><MessageCircle size={16} /> {post.comments}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}