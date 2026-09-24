import { useMemo, useState } from 'react';
import type { User } from '../business/types/user';

type Category = 'Todos' | 'Cines' | 'Comida' | 'Historia' | 'Aventura' | 'Naturaleza';
type Place = { id: number; name: string; category: Exclude<Category, 'Todos'>; description: string; image: string; rating: number; distance: string; tags: string[] };

const categories: { label: Category; icon: string }[] = [
  { label: 'Todos', icon: '✦' }, { label: 'Cines', icon: '▣' }, { label: 'Comida', icon: '♨' },
  { label: 'Historia', icon: '♜' }, { label: 'Aventura', icon: '⌁' }, { label: 'Naturaleza', icon: '♧' },
];
const places: Place[] = [
  { id: 1, name: 'Cine a la orilla del mar', category: 'Cines', description: 'Películas, estrenos y una experiencia para compartir a la orilla del mar.', image: 'https://www.vistazo.com/binrepository/769x572/0c140/768d432/none/12727/BAFI/cine-a-orillas-del-mar_792930_20230120170401.png', rating: 4.8, distance: '1.2 km', tags: ['WiFi', 'Abierto'] },
  { id: 2, name: 'Enchiloso Manta', category: 'Comida', description: 'Sabores méxicanos en Manta, porciones generosas y ambiente familiar.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBiVSaWE8fYx-UVNBpSa7Jb2KGZ2njNDf-j51SDDb7T9_j3cf0jbGTgr0&s=10', rating: 4.7, distance: '2.4 km', tags: ['Económico', 'Abierto'] },
  { id: 3, name: 'Playa Murciélago', category: 'Naturaleza', description: 'Arena, mar y atardeceres perfectos para desconectarte en el corazón de Manta.', image: 'https://tse3.mm.bing.net/th/id/OIP.URXtCFvkeRRU9t6qwFNj2gHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', rating: 4.9, distance: '3.1 km', tags: ['Gratis', 'Aire libre'] },
  { id: 4, name: 'Museo Cancebí', category: 'Historia', description: 'Conoce la memoria, las raíces y las historias que hacen única a nuestra ciudad.', image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/8d/d3/55/old-way-of-technology.jpg?w=1200&h=1200&s=1', rating: 4.6, distance: '0.8 km', tags: ['Cultura', 'Familiar'] },
  { id: 5, name: 'Mirador de San Mateo', category: 'Aventura', description: 'Una vista amplia del océano para respirar profundo y salir de la rutina.', image: 'https://estaticos-cdn.prensaiberica.es/clip/a7b7abef-7b69-4987-ab20-57f7c47905be_16-9-discover-aspect-ratio_default_0.jpg', rating: 4.8, distance: '8.5 km', tags: ['Gratis', 'Exterior'] },
  { id: 6, name: 'Mercado Playita Mía', category: 'Comida', description: 'El sabor del puerto en un recorrido de ceviches, pescados y productos locales.', image: 'https://revistademanabi.com/wp-content/uploads/2020/05/mercado-playita-mia-fachada.jpg', rating: 4.5, distance: '4.2 km', tags: ['Local', 'Abierto'] },
];

interface HomePageProps { user: User; onLogout: () => void; }

export function HomePage({ user, onLogout }: HomePageProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('Todos');
  const [query, setQuery] = useState('');
  const [liked, setLiked] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const filteredPlaces = useMemo(() => places.filter((place) => {
    const matchesCategory = activeCategory === 'Todos' || place.category === activeCategory;
    return matchesCategory && `${place.name} ${place.description}`.toLowerCase().includes(query.toLowerCase());
  }), [activeCategory, query]);
  const toggleItem = (items: number[], setItems: (next: number[]) => void, id: number) => setItems(items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  return <div className="campus-shell">
    <header className="campus-header">
      <button className="brand" onClick={() => { setActiveCategory('Todos'); setQuery(''); }} aria-label="Ir al inicio"><span className="brand-mark">M</span><span>Manta<span>Spot</span></span></button>
      <label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca un lugar, comida o plan..." aria-label="Buscar lugares" /></label>
      <div className="header-actions"><button className="notification" aria-label="Notificaciones">♧<i /></button><div className="profile-wrap"><button className="profile-button" onClick={() => setShowProfile(!showProfile)}><span className="avatar">{user.name.charAt(0).toUpperCase()}</span><span className="profile-name">{user.name}</span><span>⌄</span></button>{showProfile && <div className="profile-menu"><strong>{user.name}</strong><small>{user.email}</small><button onClick={onLogout}>Cerrar sesión</button></div>}</div><button className="review-button" onClick={() => setShowReview(true)}><span>＋</span> Crea Review</button></div>
    </header>
    <nav className="category-bar" aria-label="Categorías">{categories.map((category) => <button key={category.label} className={activeCategory === category.label ? 'active' : ''} onClick={() => setActiveCategory(category.label)}><span>{category.icon}</span>{category.label}</button>)}</nav>
    <div className="campus-content">
      <aside className="sidebar"><section className="side-panel visit-panel"><div className="side-heading"><h2>Mi lista</h2><span>{saved.length}</span></div><p>Guarda lugares para visitarlos después.</p><div className="saved-preview"><span>♡</span><b>{saved.length ? 'Tus lugares guardados' : 'Aún no tienes lugares'}</b></div><button className="text-link" onClick={() => setSaved([])}>Ver lista completa →</button></section><section className="side-panel"><div className="side-heading"><h2>Tendencias</h2><span className="spark">✦</span></div><div className="trend"><b>Planes frente al mar</b><small>12 lugares recomendados</small></div><div className="trend"><b>Sabores de Manta</b><small>8 lugares recomendados</small></div><div className="trend"><b>Para este fin de semana</b><small>24 lugares recomendados</small></div></section><section className="side-panel community-panel"><span className="community-icon">◎</span><div><b>Comparte tu lugar favorito</b><p>Tu recomendación puede inspirar a toda la comunidad.</p></div><button aria-label="Compartir recomendación">→</button></section></aside>
      <main className="feed"><div className="feed-intro"><div><p className="eyebrow">EXPLORA MANTA</p><h1>Descubre tu próximo plan</h1><p className="intro-copy">Lugares que la comunidad está disfrutando hoy.</p></div><button className="sort-button">Más populares <span>⌄</span></button></div><div className="results-label">{filteredPlaces.length} lugares encontrados</div><div className="place-grid">{filteredPlaces.map((place) => <article className="place-card" key={place.id}><div className="place-image"><img src={place.image} alt={place.name} /><button className={`save-button ${saved.includes(place.id) ? 'is-saved' : ''}`} onClick={() => toggleItem(saved, setSaved, place.id)} aria-label="Guardar lugar">{saved.includes(place.id) ? '♥' : '♡'}</button><span className="place-category">{place.category}</span></div><div className="place-body"><div className="place-title"><h2>{place.name}</h2><span className="rating">★ {place.rating}</span></div><p>{place.description}</p><div className="place-meta"><span>◉ {place.distance}</span>{place.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="place-actions"><button onClick={() => toggleItem(liked, setLiked, place.id)} className={liked.includes(place.id) ? 'liked' : ''}>♥ <span>{liked.includes(place.id) ? 'Te gusta' : 'Me gusta'}</span></button><button>◌ <span>Comentar</span></button><button onClick={() => toggleItem(saved, setSaved, place.id)}>▱ <span>Guardar</span></button></div></div></article>)}</div>{filteredPlaces.length === 0 && <div className="empty-state"><span>⌕</span><h2>No encontramos ese lugar</h2><p>Prueba con otra búsqueda o categoría.</p></div>}</main>
    </div>
    {showReview && <div className="modal-backdrop" onClick={() => setShowReview(false)}><div className="review-modal" onClick={(event) => event.stopPropagation()}><button className="close-modal" onClick={() => setShowReview(false)} aria-label="Cerrar">×</button><p className="eyebrow">NUEVA RESEÑA</p><h2>Comparte un descubrimiento</h2><p>Ayuda a otros a encontrar lugares increíbles en Manta.</p><input placeholder="Nombre del lugar" /><textarea placeholder="¿Qué te gustó de este lugar?" rows={4} /><button className="publish-button" onClick={() => setShowReview(false)}>Publicar reseña</button></div></div>}
  </div>;
}