import { useState, useEffect } from 'react';
import type { User } from '../business/types/user';
import type { Place, CategoryId, NotificationItem } from '../business/types/place';
import {
  fetchPlacesFromRepository,
  addPlaceToSupabase,
  initialPlaces
} from '../data/repositories/places';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { Sidebar } from './components/Sidebar';
import { FacebookFeed } from './components/FacebookFeed';
import { ReviewModal } from './components/ReviewModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { Footer } from './components/Footer';

interface HomePageProps {
  user: User;
  onLogout: () => void;
}

export function HomePage({ user, onLogout }: HomePageProps) {
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('inicio');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | 'saved' | 'nearby' | 'trends'>('all');
  const [savedIds, setSavedIds] = useState<string[]>([]);
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

    // Load saved from local storage for instant responsiveness
    try {
      const storedSaved = localStorage.getItem('mantacampus_saved');
      if (storedSaved) setSavedIds(JSON.parse(storedSaved));
    } catch (e) {
      console.warn('Storage read error:', e);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle adding new place/review
  const handleCreateReview = async (newPlaceData: {
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
    const newPlace: Place = {
      id: `place-${Date.now()}`,
      ...newPlaceData,
      review_count: 1,
      likes_count: 0
    };

    setPlaces((prev) => [newPlace, ...prev]);

    // Agregar notificación de confirmación
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: '¡Publicación exitosa!',
        description: `Tu recomendación sobre "${newPlaceData.name}" ya es visible para toda la comunidad.`,
        timestamp: 'Justo ahora',
        isRead: false,
        type: 'system'
      },
      ...prev
    ]);

    // Sync with Supabase in background
    addPlaceToSupabase({ ...newPlaceData, review_count: 1 }).catch((err) =>
      console.warn('Background Supabase insert error:', err)
    );
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
          onSelectSection={(sec) => setActiveSection(sec)}
          savedCount={savedIds.length}
          onMapPinClick={handleMapPinClick}
        />

        {/* Right Column: Feed de la Comunidad (Único Formato Requerido) */}
        <section className="campus-feed-area">
          {activeSection === 'saved' && (
            <div className="feed-status-banner">
              <span>Mostrando tus lugares guardados ({savedIds.length})</span>
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
        onSubmit={handleCreateReview}
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