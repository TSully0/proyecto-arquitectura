import { Home, Clapperboard, UtensilsCrossed, Landmark, Mountain, Palmtree } from 'lucide-react';
import type { CategoryId } from '../../business/types/place';

interface CategoryNavProps {
  activeCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
}

interface NavCategory {
  id: CategoryId;
  label: string;
  icon: React.ReactNode;
}

export function CategoryNav({ activeCategory, onSelectCategory }: CategoryNavProps) {
  const categories: NavCategory[] = [
    { id: 'inicio', label: 'Inicio', icon: <Home size={20} /> },
    { id: 'cines', label: 'Cines', icon: <Clapperboard size={20} /> },
    { id: 'comida', label: 'Comida', icon: <UtensilsCrossed size={20} /> },
    { id: 'historicos', label: 'Lugares Históricos', icon: <Landmark size={20} /> },
    { id: 'extremos', label: 'Deportes Extremos', icon: <Mountain size={20} /> },
    { id: 'naturaleza', label: 'Naturaleza', icon: <Palmtree size={20} /> }
  ];

  return (
    <nav className="category-navbar" aria-label="Categorías principales">
      <div className="category-nav-container">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              className={`category-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <span className="category-nav-icon">{cat.icon}</span>
              <span className="category-nav-label">{cat.label}</span>
              {isActive && <span className="active-indicator" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
