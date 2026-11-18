import { supabase } from '../supabase';
import type { NotificationItem } from '../../business/types/place';

function getStorageKey(userKey: string): string {
  return `app_notifications_${userKey.toLowerCase()}`;
}

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

const DEFAULT_MANTA_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-manta-1',
    title: 'Beneficio Estudiantil ULEAM',
    description: '20% de descuento en Cinemark Manta (Mall del Pacífico) presentando carnet universitario.',
    timestamp: 'Hace 30 min',
    isRead: false,
    type: 'discount'
  },
  {
    id: 'notif-manta-2',
    title: 'Nueva Recomendación en Tarqui',
    description: 'Juan Pérez recomendó los mariscos frescos y ceviches de Cevichería El Chaval frente al puerto pesquero.',
    timestamp: 'Hace 2 horas',
    isRead: false,
    type: 'review'
  },
  {
    id: 'notif-manta-3',
    title: 'Comunidad MantaCampus',
    description: '¡Bienvenido a la red universitaria de huecas y lugares turísticos de Manta!',
    timestamp: 'Hace 1 día',
    isRead: true,
    type: 'system'
  }
];

function getLocalNotifications(userKey: string): NotificationItem[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userKey));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  saveLocalNotifications(userKey, DEFAULT_MANTA_NOTIFICATIONS);
  return DEFAULT_MANTA_NOTIFICATIONS;
}

function saveLocalNotifications(userKey: string, items: NotificationItem[]): void {
  try {
    localStorage.setItem(getStorageKey(userKey), JSON.stringify(items));
  } catch (err) {
    console.warn('Error guardando notificaciones locales:', err);
  }
}

/**
 * Carga las notificaciones de un usuario desde Supabase (tabla notifications)
 * con fallback a almacenamiento local sincronizado.
 */
export async function fetchUserNotifications(userKey: string): Promise<NotificationItem[]> {
  try {
    const normalizedKey = userKey.toLowerCase();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${normalizedKey},user_id.eq.all`)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped: NotificationItem[] = data.map((row) => ({
        id: String(row.id),
        title: row.title || 'Notificación',
        description: row.description || '',
        timestamp: formatRelativeTime(row.created_at),
        isRead: Boolean(row.is_read),
        avatarUrl: row.avatar_url || undefined,
        type: (row.type as NotificationItem['type']) || 'system'
      }));

      saveLocalNotifications(userKey, mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase notifications no disponible, usando local:', err);
  }

  return getLocalNotifications(userKey);
}

/**
 * Marca una notificación individual como leída en Supabase y localmente.
 */
export async function markNotificationAsReadInDb(
  notificationId: string,
  userKey: string
): Promise<void> {
  const current = getLocalNotifications(userKey);
  const updated = current.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));
  saveLocalNotifications(userKey, updated);

  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
  } catch {
    // Silencioso si la tabla aún no existe en BD
  }
}

/**
 * Marca todas las notificaciones como leídas en Supabase y localmente.
 */
export async function markAllNotificationsAsReadInDb(userKey: string): Promise<void> {
  const current = getLocalNotifications(userKey);
  const updated = current.map((n) => ({ ...n, isRead: true }));
  saveLocalNotifications(userKey, updated);

  try {
    const normalizedKey = userKey.toLowerCase();
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .or(`user_id.eq.${normalizedKey},user_id.eq.all`);
  } catch {
    // Silencioso si la tabla aún no existe en BD
  }
}

/**
 * Crea una nueva notificación en la base de datos (y la añade al caché local).
 */
export async function createNotificationInDb(
  notif: {
    title: string;
    description: string;
    type: 'review' | 'system' | 'discount' | 'follow';
    avatarUrl?: string;
  },
  targetUserKey: string
): Promise<NotificationItem> {
  const newItem: NotificationItem = {
    id: `notif-${Date.now()}`,
    title: notif.title,
    description: notif.description,
    timestamp: 'Justo ahora',
    isRead: false,
    avatarUrl: notif.avatarUrl,
    type: notif.type
  };

  const current = getLocalNotifications(targetUserKey);
  const updated = [newItem, ...current];
  saveLocalNotifications(targetUserKey, updated);

  try {
    const { data } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: targetUserKey.toLowerCase(),
          title: notif.title,
          description: notif.description,
          type: notif.type,
          avatar_url: notif.avatarUrl || null,
          is_read: false
        }
      ])
      .select('id, created_at')
      .single();

    if (data?.id) {
      newItem.id = String(data.id);
    }
  } catch {
    // Fallback asegurado
  }

  return newItem;
}
