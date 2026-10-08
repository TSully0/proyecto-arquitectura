import { useState, useEffect } from 'react';
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Camera,
  Star,
  MapPin,
  Send,
  Check,
  Globe
} from 'lucide-react';
import type { User } from '../../business/types/user';
import type { Place, CommunityPost, CommunityComment, CategoryId } from '../../business/types/place';
import { CommentModal } from './CommentModal';
import {
  addReviewToSupabase,
  fetchReviewsByPlaceIds,
  resolvePlaceId
} from '../../data/repositories/places';

// Avatar por defecto para los comentarios que vienen de la base de datos
const COMMENT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';

// Convierte la fecha de Supabase en un texto tipo "Hace 5 min"
function formatRelativeTime(isoDate?: string): string {
  if (!isoDate) return 'Hace un momento';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  if (Number.isNaN(diffMs)) return 'Hace un momento';

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Justo ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Ayer' : `Hace ${days} días`;
}

interface FacebookFeedProps {
  user: User;
  places: Place[];
  activeCategory: CategoryId;
  activeSection: 'all' | 'saved' | 'nearby' | 'trends';
  savedPlaceIds: string[];
  favoriteError: string | null;
  onToggleFavorite: (placeId: string) => Promise<void>;
  reviewsRefreshKey: number;
  onOpenCreateReview: () => void;
  onSelectPlace?: (place: Place) => void;
}

export function FacebookFeed({
  user,
  places,
  activeCategory,
  activeSection,
  savedPlaceIds,
  favoriteError,
  onToggleFavorite,
  reviewsRefreshKey,
  onOpenCreateReview,
  onSelectPlace
}: FacebookFeedProps) {
  // Modal de Comentario flotante
  const [commentModalState, setCommentModalState] = useState<{
    isOpen: boolean;
    place: Place | null;
    postId: string | null;
  }>({
    isOpen: false,
    place: null,
    postId: null
  });

  // Publicaciones iniciales de la comunidad
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: 'post-1',
      authorName: 'Ana G.',
      authorRole: 'Estudiante ULEAM',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      timestamp: 'Hace 2 horas',
      locationName: 'Cineplex Manta - Mall del Pacífico',
      content: '¡Ayer fuimos con los chicos de la facultad al Cineplex! El combo universitario de canguil y gaseosa nos salió con descuento mostrando el carnet. Las salas están impecables, el aire acondicionado al 100% y la cartelera tiene todos los estrenos. ¡Plan perfecto para relajarse después de parciales! 🍿🎬✨',
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
      place: places[0] || {
        id: 'cineplex-manta',
        name: 'Cineplex Manta - Mall del Pacífico',
        category_id: 'cines',
        description: 'Cineplex Manta - Mall del Pacífico - Glorietas Universitarios, Manta.',
        image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
        rating: 5.0,
        review_count: 142,
        has_student_discount: true,
        has_wifi: true,
        is_open: true,
        is_accessible: true
      },
      likesCount: 54,
      isLiked: false,
      commentsCount: 2,
      comments: [
        {
          id: 'c-1',
          authorName: 'Carlos Mendoza',
          authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
          text: 'Totalmente de acuerdo, los martes de promo son los mejores para ir!',
          timestamp: 'Hace 1 hora',
          hasVisited: true,
          rating: 5
        },
        {
          id: 'c-2',
          authorName: 'María Moderadora',
          authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
          text: '¿Alguien sabe si el descuento aplica también los fines de semana?',
          timestamp: 'Hace 30 min',
          hasVisited: false
        }
      ]
    },
    {
      id: 'post-2',
      authorName: 'Juan Pérez',
      authorRole: 'Estudiante Ingeniería',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
      timestamp: 'Hace 5 horas',
      locationName: 'Tarqui, Manta',
      content: 'Si buscan mariscos frescos de verdad y a buen precio, tienen que ir a La Hueca de Pedro en Tarqui. El ceviche mixto y el arroz marinero vienen súper cargados. Con $5 almuerzas como rey frente al puerto pesquero 🦐🐟🍲',
      imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80',
      place: places[1] || {
        id: 'la-hueca-de-pedro',
        name: 'La Hueca de Pedro - Mariscos',
        category_id: 'comida',
        description: 'La Hueca de Pedro - Mariscos com corrdid y paraumente en Manta.',
        image_url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
        rating: 5.0,
        review_count: 98,
        has_student_discount: true,
        has_wifi: true,
        is_open: true,
        is_pet_friendly: true
      },
      likesCount: 89,
      isLiked: true,
      commentsCount: 1,
      comments: [
        {
          id: 'c-3',
          authorName: 'Sofia Intriago',
          authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
          text: 'Uff el viche de pescado de ahí es de otro planeta! 🤤',
          timestamp: 'Hace 3 horas',
          hasVisited: true,
          rating: 5
        }
      ]
    },
    {
      id: 'post-3',
      authorName: 'David Moreira',
      authorRole: 'Club de Surf Manta',
      authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80',
      timestamp: 'Ayer a las 18:30',
      locationName: 'Playa Murciélago, Manta',
      content: 'Atardecer perfecto en Murciélago después de clases. El viento suave y las olas estuvieron en su punto para surfear. Hay estacionamiento accesible y ambiente nocturno genial en los locales del malecón 🌊🏄‍♂️🌙',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
      place: places[2] || {
        id: 'playa-murcielago-surf',
        name: 'Playa Murciélago - Surf',
        category_id: 'extremos',
        description: 'Playa Murciélago - Surf, comortadamente e alea planaos amendo en Manta.',
        image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        rating: 5.0,
        review_count: 210,
        has_student_discount: true,
        has_wifi: true,
        is_open: true,
        is_pet_friendly: true,
        is_night_spot: true
      },
      likesCount: 124,
      isLiked: false,
      commentsCount: 1,
      comments: [
        {
          id: 'c-4',
          authorName: 'Mateo Cedeño',
          authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
          text: 'El mejor spot sin duda para despejar la mente y ver el atardecer!',
          timestamp: 'Ayer',
          hasVisited: true,
          rating: 5
        }
      ]
    }
  ]);

  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  // Aviso que se muestra si un comentario no pudo guardarse en la base de datos
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingFavoriteIds, setPendingFavoriteIds] = useState<string[]>([]);
  const [favoriteActionError, setFavoriteActionError] = useState<string | null>(null);

  useEffect(() => {
    setPosts((current) =>
      current.map((post) => {
        const postPlaceId = resolvePlaceId(post.place.id);
        const refreshedPlace = places.find(
          (place) =>
            place.id === post.place.id ||
            (postPlaceId !== null && resolvePlaceId(place.id) === postPlaceId)
        );
        return refreshedPlace ? { ...post, place: refreshedPlace } : post;
      })
    );
  }, [places]);

  // CARGAR: traer las reseñas por lugar y crear una publicación para lugares
  // que todavía no tienen una publicación fija en el feed.
  useEffect(() => {
    let isMounted = true;
    const placeIds = Array.from(new Set([
      ...places.map((place) => place.id),
      ...posts.map((post) => post.place.id)
    ]));

    fetchReviewsByPlaceIds(placeIds).then((reviews) => {
      if (!isMounted) return;

      setPosts((prev) =>
        {
          const basePosts = prev.filter((post) => !post.id.startsWith('review-place:'));
          const postsWithReviews = basePosts.map((post) => {
          const previousDatabaseComments = post.comments.filter((comment) =>
            comment.id.startsWith('db-review:')
          );
          const savedComments: CommunityComment[] = reviews
            .filter((review) => review.place_id === resolvePlaceId(post.place.id))
            .map((review) => ({
              id: `db-review:${review.id}`,
              authorName: review.author_name,
              authorAvatar: COMMENT_AVATAR,
              text: review.comment,
              timestamp: formatRelativeTime(review.created_at),
              hasVisited: review.has_visited,
              rating: review.rating
            }));

          return {
            ...post,
            commentsCount: Math.max(0, post.commentsCount - previousDatabaseComments.length) + savedComments.length,
            comments: [
              ...post.comments.filter((comment) => !comment.id.startsWith('db-review:')),
              ...savedComments
            ]
          };
          });
          const representedPlaceIds = new Set(
            postsWithReviews
              .map((post) => resolvePlaceId(post.place.id))
              .filter((id): id is string => id !== null)
          );
          const reviewPosts = places.flatMap((place) => {
            const resolvedPlaceId = resolvePlaceId(place.id);
            if (!resolvedPlaceId || representedPlaceIds.has(resolvedPlaceId)) return [];

            const placeReviews = reviews.filter((review) => review.place_id === resolvedPlaceId);
            if (placeReviews.length === 0) return [];

            const comments: CommunityComment[] = placeReviews.map((review) => ({
              id: `db-review:${review.id}`,
              authorName: review.author_name,
              authorAvatar: COMMENT_AVATAR,
              text: review.comment,
              timestamp: formatRelativeTime(review.created_at),
              hasVisited: review.has_visited,
              rating: review.rating
            }));
            const firstReview = placeReviews[0];

            return [{
              id: `review-place:${place.id}`,
              authorName: firstReview.author_name,
              authorRole: 'Reseña de la comunidad',
              authorAvatar: COMMENT_AVATAR,
              timestamp: formatRelativeTime(firstReview.created_at),
              locationName: place.name,
              content: `Reseñas de la comunidad para ${place.name}.`,
              imageUrl: place.image_url,
              place,
              likesCount: 0,
              commentsCount: comments.length,
              comments
            }];
          });

          return [...postsWithReviews, ...reviewPosts];
        }
      );
    });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, reviewsRefreshKey]);

  // GUARDAR: envía el comentario a Supabase. El comentario ya se mostró en pantalla,
  // así que si falla solo se avisa al usuario (no se rompe nada).
  const saveCommentToDatabase = async (
    placeId: string | undefined,
    text: string,
    rating?: number
  ) => {
    if (!placeId) return;
    setSaveError(null);

    const saved = await addReviewToSupabase({
      place_id: placeId,
      user_id: user.id,
      author_name: user.name,
      rating,
      has_visited: rating !== undefined,
      comment: text
    });

    if (!saved) {
      setSaveError('Tu comentario se publicó en pantalla, pero no se pudo guardar en la base de datos.');
    }
  };

  // Filtrar publicaciones por categoría seleccionada
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      activeCategory === 'inicio' || post.place.category_id === activeCategory;
    const resolvedPlaceId = resolvePlaceId(post.place.id);
    const matchesSaved =
      activeSection !== 'saved' ||
      (resolvedPlaceId !== null && savedPlaceIds.includes(resolvedPlaceId));

    return matchesCategory && matchesSaved;
  });

  const handleToggleFavorite = async (placeId: string) => {
    const resolvedPlaceId = resolvePlaceId(placeId);
    if (!resolvedPlaceId) {
      setFavoriteActionError('Este lugar todavía no está disponible en Supabase y no se puede guardar.');
      return;
    }
    if (pendingFavoriteIds.includes(resolvedPlaceId)) return;
    setPendingFavoriteIds((current) => [...current, resolvedPlaceId]);
    setFavoriteActionError(null);

    try {
      await onToggleFavorite(resolvedPlaceId);
    } catch (error) {
      setFavoriteActionError(
        error instanceof Error ? error.message : 'No se pudo actualizar el lugar guardado.'
      );
    } finally {
      setPendingFavoriteIds((current) => current.filter((id) => id !== resolvedPlaceId));
    }
  };

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const nextLiked = !post.isLiked;
          return {
            ...post,
            isLiked: nextLiked,
            likesCount: nextLiked ? post.likesCount + 1 : post.likesCount - 1
          };
        }
        return post;
      })
    );
  };

  // Abrir ventana flotante para comentar
  const handleOpenCommentModal = (post: CommunityPost) => {
    setCommentModalState({
      isOpen: true,
      place: post.place,
      postId: post.id
    });
  };

  // Callback al enviar comentario desde la ventana flotante
  const handleCommentModalSubmit = (commentData: {
    text: string;
    hasVisited: boolean;
    rating?: number;
  }) => {
    if (!commentModalState.postId) return;

    saveCommentToDatabase(commentModalState.place?.id, commentData.text, commentData.rating);

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === commentModalState.postId) {
          const newComment = {
            id: `c-${Date.now()}`,
            authorName: user.name,
            authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            text: commentData.text,
            timestamp: 'Justo ahora',
            hasVisited: commentData.hasVisited,
            rating: commentData.rating
          };
          return {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    );
  };

  // Enviar comentario rápido desde el input inline del post
  const handleAddInlineComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const targetPost = posts.find((post) => post.id === postId);
    saveCommentToDatabase(targetPost?.place.id, text);

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newComment = {
            id: `c-${Date.now()}`,
            authorName: user.name,
            authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            text,
            timestamp: 'Justo ahora',
            hasVisited: false
          };
          return {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="facebook-feed-container">
      {/* Aviso de error al guardar comentarios */}
      {saveError && (
        <div className="feed-status-banner">
          <span>{saveError}</span>
          <button className="btn-text-link" onClick={() => setSaveError(null)}>
            Cerrar
          </button>
        </div>
      )}
      {(favoriteError || favoriteActionError) && (
        <div className="feed-status-banner" role="alert">
          <span>{favoriteActionError || favoriteError}</span>
          {favoriteActionError && (
            <button className="btn-text-link" onClick={() => setFavoriteActionError(null)}>
              Cerrar
            </button>
          )}
        </div>
      )}

      {/* 1. Caja de crear publicación */}
      <div className="fb-create-post-card">
        <div className="fb-create-top">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
            alt={user.name}
            className="fb-user-avatar"
          />
          <button
            className="fb-create-input-btn"
            onClick={onOpenCreateReview}
            type="button"
          >
            ¿Qué lugar de Manta visitaste hoy, {user.name.split(' ')[0]}? Comparte tu reseña...
          </button>
        </div>

        <div className="fb-create-divider" />

        <div className="fb-create-actions">
          <button
            className="fb-action-pill"
            onClick={onOpenCreateReview}
            type="button"
          >
            <Camera size={19} color="#10b981" />
            <span>Foto / Lugar</span>
          </button>

          <button
            className="fb-action-pill"
            onClick={onOpenCreateReview}
            type="button"
          >
            <Star size={19} color="#f59e0b" />
            <span>Calificar</span>
          </button>

          <button
            className="fb-action-pill"
            onClick={onOpenCreateReview}
            type="button"
          >
            <MapPin size={19} color="#0cb7f2" />
            <span>Manta, EC</span>
          </button>
        </div>
      </div>

      {/* 2. Stream de Publicaciones en Scroll Continuo */}
      <div className="fb-posts-stream">
        {filteredPosts.map((post) => (
          <article key={post.id} className="fb-post-card">
            {/* Header del Post */}
            <div className="fb-post-header">
              <div className="fb-author-info">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="fb-post-avatar"
                />
                <div>
                  <div className="fb-author-name-row">
                    <span className="fb-author-name">{post.authorName}</span>
                    <span className="fb-role-tag">{post.authorRole}</span>
                  </div>
                  <div className="fb-post-meta">
                    <span>{post.timestamp}</span>
                    <span>&bull;</span>
                    <Globe size={13} className="fb-globe-icon" />
                    <span>&bull;</span>
                    <span className="fb-post-location">📍 {post.locationName}</span>
                  </div>
                </div>
              </div>

              <button className="fb-more-btn" aria-label="Más opciones">
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Contenido / Texto del Post */}
            <p className="fb-post-content">{post.content}</p>

            {/* Imagen Principal */}
            {post.imageUrl && (
              <div className="fb-post-media">
                <img
                  src={post.imageUrl}
                  alt={post.place.name}
                  className="fb-post-image"
                  loading="lazy"
                />

                {/* Tarjeta adjunta del lugar en la parte inferior */}
                <div
                  className="fb-attached-place-card"
                  onClick={() => onSelectPlace?.(post.place)}
                >
                  <div className="fb-place-details">
                    <h4 className="fb-place-title">{post.place.name}</h4>
                    <div className="fb-place-stars">
                      <span className="star">★</span>
                      <span className="star">★</span>
                      <span className="star">★</span>
                      <span className="star">★</span>
                      <span className="star">★</span>
                      <span className="fb-rating-num">{post.place.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="fb-place-badges">
                    {post.place.has_student_discount && (
                      <span className="fb-badge fb-badge-student">
                        $ Estudiante <Check size={11} />
                      </span>
                    )}
                    {post.place.has_wifi && (
                      <span className="fb-badge fb-badge-wifi">
                        WiFi <Check size={11} />
                      </span>
                    )}
                    {post.place.is_open && (
                      <span className="fb-badge fb-badge-open">
                        Abierto <Check size={11} />
                      </span>
                    )}
                    {post.place.is_pet_friendly && (
                      <span className="fb-badge fb-badge-pet">
                        🐾 Pet Friendly
                      </span>
                    )}
                    {post.place.is_accessible && (
                      <span className="fb-badge fb-badge-access">
                        ♿ Accesible
                      </span>
                    )}
                    {post.place.is_night_spot && (
                      <span className="fb-badge fb-badge-night">
                        🌙 Nocturno
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Barra de Reacciones y Contadores */}
            <div className="fb-stats-bar">
              <div className="fb-stats-reactions">
                <span className="fb-reaction-icon fb-like-badge">👍</span>
                <span className="fb-reaction-icon fb-heart-badge">❤️</span>
                <span className="fb-stats-text">{post.likesCount} me gusta</span>
              </div>
              <div className="fb-stats-comments">
                <span>{post.commentsCount} comentarios</span>
                <span>&bull;</span>
                <span>4 compartidos</span>
              </div>
            </div>

            <div className="fb-post-divider" />

            {/* Barra de Botones de Acción */}
            <div className="fb-actions-bar">
              <button
                className={`fb-action-btn ${post.isLiked ? 'active' : ''}`}
                onClick={() => handleToggleLike(post.id)}
              >
                <ThumbsUp size={18} />
                <span>Me Gusta</span>
              </button>

              {/* Botón Comentar: Abre la ventana flotante de comentarios con condicional de visita */}
              <button
                className="fb-action-btn"
                onClick={() => handleOpenCommentModal(post)}
              >
                <MessageCircle size={18} />
                <span>Comentar</span>
              </button>

              <button
                className="fb-action-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('¡Enlace del lugar copiado al portapapeles!');
                }}
              >
                <Share2 size={18} />
                <span>Compartir</span>
              </button>

              <button
                className={`fb-action-btn ${
                  savedPlaceIds.includes(resolvePlaceId(post.place.id) ?? '') ? 'active' : ''
                }`}
                onClick={() => handleToggleFavorite(post.place.id)}
                disabled={pendingFavoriteIds.includes(resolvePlaceId(post.place.id) ?? '')}
                aria-pressed={savedPlaceIds.includes(resolvePlaceId(post.place.id) ?? '')}
              >
                <Bookmark
                  size={18}
                  fill={savedPlaceIds.includes(resolvePlaceId(post.place.id) ?? '') ? 'currentColor' : 'none'}
                />
                <span>
                  {pendingFavoriteIds.includes(resolvePlaceId(post.place.id) ?? '')
                    ? 'Guardando...'
                    : savedPlaceIds.includes(resolvePlaceId(post.place.id) ?? '')
                    ? 'Guardado'
                    : 'Guardar'}
                </span>
              </button>
            </div>

            <div className="fb-post-divider" />

            {/* Sección de Comentarios */}
            <div className="fb-comments-section">
              {post.comments.map((comment) => (
                <div key={comment.id} className="fb-comment-item">
                  <img
                    src={comment.authorAvatar}
                    alt={comment.authorName}
                    className="fb-comment-avatar"
                  />
                  <div className="fb-comment-bubble">
                    <div className="fb-comment-header-row">
                      <span className="fb-comment-author">{comment.authorName}</span>
                      {comment.hasVisited && comment.rating && (
                        <span className="fb-comment-rating-tag">
                          ★ {comment.rating}.0 (Visitado)
                        </span>
                      )}
                    </div>
                    <p className="fb-comment-text">{comment.text}</p>
                    <span className="fb-comment-time">{comment.timestamp}</span>
                  </div>
                </div>
              ))}

              {/* Input rápido o botón para abrir ventana flotante */}
              <div className="fb-comment-input-box">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt={user.name}
                  className="fb-comment-avatar"
                />
                <div className="fb-input-wrapper">
                  <input
                    id={`comment-input-${post.id}`}
                    type="text"
                    placeholder={`Escribe un comentario como ${user.name.split(' ')[0]}...`}
                    value={commentInputs[post.id] || ''}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInlineComment(post.id);
                      }
                    }}
                  />
                  <button
                    className="fb-send-comment-btn"
                    onClick={() => handleAddInlineComment(post.id)}
                    aria-label="Enviar comentario"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}

        {filteredPosts.length === 0 && (
          <div className="fb-empty-feed">
            {activeSection === 'saved' ? (
              <>
                <h4>Aún no tienes lugares guardados</h4>
                <p>Pulsa “Guardar” en una publicación para agregarla a tu lista.</p>
              </>
            ) : (
              <>
                <h4>No hay publicaciones en esta categoría</h4>
                <p>¡Sé el primero en compartir tu experiencia en Manta!</p>
                <button className="btn-submit" onClick={onOpenCreateReview}>
                  + Crear la primera reseña
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Ventana Flotante de Comentario con Calificación Condicional */}
      <CommentModal
        isOpen={commentModalState.isOpen}
        place={commentModalState.place}
        onClose={() => setCommentModalState({ isOpen: false, place: null, postId: null })}
        onSubmit={handleCommentModalSubmit}
      />
    </div>
  );
}