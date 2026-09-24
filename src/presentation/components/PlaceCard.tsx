import { Heart, MessageSquare, Bookmark, Check } from 'lucide-react';
import type { Place } from '../../business/types/place';

interface PlaceCardProps {
  place: Place;
  isLiked: boolean;
  isSaved: boolean;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onComment: (place: Place) => void;
}

export function PlaceCard({
  place,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
  onComment
}: PlaceCardProps) {
  return (
    <article className="manta-place-card">
      {/* Place Image */}
      <div className="card-image-wrap">
        <img
          src={place.image_url}
          alt={place.name}
          className="card-image"
          loading="lazy"
        />
      </div>

      {/* Place Content */}
      <div className="card-content">
        <h2 className="card-title" title={place.name}>
          {place.name}
        </h2>

        {/* Stars */}
        <div className="card-rating-stars" aria-label={`Calificación ${place.rating} de 5 estrellas`}>
          <span className="star">★</span>
          <span className="star">★</span>
          <span className="star">★</span>
          <span className="star">★</span>
          <span className="star">★</span>
        </div>

        {/* Description / Address */}
        <p className="card-description">
          {place.description}
        </p>

        {/* Badges: $ Estudiante ✓ | WiFi ✓ | Abierto ✓ */}
        <div className="card-badges-row">
          {place.has_student_discount && (
            <span className="badge-item badge-student">
              <span className="badge-symbol">$</span> Estudiante <Check size={12} className="badge-check" />
            </span>
          )}
          {place.has_wifi && (
            <span className="badge-item badge-wifi">
              WiFi <Check size={12} className="badge-check" />
            </span>
          )}
          {place.is_open && (
            <span className="badge-item badge-open">
              Abierto <Check size={12} className="badge-check" />
            </span>
          )}
        </div>

        {/* Actions Bar */}
        <div className="card-actions-bar">
          <button
            className={`action-btn ${isLiked ? 'liked' : ''}`}
            onClick={() => onToggleLike(place.id)}
            aria-label="Dar Me Gusta"
          >
            <Heart size={16} fill={isLiked ? '#0cb7f2' : 'none'} color={isLiked ? '#0cb7f2' : 'currentColor'} />
            <span>Me Gusta</span>
          </button>

          <button
            className="action-btn"
            onClick={() => onComment(place)}
            aria-label="Comentar lugar"
          >
            <MessageSquare size={16} />
            <span>Comentar</span>
          </button>

          <button
            className={`action-btn ${isSaved ? 'saved' : ''}`}
            onClick={() => onToggleSave(place.id)}
            aria-label="Guardar en mi lista"
          >
            <Bookmark size={16} fill={isSaved ? '#0cb7f2' : 'none'} color={isSaved ? '#0cb7f2' : 'currentColor'} />
            <span>Guardar</span>
          </button>
        </div>
      </div>
    </article>
  );
}
