import { useState } from "react";

interface EditNameModalProps {
  currentName: string;
  daysLeft: number;
  onClose: () => void;
  onConfirm: (newName: string) => void;
}

/*
  Se monta solo cuando está abierto ({abierto && <EditNameModal ... />}),
  así el campo siempre empieza con el nombre actual.
*/
export function EditNameModal({ currentName, daysLeft, onClose, onConfirm }: EditNameModalProps) {
  const [newName, setNewName] = useState(currentName);

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Cambiar nombre</h3>

        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          maxLength={40}
          autoFocus
        />

        {daysLeft > 0 ? (
          <p className="modal-warning">
            ⚠️ Podrás cambiar tu nombre de nuevo en {daysLeft} día
            {daysLeft === 1 ? "" : "s"}
          </p>
        ) : (
          <p className="modal-info">
            ℹ️ Después de cambiarlo, no podrás hacerlo por 7 días
          </p>
        )}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => onConfirm(newName)}
            disabled={daysLeft > 0}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
