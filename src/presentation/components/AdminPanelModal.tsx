import { X, ShieldCheck, Users, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import type { User } from '../../business/types/user';

interface AdminPanelModalProps {
  isOpen: boolean;
  type: 'admin' | 'moderator';
  user: User;
  onClose: () => void;
}

export function AdminPanelModal({ isOpen, type, user, onClose }: AdminPanelModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-row items-center gap-2">
            <span className="admin-badge-icon">
              {type === 'admin' ? <ShieldCheck size={20} color="#0cb7f2" /> : <AlertCircle size={20} color="#0cb7f2" />}
            </span>
            <div>
              <span className="modal-tag">{type === 'admin' ? 'PANEL DE ADMINISTRACIÓN' : 'HERRAMIENTAS DE MODERACIÓN'}</span>
              <h2 className="modal-title">
                {type === 'admin' ? 'Gestión General de MantaCampus' : 'Moderación de Contenido & Reviews'}
              </h2>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-status-box">
            <strong>Usuario activo:</strong> {user.name} ({user.email}) &bull; <span className="text-primary font-bold">{user.role.toUpperCase()}</span>
          </div>

          <div className="admin-grid-stats">
            <div className="stat-card">
              <span className="stat-number">6</span>
              <span className="stat-label">Lugares Verificados</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">1,245</span>
              <span className="stat-label">Reseñas Aprobadas</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">0</span>
              <span className="stat-label">Reportes Pendientes</span>
            </div>
          </div>

          <div className="admin-section-title">Acciones Rápidas</div>
          <div className="admin-actions-list">
            <div className="admin-action-item">
              <div className="action-info">
                <CheckCircle size={18} color="#10b981" />
                <span>Base de datos Supabase conectada con RLS activado.</span>
              </div>
              <span className="status-pill status-ok">En línea</span>
            </div>
            <div className="admin-action-item">
              <div className="action-info">
                <MapPin size={18} color="#0cb7f2" />
                <span>Sincronización de coordenadas geográficas en Manta.</span>
              </div>
              <span className="status-pill status-active">Activo</span>
            </div>
            <div className="admin-action-item">
              <div className="action-info">
                <Users size={18} color="#0cb7f2" />
                <span>Control de roles y permisos (Admin / Moderador / Estudiante).</span>
              </div>
              <span className="status-pill status-active">Configurado</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
