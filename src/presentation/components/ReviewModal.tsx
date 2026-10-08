import { useState } from 'react';
import { X, Upload, MapPin } from 'lucide-react';
import type { CategoryId, Place } from '../../business/types/place';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: Place[];
  onSubmitReview: (review: { place_id: string; rating: number; comment: string }) => Promise<void>;
  onSubmit: (newPlace: {
    name: string;
    category_id: CategoryId;
    description: string;
    address: string;
    image_url: string;
    rating: number;
    has_student_discount: boolean;
    has_wifi: boolean;
    is_open: boolean;
    is_pet_friendly: boolean;
    is_accessible: boolean;
    is_night_spot: boolean;
  }) => Promise<void>;
}

export function ReviewModal({ isOpen, onClose, places, onSubmitReview, onSubmit }: ReviewModalProps) {
  const [mode, setMode] = useState<'review' | 'place'>('review');
  const [placeId, setPlaceId] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('comida');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [rating, setRating] = useState(5);
  const [hasStudentDiscount, setHasStudentDiscount] = useState(true);
  const [hasWifi, setHasWifi] = useState(true);
  const [isOpenNow, setIsOpenNow] = useState(true);
  const [isPetFriendly, setIsPetFriendly] = useState(false);
  const [isAccessible, setIsAccessible] = useState(false);
  const [isNightSpot, setIsNightSpot] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      if (mode === 'review') {
        if (!placeId || !reviewComment.trim()) {
          throw new Error('Selecciona un lugar y escribe tu reseña.');
        }
        await onSubmitReview({ place_id: placeId, rating, comment: reviewComment.trim() });
        setReviewComment('');
      } else {
        if (!name.trim() || !description.trim()) {
          throw new Error('Completa el nombre del lugar y la descripción.');
        }
        await onSubmit({
          name: name.trim(),
          category_id: categoryId,
          description: description.trim(),
          address: address.trim() || 'Manta, Ecuador',
          image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
          rating,
          has_student_discount: hasStudentDiscount,
          has_wifi: hasWifi,
          is_open: isOpenNow,
          is_pet_friendly: isPetFriendly,
          is_accessible: isAccessible,
          is_night_spot: isNightSpot
        });
        setName('');
        setDescription('');
        setAddress('');
        setImageUrl('');
      }
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo publicar. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-tag">HUECAS MANABAS COMUNIDAD</span>
            <h2 className="modal-title">
              {mode === 'review' ? 'Escribe una reseña' : 'Recomienda un lugar'}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={handleClose} disabled={isSubmitting} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className={mode === 'review' ? 'btn-submit' : 'btn-cancel'}
            onClick={() => { setMode('review'); setSubmitError(null); }}
            disabled={isSubmitting}
          >
            Reseñar un lugar
          </button>
          <button
            type="button"
            className={mode === 'place' ? 'btn-submit' : 'btn-cancel'}
            onClick={() => { setMode('place'); setSubmitError(null); }}
            disabled={isSubmitting}
          >
            Recomendar lugar nuevo
          </button>
        </div>

        {submitError && <div className="feed-status-banner" role="alert">{submitError}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          {mode === 'review' ? (
            <>
              <div className="form-group">
                <label htmlFor="review-place">Lugar que deseas reseñar *</label>
                <select
                  id="review-place"
                  required
                  value={placeId}
                  onChange={(e) => setPlaceId(e.target.value)}
                >
                  <option value="">Selecciona un lugar</option>
                  {places.map((place) => (
                    <option key={place.id} value={place.id}>{place.name}</option>
                  ))}
                </select>
                {places.length === 0 && <small>No hay lugares disponibles para reseñar.</small>}
              </div>
              <div className="form-group">
                <label>Calificación *</label>
                <div className="rating-select">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`star-select-btn ${rating >= star ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                      aria-label={`${star} estrellas`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="review-comment">Tu reseña *</label>
                <textarea
                  id="review-comment"
                  required
                  rows={4}
                  maxLength={2000}
                  placeholder="Cuéntale a la comunidad cómo fue tu experiencia..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>
            </>
          ) : (
          <>
          <div className="form-group">
            <label>Nombre del Lugar *</label>
            <input
              type="text"
              required
              placeholder="Ej: La Hueca de Pedro, Cineplex, Playa Murciélago..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoría</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value as CategoryId)}
              >
                <option value="cines">Cines</option>
                <option value="comida">Comida</option>
                <option value="historicos">Lugares Históricos</option>
                <option value="extremos">Deportes Extremos</option>
                <option value="naturaleza">Naturaleza</option>
              </select>
            </div>

            <div className="form-group">
              <label>Calificación</label>
              <div className="rating-select">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={`star-select-btn ${rating >= star ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Descripción / Comentario *</label>
            <textarea
              required
              rows={3}
              placeholder="¿Qué tal es la experiencia para estudiantes? Comida, ambiente, precios..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Dirección / Ubicación en Manta</label>
            <div className="input-with-icon">
              <MapPin size={16} className="input-icon" />
              <input
                type="text"
                placeholder="Ej: Av. Malecón y Calle 23, Tarqui, Manta"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>URL de Imagen (Opcional)</label>
            <div className="input-with-icon">
              <Upload size={16} className="input-icon" />
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Características y Servicios</label>
            <div className="form-checkboxes">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={hasStudentDiscount}
                  onChange={(e) => setHasStudentDiscount(e.target.checked)}
                />
                <span>$ Descuento Estudiante</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={hasWifi}
                  onChange={(e) => setHasWifi(e.target.checked)}
                />
                <span>WiFi Disponible</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={isOpenNow}
                  onChange={(e) => setIsOpenNow(e.target.checked)}
                />
                <span>Abierto Actualmente</span>
              </label>

              {/* Nuevas opciones requeridas */}
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={isPetFriendly}
                  onChange={(e) => setIsPetFriendly(e.target.checked)}
                />
                <span>🐾 Pet Friendly (Mascotas permitidas)</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={isAccessible}
                  onChange={(e) => setIsAccessible(e.target.checked)}
                />
                <span>♿ Accesible (Rampas / Discapacidad)</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={isNightSpot}
                  onChange={(e) => setIsNightSpot(e.target.checked)}
                />
                <span>🌙 Nocturno (Ambiente y horario nocturno)</span>
              </label>
            </div>
          </div>
          </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting || (mode === 'review' && places.length === 0)}>
              {isSubmitting ? 'Publicando...' : mode === 'review' ? 'Publicar reseña' : 'Recomendar lugar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
