import { useState } from 'react';
import { Search, Bell, Plus, ChevronDown, LayoutDashboard, Wrench, LogOut } from 'lucide-react';
import type { User } from '../../business/types/user';
import type { NotificationItem } from '../../business/types/place';
import { BrandLogo } from './BrandLogo';
import { NotificationsDropdown } from './NotificationsDropdown';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateReview: () => void;
  onOpenAdmin: (tab: 'admin' | 'moderator') => void;
  notifications: NotificationItem[];
  onMarkAllNotificationsAsRead: () => void;
  onLogoClick?: () => void;
}

export function Header({
  user,
  onLogout,
  searchQuery,
  onSearchChange,
  onCreateReview,
  onOpenAdmin,
  notifications,
  onMarkAllNotificationsAsRead,
  onLogoClick
}: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <header className="campus-header">
      {/* Brand Logo recreado fiel a la imagen 3 (Hucas Manabas + Palmera) */}
      <div className="header-left">
        <BrandLogo onClick={onLogoClick} />
      </div>

      {/* Search Input */}
      <div className="header-center">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar lugares, comidas o recomendaciones..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button className="search-btn" aria-label="Buscar">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Right Actions */}
      <div className="header-right">
        {/* Notification Bell */}
        <div className="notif-wrapper">
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Ver notificaciones"
            aria-expanded={showNotifications}
          >
            <Bell size={20} />
            {hasUnread && <span className="notification-dot" />}
          </button>

          <NotificationsDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            notifications={notifications}
            onMarkAllAsRead={onMarkAllNotificationsAsRead}
          />
        </div>

        {/* User Profile & Dropdown */}
        <div className="user-profile-wrapper">
          <button
            className="user-profile-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-expanded={showDropdown}
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt={user.name}
              className="user-avatar-img"
            />
            <span className="user-name">{user.name.split(' ')[0]} G.</span>
            <ChevronDown size={15} className={`chevron-icon ${showDropdown ? 'rotate' : ''}`} />
          </button>

          {showDropdown && (
            <>
              <div className="dropdown-overlay" onClick={() => setShowDropdown(false)} />
              <div className="admin-dropdown-menu">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowDropdown(false);
                    onOpenAdmin('admin');
                  }}
                >
                  <LayoutDashboard size={16} />
                  <span>Admin Panel</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowDropdown(false);
                    onOpenAdmin('moderator');
                  }}
                >
                  <Wrench size={16} />
                  <span>Moderator Tools</span>
                </button>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item text-danger"
                  onClick={() => {
                    setShowDropdown(false);
                    onLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Create Review Button */}
        <button className="create-review-btn" onClick={onCreateReview}>
          <Plus size={18} className="btn-icon" />
          <span>Crea Review</span>
          <ChevronDown size={14} className="btn-chevron" />
        </button>
      </div>
    </header>
  );
}
