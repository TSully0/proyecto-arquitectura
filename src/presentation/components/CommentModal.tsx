import { useState } from 'react';
import { X, CheckCircle2, HelpCircle } from 'lucide-react';
import type { Place } from '../../business/types/place';

interface CommentModalProps {
  isOpen: boolean;
  place: Place | null;
  onClose: () => void;
  onSubmit: (commentData: {
    text: string;
    hasVisited: boolean;
    rating?: number;
  }) => void;
}

export function CommentModal({ isOpen, place, onClose, onSubmit }: CommentModalProps) {
  const [hasVisited, setHasVisited] = useState<boolean>(true);
  const [rating, setRating] = useState<number>(5);
  const [commentText, setCommentText] = useState<string>('');

  if (!isOpen || !place) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onSubmit({
      text: commentText.trim(),
      hasVisited,
      rating: hasVisited ? rating : undefined
    });

    setCommentText('');
    setHasVisited(true);
    setRating(5);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog comment-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-tag">COMENTARIO DE LA COMUNIDAD</span>
            <h2 className="modal-title">{place.name}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar ventana">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Question: Has visitado este lugar? */}
          <div className="visit-question-section">
            <label className="section-label">¿Has visitado este lugar?</label>
            <div className="visit-options-grid">
              <button
                type="button"
                className={`visit-option-card ${hasVisited ? 'active' : ''}`}
                onClick={() => setHasVisited(true)}
              >
                <CheckCircle2 size={18} className="option-icon" />
                <div className="option-text">
                  <strong>Sí, lo he visitado</strong>
                  <small>Puedo calificar con estrellas mi experiencia</small>
                </div>
              </button>

              <button
                type="button"
                className={`visit-option-card ${!hasVisited ? 'active' : ''}`}
                onClick={() => setHasVisited(false)}
              >
                <HelpCircle size={18} className="option-icon" />
                <div className="option-text">
                  <strong>No lo he visitado aún</strong>
                  <small>Tengo una duda o pregunta sobre el lugar</small>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Star Rating (Only if hasVisited is TRUE) */}
          {hasVisited && (
            <div className="rating-conditional-box">
              <label className="section-label">Califica tu experiencia:</label>
              <div className="stars-picker-row">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    className={`star-pick-btn ${rating >= starValue ? 'active' : ''}`}
                    onClick={() => setRating(starValue)}
                    aria-label={`${starValue} estrellas`}
                  >
                    ★
                  </button>
                ))}
                <span className="rating-feedback-badge">
                  {rating} de 5 estrellas
                </span>
              </div>
            </div>
          )}

          {/* Comment text area */}
          <div className="form-group">
            <label htmlFor="comment-textarea">Tu comentario o reseña:</label>
            <textarea
              id="comment-textarea"
              required
              rows={4}
              placeholder={
                hasVisited
                  ? 'Cuenta qué tal te pareció el ambiente, la atención, precios y si lo recomiendas...'
                  : 'Escribe tu consulta sobre horarios, ubicación o precios para la comunidad...'
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Publicar Comentario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
