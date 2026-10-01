import { X, ShieldCheck, Users, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../business/types/user";
import "../../styles/admin-modal.css";

interface AdminPanelModalProps {
  isOpen: boolean;
  type: "admin" | "moderator";
  user: User;
  onClose: () => void;
}

export function AdminPanelModal({
  isOpen,
  type,
  user,
  onClose
}: AdminPanelModalProps) {

  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      
      <div
        className="modal-dialog admin-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="modal-header">

          <div className="flex-row items-center gap-2">
            <span className="admin-badge-icon">
              {type === "admin"
                ? <ShieldCheck size={20} color="#0cb7f2" />
                : <AlertCircle size={20} color="#0cb7f2" />}
            </span>

            <div>
              <span className="modal-tag">
                {type === "admin"
                  ? "PANEL DE ADMINISTRACIÓN"
                  : "HERRAMIENTAS DE MODERACIÓN"}
              </span>

              <h2 className="modal-title">
                {type === "admin"
                  ? "Gestión General de MantaCampus"
                  : "Moderación de Contenido & Reviews"}
              </h2>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>

        </div>

        {/* BODY */}
        <div className="admin-modal-body">

          {/* USUARIO */}
          <div className="admin-status-box">
            <strong>Usuario activo:</strong>{" "}
            {user.name} ({user.email}) •{" "}
            <span className="text-primary font-bold">
              {user.role.toUpperCase()}
            </span>
          </div>

          {/* STATS */}
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

          {/* ACCIONES */}
          <div className="admin-section-title">
            Acciones Rápidas
          </div>

          <div className="admin-actions-list">

            <div className="admin-action-item">
              <div className="action-info">
                <CheckCircle size={18} color="#10b981" />
                <span>Base de datos conectada correctamente.</span>
              </div>
              <span className="status-pill status-ok">En línea</span>
            </div>

            <div className="admin-action-item">
              <div className="action-info">
                <MapPin size={18} color="#0cb7f2" />
                <span>Geolocalización activa en Manta.</span>
              </div>
              <span className="status-pill status-active">Activo</span>
            </div>

            <div className="admin-action-item">
              <div className="action-info">
                <Users size={18} color="#0cb7f2" />
                <span>Gestión de roles y permisos.</span>
              </div>
              <span className="status-pill status-active">OK</span>
            </div>

            {/* 🔥 IR A USUARIOS */}
            <div
              className="admin-action-item clickable"
              onClick={() => navigate("/admin/users")}
            >
              <div className="action-info">
                <Users size={18} color="#0cb7f2" />
                <span>Gestionar usuarios</span>
              </div>
              <span className="status-pill">Ir</span>
            </div>

            {/* 🔥 IR A MODERACIÓN */}
            <div
              className="admin-action-item clickable"
              onClick={() => navigate("/moderacion")}
            >
              <div className="action-info">
                <AlertCircle size={18} color="#f59e0b" />
                <span>Ir a moderación</span>
              </div>
              <span className="status-pill">Ir</span>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}