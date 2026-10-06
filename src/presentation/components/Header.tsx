import { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  LayoutDashboard,
  Wrench,
  LogOut,
  User
} from 'lucide-react';

import type { User as UserType } from '../../business/types/user';
import type { NotificationItem } from '../../business/types/place';

import { BrandLogo } from './BrandLogo';
import { NotificationsDropdown } from './NotificationsDropdown';

interface HeaderProps {
  user: UserType;
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

  const isAdmin = user.role === 'admin';
  const isModerator = user.role === 'moderator';

  return (
    <header className="campus-header">

      {/* LOGO */}
      <div className="header-left">
        <BrandLogo onClick={onLogoClick} />
      </div>

      {/* SEARCH */}
      <div className="header-center">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar lugares, comidas o recomendaciones..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button className="search-btn">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="header-right">

        {/* NOTIFICATIONS */}
        <div className="notif-wrapper">
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
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

        {/* USER MENU */}
        <div className="user-profile-wrapper">

          <button
            className="user-profile-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt={user.name}
              className="user-avatar-img"
            />

            <span className="user-name">
              {user.name.split(' ')[0]}
            </span>

            <ChevronDown
              size={15}
              className={`chevron-icon ${showDropdown ? 'rotate' : ''}`}
            />
          </button>

          {showDropdown && (
            <>
              <div
                className="dropdown-overlay"
                onClick={() => setShowDropdown(false)}
              />

              <div className="admin-dropdown-menu">

                {/* PERFIL (solo user y moderator, el admin NO lo ve) */}
                {!isAdmin && (
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowDropdown(false);
                      window.location.href = "/perfil";
                    }}
                  >
                    <User size={16} />
                    <span>Mi Perfil</span>
                  </button>
                )}

                {/* ADMIN */}
                {isAdmin && (
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowDropdown(false);
                      onOpenAdmin('admin');
                    }}
                  >
                    <LayoutDashboard size={16} />
                    <span>Panel de Admin</span>
                  </button>
                )}

                {/* MODERATOR */}
                {isModerator && (
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowDropdown(false);
                      onOpenAdmin('moderator');
                    }}
                  >
                    <Wrench size={16} />
                    <span>Herramientas de Moderación</span>
                  </button>
                )}

                <div className="dropdown-divider" />

                {/* LOGOUT */}
                <button
                  className="dropdown-item text-danger"
                  onClick={() => {
                    setShowDropdown(false);
                    onLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>

              </div>
            </>
          )}
        </div>

        {/* CREATE BUTTON */}
        <button
          className="create-review-btn"
          onClick={onCreateReview}
        >
          <Plus size={18} className="btn-icon" />
          <span>Crea Review</span>
          <ChevronDown size={14} />
        </button>

      </div>
    </header>
  );
}
