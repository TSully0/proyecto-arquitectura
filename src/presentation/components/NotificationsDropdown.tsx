import { useState } from 'react';
import { Bell, CheckCheck, MoreHorizontal, MessageSquare, Tag, ShieldCheck } from 'lucide-react';
import type { NotificationItem } from '../../business/types/place';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export function NotificationsDropdown({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead
}: NotificationsDropdownProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'unread') return !notif.isRead;
    return true;
  });

  return (
    <>
      <div className="dropdown-overlay" onClick={onClose} />
      <div className="notifications-floating-panel">
        {/* Header */}
        <div className="notif-header">
          <div className="notif-header-title">
            <h3>Notificaciones</h3>
            <button className="notif-more-btn" aria-label="Opciones de notificación">
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Filter Pills: Todas | No leídas */}
          <div className="notif-tabs-row">
            <button
              className={`notif-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Todas
            </button>
            <button
              className={`notif-tab-btn ${activeTab === 'unread' ? 'active' : ''}`}
              onClick={() => setActiveTab('unread')}
            >
              No leídas
            </button>

            {notifications.some((n) => !n.isRead) && (
              <button
                className="notif-mark-read-btn"
                onClick={onMarkAllAsRead}
                title="Marcar todas como leídas"
              >
                <CheckCheck size={14} />
                <span>Marcar leídas</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List or Empty State */}
        <div className="notif-body">
          {filteredNotifications.length > 0 ? (
            <div className="notif-items-list">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                >
                  <div className="notif-avatar-col">
                    {notif.avatarUrl ? (
                      <img src={notif.avatarUrl} alt="" className="notif-avatar" />
                    ) : (
                      <div className="notif-icon-fallback">
                        {notif.type === 'review' ? (
                          <MessageSquare size={16} />
                        ) : notif.type === 'discount' ? (
                          <Tag size={16} />
                        ) : (
                          <ShieldCheck size={16} />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="notif-content-col">
                    <p className="notif-description">
                      <strong>{notif.title}</strong>: {notif.description}
                    </p>
                    <span className="notif-time">{notif.timestamp}</span>
                  </div>

                  {!notif.isRead && <span className="notif-unread-dot" />}
                </div>
              ))}
            </div>
          ) : (
            /* Estado Vacío de Notificaciones */
            <div className="notif-empty-state">
              <div className="notif-empty-icon-box">
                <Bell size={28} />
              </div>
              <h4>No tienes notificaciones pendientes</h4>
              <p>
                Aún no has recibido nuevas notificaciones. Te avisaremos aquí tan pronto como la comunidad comparta nuevas reseñas, recomendaciones o promociones en Manta.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="notif-footer">
          <button className="notif-footer-link" onClick={onClose}>
            Cerrar panel
          </button>
        </div>
      </div>
    </>
  );
}
