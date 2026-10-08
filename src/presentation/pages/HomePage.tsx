import { useState, useEffect } from 'react';
import type { User } from '../../business/types/user';
import type { Place, CategoryId, NotificationItem } from '../../business/types/place';
import {
  fetchPlacesFromRepository,
  fetchPlaceFromSupabase,
  fetchFavoritePlaceIds,
  getSupabaseUserId,
  resolvePlaceId,
  setPlaceFavorite,
  addReviewToSupabase,
  addPlaceToSupabase,
  initialPlaces
} from '../../data/repositories/places';
import { syncUserToSupabase } from '../../data/repositories/users';
import { Header } from '../components/Header';
import { CategoryNav } from '../components/CategoryNav';
import { Sidebar } from '../components/Sidebar';
import { FacebookFeed } from '../components/FacebookFeed';
import { ReviewModal } from '../components/ReviewModal';
import { AdminPanelModal } from '../components/AdminPanelModal';
import { Footer } from '../components/Footer';

interface HomePageProps {
  user: User;
  onLogout: () => void;
}

export function HomePage({ user, onLogout }: HomePageProps) {
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('inicio');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | 'saved' | 'nearby' | 'trends'>('all');
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [adminModal, setAdminModal] = useState<{ isOpen: boolean; type: 'admin' | 'moderator' }>({
    isOpen: false,
    type: 'admin'
  });

  // Notificaciones interactivas
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Beneficio Estudiantil',
      description: 'Nuevo 20% de descuento en Cineplex Manta con carnet ULEAM.',
      timestamp: 'Hace 30 min',
      isRead: false,
      type: 'discount'
    },
    {
      id: 'notif-2',
      title: 'Nueva Recomendación',
      description: 'Juan Pérez recomendó mariscos frescos en Tarqui.',
      timestamp: 'Hace 2 horas',
      isRead: false,
      type: 'review'
    }
  ]);

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Load places from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    fetchPlacesFromRepository().then((fetched) => {
      if (isMounted && fetched && fetched.length > 0) {
        setPlaces(fetched);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    syncUserToSupabase(user)
      .then((synced) => {
        if (!synced) {
          throw new Error('No se pudo sincronizar tu cuenta con Supabase para cargar tus favoritos.');
        }
        return fetchFavoritePlaceIds(user.email);
      })
      .then((placeIds) => {
        if (isMounted) {
          setSavedPlaceIds(placeIds);
          setFavoriteError(null);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setFavoriteError(
            error instanceof Error ? error.message : 'No se pudieron cargar tus lugares guardados.'
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleToggleFavorite = async (placeId: string) => {
    const isFavorite = savedPlaceIds.includes(placeId);
    await setPlaceFavorite(user.email, placeId, !isFavorite);
    setSavedPlaceIds((current) =>
      isFavorite ? current.filter((id) => id !== placeId) : [...current, placeId]
    );
    setFavoriteError(null);
  };

  const refreshPlaceSummary = async (placeId: string) => {
    try {
      const updatedPlace = await fetchPlaceFromSupabase(placeId);
      if (updatedPlace) {
        setPlaces((current) =>
          current.map((place) =>
            resolvePlaceId(place.id) === updatedPlace.id ? updatedPlace : place
          )
        );
      }
    } catch (error) {
      console.warn('La reseña se guardó, pero no se pudo actualizar el resumen del lugar:', error);
    }
  };

  const handleSubmitReview = async (review: {
    place_id: string;
    rating: number;
    comment: string;
  }) => {
    const synced = await syncUserToSupabase(user);
    if (!synced) {
      throw new Error('No se pudo sincronizar tu cuenta con Supabase. La reseña no se publicó.');
    }
    const userId = await getSupabaseUserId(user.email);
    const saved = await addReviewToSupabase({
      place_id: review.place_id,
      user_id: userId,
      author_name: user.name,
      rating: review.rating,
      has_visited: true,
      comment: review.comment
    });

    if (!saved) {
      throw new Error('Supabase no pudo guardar la reseña. Revisa la conexión y vuelve a intentarlo.');
    }

    setReviewsRefreshKey((key) => key + 1);
    await refreshPlaceSummary(review.place_id);
    setNotifications((current) => [
      {
        id: `notif-${Date.now()}`,
        title: '¡Reseña publicada!',
        description: `Tu reseña sobre "${places.find((place) => place.id === review.place_id)?.name ?? 'el lugar'}" ya está guardada.`,
        timestamp: 'Justo ahora',
        isRead: false,
        type: 'review'
      },
      ...current
    ]);
  };

  const handleRecommendPlace = async (newPlaceData: {
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
  }) => {
    const synced = await syncUserToSupabase(user);
    if (!synced) {
      throw new Error('No se pudo sincronizar tu cuenta con Supabase. El lugar no se creó.');
    }
    const userId = await getSupabaseUserId(user.email);
    const placeId = await addPlaceToSupabase({
      ...newPlaceData,
      rating: 0,
      review_count: 0
    });
    const newPlace: Place = {
      id: placeId,
      ...newPlaceData,
      rating: 0,
      review_count: 0,
      likes_count: 0
    };
    setPlaces((prev) => [newPlace, ...prev]);

    const reviewSaved = await addReviewToSupabase({
      place_id: placeId,
      user_id: userId,
      author_name: user.name,
      rating: newPlaceData.rating,
      has_visited: true,
      comment: newPlaceData.description
    });
    if (!reviewSaved) {
      throw new Error(
        `El lugar "${newPlaceData.name}" se creó, pero la reseña inicial no se guardó. Ya puedes reseñarlo desde “Reseñar un lugar”.`
      );
    }

    setReviewsRefreshKey((key) => key + 1);
    await refreshPlaceSummary(placeId);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: '¡Publicación exitosa!',
        description: `El lugar y tu reseña sobre "${newPlaceData.name}" ya están guardados.`,
        timestamp: 'Justo ahora',
        isRead: false,
        type: 'system'
      },
      ...prev
    ]);
  };

  // Handle map pin click
  const handleMapPinClick = (pinName: string) => {
    setSearchQuery(pinName);
  };

  return (
    <div className="campus-page-wrapper">
      {/* Top Header con BrandLogo y Notificaciones */}
      <Header
        user={user}
        onLogout={onLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateReview={() => setIsReviewModalOpen(true)}
        onOpenAdmin={(type) => setAdminModal({ isOpen: true, type })}
        notifications={notifications}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onLogoClick={() => {
          setActiveCategory('inicio');
          setSearchQuery('');
        }}
      />

      {/* Categories Navigation Bar (Sin Juegos) */}
      <CategoryNav
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          if (activeSection === 'saved') setActiveSection('all');
        }}
      />

      {/* Main Container: Sidebar + Feed Social Continuo */}
      <main className="campus-main-layout">
        {/* Left Column Sidebar */}
        <Sidebar
          activeSection={activeSection}
          onSelectSection={(sec) => {
            setActiveSection(sec);
            if (sec === 'saved') setActiveCategory('inicio');
          }}
          savedCount={savedPlaceIds.length}
          onMapPinClick={handleMapPinClick}
        />

        {/* Right Column: Feed de la Comunidad (Único Formato Requerido) */}
        <section className="campus-feed-area">
          {activeSection === 'saved' && (
            <div className="feed-status-banner">
              <span>Mostrando tus lugares guardados ({savedPlaceIds.length})</span>
              <button
                className="btn-text-link"
                onClick={() => setActiveSection('all')}
              >
                Ver todo el feed
              </button>
            </div>
          )}

          {/* Feed en Scroll Continuo */}
          <FacebookFeed
            user={user}
            places={places}
            activeCategory={activeCategory}
            activeSection={activeSection}
            savedPlaceIds={savedPlaceIds}
            favoriteError={favoriteError}
            onToggleFavorite={handleToggleFavorite}
            reviewsRefreshKey={reviewsRefreshKey}
            onOpenCreateReview={() => setIsReviewModalOpen(true)}
            onSelectPlace={(place) => {
              setSearchQuery(place.name);
            }}
          />
        </section>
      </main>

      {/* Bottom Footer */}
      <Footer />

      {/* Create Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        places={places}
        onSubmitReview={handleSubmitReview}
        onSubmit={handleRecommendPlace}
      />

      {/* Admin / Moderator Modal */}
      <AdminPanelModal
        isOpen={adminModal.isOpen}
        type={adminModal.type}
        user={user}
        onClose={() => setAdminModal({ ...adminModal, isOpen: false })}
      />
    </div>
  );
}