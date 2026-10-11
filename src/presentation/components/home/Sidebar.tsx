import { MapPin } from 'lucide-react';

type Section = 'all' | 'saved' | 'nearby' | 'trends';

interface SidebarProps {
  activeSection: Section;
  onSelectSection: (section: Section) => void;
  savedCount: number;
  onMapPinClick?: (pinName: string) => void;
}

interface MapPlace {
  name: string;
  x: number;
  y: number;
  color: string;
  query: string; // texto que se busca en Google Maps
}

// Lugares importantes y destacados de Manta, Ecuador
const MANTA_PLACES: MapPlace[] = [
  { name: 'Playa Murciélago', x: 90, y: 75, color: '#0cb7f2', query: 'Playa Murciélago, Manta, Ecuador' },
  { name: 'Mall del Pacífico', x: 130, y: 85, color: '#10b981', query: 'Mall del Pacífico, Manta, Ecuador' },
  { name: 'Tarqui (mariscos)', x: 170, y: 115, color: '#f59e0b', query: 'Playa Tarqui, Manta, Ecuador' },
  { name: 'Centro Histórico', x: 145, y: 135, color: '#6366f1', query: 'Centro de Manta, Ecuador' },
  { name: 'ULEAM', x: 70, y: 125, color: '#ef4444', query: 'Universidad Laica Eloy Alfaro de Manabí, Manta, Ecuador' },
  { name: 'San Mateo', x: 45, y: 160, color: '#06b6d4', query: 'San Mateo, Manta, Ecuador' },
];

export function Sidebar({
  activeSection,
  onSelectSection,
  savedCount,
  onMapPinClick,
}: SidebarProps) {
  const toggle = (section: Exclude<Section, 'all'>) =>
    onSelectSection(activeSection === section ? 'all' : section);

  const openPlace = (place: MapPlace) => {
    onMapPinClick?.(place.name);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.query)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <aside className="campus-sidebar">
      {/* ================= NAV ================= */}
      <div className="sidebar-card nav-card">
        {/* Mi Lista Por Visitar */}
        <div
          className={`sidebar-nav-item ${activeSection === 'saved' ? 'active' : ''}`}
          onClick={() => toggle('saved')}
          role="button"
          tabIndex={0}
        >
          <div className="item-content">
            <span className="item-title">Mi Lista Por Visitar</span>
            {savedCount > 0 && <span className="item-badge">{savedCount}</span>}
          </div>
          <div className="item-illustration">
            <svg viewBox="0 0 64 64" className="illustration-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="20" r="10" fill="#0cb7f2" />
              <path d="M12 50 C12 36, 36 36, 36 50 Z" fill="#0cb7f2" />
              <circle cx="44" cy="24" r="8" fill="#7cdaf9" />
              <path d="M34 50 C34 38, 54 38, 54 50 Z" fill="#7cdaf9" />
            </svg>
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* Lugares Cercanos */}
        <div
          className={`sidebar-nav-item ${activeSection === 'nearby' ? 'active' : ''}`}
          onClick={() => toggle('nearby')}
          role="button"
          tabIndex={0}
        >
          <div className="item-content">
            <span className="item-title">Lugares Cercanos (Map View)</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* Tendencias */}
        <div
          className={`sidebar-nav-item ${activeSection === 'trends' ? 'active' : ''}`}
          onClick={() => toggle('trends')}
          role="button"
          tabIndex={0}
        >
          <div className="item-content">
            <span className="item-title">Tendencias</span>
          </div>
          <div className="item-illustration">
            <svg viewBox="0 0 64 64" className="illustration-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="22" r="9" fill="#0cb7f2" />
              <path d="M10 50 C10 38, 30 38, 30 50 Z" fill="#0cb7f2" />
              <circle cx="44" cy="24" r="9" fill="#10b981" />
              <path d="M34 50 C34 39, 54 39, 54 50 Z" fill="#10b981" />
            </svg>
          </div>
        </div>
      </div>

      {/* ================= MAPA ================= */}
      <div className="sidebar-card map-card">
        <h3 className="sidebar-card-title">Ubicaciones Destacadas</h3>

        <div className="manta-map-container">
          <svg viewBox="0 0 280 200" className="manta-map-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b6ffff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#7cdaf9" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Mar */}
            <rect width="280" height="200" fill="url(#oceanGrad)" rx="8" />

            {/* Costa de Manta */}
            <path
              d="M 50,0 Q 80,60 110,90 T 170,130 Q 220,160 280,180 L 280,200 L 0,200 L 0,0 Z"
              fill="#ffffff"
              opacity="0.9"
            />

            {/* Calles principales */}
            <path
              d="M 40,80 L 140,150 M 60,40 L 180,120 M 20,120 L 200,180 M 100,50 L 80,180 M 130,80 L 110,190 M 170,110 L 150,200"
              stroke="#e2e8f0"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Calles secundarias */}
            <path
              d="M 50,110 L 120,80 M 90,140 L 160,110 M 120,170 L 220,130"
              stroke="#f1e8f3"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            {/* Muelle / Malecón */}
            <path d="M 140,88 L 160,65 L 175,70 L 155,93 Z" fill="#cbd5e1" />

            {/* Pines funcionales: abren Google Maps */}
            {MANTA_PLACES.map((place) => (
              <g
                key={place.name}
                onClick={() => openPlace(place)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openPlace(place);
                  }
                }}
                role="link"
                tabIndex={0}
                aria-label={`Ver ${place.name} en Google Maps`}
                style={{ cursor: 'pointer', transform: 'none', transition: 'none', animation: 'none' }}
              >
                <title>{place.name}</title>
                {/* Área de clic más grande para que sea fácil tocar */}
                <circle cx={place.x} cy={place.y} r="12" fill="transparent" />
                {/* Halo fijo (sin animación) */}
                <circle cx={place.x} cy={place.y} r="10" fill={place.color} fillOpacity="0.2" />
                <circle cx={place.x} cy={place.y} r="6.5" fill={place.color} />
                <circle cx={place.x} cy={place.y} r="2.5" fill="#ffffff" />
              </g>
            ))}
          </svg>

          <div className="map-footer-label">
            <MapPin size={13} className="text-primary" />
            <span>Manta, Ecuador</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
