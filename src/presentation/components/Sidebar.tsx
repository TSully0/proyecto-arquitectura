import { MapPin } from 'lucide-react';

interface SidebarProps {
  activeSection: 'all' | 'saved' | 'nearby' | 'trends';
  onSelectSection: (section: 'all' | 'saved' | 'nearby' | 'trends') => void;
  savedCount: number;
  onMapPinClick?: (pinName: string) => void;
}

export function Sidebar({
  activeSection,
  onSelectSection,
  savedCount,
  onMapPinClick
}: SidebarProps) {
  return (
    <aside className="campus-sidebar">
      {/* Quick Nav Card */}
      <div className="sidebar-card nav-card">
        {/* Item 1: Mi Lista Por Visitar */}
        <div
          className={`sidebar-nav-item ${activeSection === 'saved' ? 'active' : ''}`}
          onClick={() => onSelectSection(activeSection === 'saved' ? 'all' : 'saved')}
          role="button"
          tabIndex={0}
        >
          <div className="item-content">
            <span className="item-title">Mi Lista Por Visitar</span>
            {savedCount > 0 && <span className="item-badge">{savedCount}</span>}
          </div>
          <div className="item-illustration">
            {/* Friendly SVG illustration of students/explorers */}
            <svg viewBox="0 0 64 64" className="illustration-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="20" r="10" fill="#0cb7f2" />
              <path d="M12 50 C12 36, 36 36, 36 50 Z" fill="#0cb7f2" />
              <circle cx="44" cy="24" r="8" fill="#7cdaf9" />
              <path d="M34 50 C34 38, 54 38, 54 50 Z" fill="#7cdaf9" />
            </svg>
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* Item 2: Lugares Cercanos (Map View) */}
        <div
          className={`sidebar-nav-item ${activeSection === 'nearby' ? 'active' : ''}`}
          onClick={() => onSelectSection(activeSection === 'nearby' ? 'all' : 'nearby')}
          role="button"
          tabIndex={0}
        >
          <div className="item-content">
            <span className="item-title">Lugares Cercanos (Map View)</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* Item 3: Tendencias */}
        <div
          className={`sidebar-nav-item ${activeSection === 'trends' ? 'active' : ''}`}
          onClick={() => onSelectSection(activeSection === 'trends' ? 'all' : 'trends')}
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

      {/* Featured Locations Card (Ubicaciones Destacadas) */}
      <div className="sidebar-card map-card">
        <h3 className="sidebar-card-title">Ubicaciones Destacadas</h3>
        
        <div className="manta-map-container" title="Mapa Interactivo de Manta">
          {/* Stylized SVG Map of Manta Coastline and Urban Grid with Markers */}
          <svg viewBox="0 0 280 200" className="manta-map-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b6ffff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#7cdaf9" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Ocean / Background */}
            <rect width="280" height="200" fill="url(#oceanGrad)" rx="8" />

            {/* Manta Coastline Shape */}
            <path
              d="M 50,0 Q 80,60 110,90 T 170,130 Q 220,160 280,180 L 280,200 L 0,200 L 0,0 Z"
              fill="#ffffff"
              opacity="0.9"
            />

            {/* Street Grid lines */}
            <path
              d="M 40,80 L 140,150 M 60,40 L 180,120 M 20,120 L 200,180 M 100,50 L 80,180 M 130,80 L 110,190 M 170,110 L 150,200"
              stroke="#e2e8f0"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Secondary roads */}
            <path
              d="M 50,110 L 120,80 M 90,140 L 160,110 M 120,170 L 220,130"
              stroke="#f1e8f3"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            {/* Port / Malecon pier */}
            <path
              d="M 140,88 L 160,65 L 175,70 L 155,93 Z"
              fill="#cbd5e1"
            />

            {/* Map Pin 1: Mall del Pacífico */}
            <g
              className="map-marker-pin"
              transform="translate(130, 85)"
              onClick={() => onMapPinClick?.('Mall del Pacífico')}
            >
              <circle cx="0" cy="0" r="10" fill="#0cb7f2" fillOpacity="0.25" className="pin-pulse" />
              <circle cx="0" cy="0" r="6" fill="#0cb7f2" />
              <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
            </g>

            {/* Map Pin 2: Tarqui / Mariscos */}
            <g
              className="map-marker-pin"
              transform="translate(170, 115)"
              onClick={() => onMapPinClick?.('Tarqui')}
            >
              <circle cx="0" cy="0" r="6" fill="#0cb7f2" />
              <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
            </g>

            {/* Map Pin 3: Playa Murciélago */}
            <g
              className="map-marker-pin"
              transform="translate(90, 75)"
              onClick={() => onMapPinClick?.('Playa Murciélago')}
            >
              <circle cx="0" cy="0" r="7" fill="#0cb7f2" />
              <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
            </g>

            {/* Map Pin 4: Centro */}
            <g
              className="map-marker-pin"
              transform="translate(145, 135)"
              onClick={() => onMapPinClick?.('Centro Histórico')}
            >
              <circle cx="0" cy="0" r="6" fill="#0cb7f2" />
              <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
            </g>

            {/* Map Pin 5: Barbasquillo / ULEAM */}
            <g
              className="map-marker-pin"
              transform="translate(70, 125)"
              onClick={() => onMapPinClick?.('ULEAM')}
            >
              <circle cx="0" cy="0" r="6" fill="#0cb7f2" />
              <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
            </g>

            {/* Map Pin 6: San Mateo */}
            <g
              className="map-marker-pin"
              transform="translate(45, 160)"
              onClick={() => onMapPinClick?.('San Mateo')}
            >
              <circle cx="0" cy="0" r="6" fill="#0cb7f2" />
              <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
            </g>
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
