import { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Image as ImageIcon, Link as LinkIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { fileToChatImage } from '../../../business/services/imageTools';

interface PlaceImageInputProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function PlaceImageInput({ value, onChange, disabled = false }: PlaceImageInputProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('El archivo seleccionado no es una imagen válida.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('La imagen es demasiado pesada. Elige una de menos de 10 MB.');
      return;
    }

    setErrorMessage(null);
    setImageLoadError(false);
    setIsProcessing(true);

    try {
      let dataUrl: string;
      try {
        dataUrl = await fileToChatImage(file);
      } catch {
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') resolve(reader.result);
            else reject(new Error('Formato no soportado'));
          };
          reader.onerror = () => reject(new Error('Error de lectura'));
          reader.readAsDataURL(file);
        });
      }

      onChange(dataUrl);
    } catch {
      setErrorMessage('No se pudo procesar la imagen seleccionada.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    setImageLoadError(false);
    setErrorMessage(null);
    onChange('');
  };

  const isDataUrl = value.startsWith('data:');

  return (
    <div className="place-image-input-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        disabled={disabled || isProcessing}
      />

      {value ? (
        <div className="place-image-preview-card">
          <div className="place-image-preview-header">
            <span className="place-image-preview-badge">
              <ImageIcon size={14} /> Vista previa de la imagen
            </span>
            <div className="place-image-preview-actions">
              <button
                type="button"
                className="place-image-action-btn change"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isProcessing}
                title="Cambiar foto desde el dispositivo"
              >
                <RefreshCw size={14} /> Cambiar foto
              </button>
              <button
                type="button"
                className="place-image-action-btn remove"
                onClick={handleRemove}
                disabled={disabled || isProcessing}
                title="Quitar foto"
              >
                <Trash2 size={14} /> Quitar
              </button>
            </div>
          </div>

          <div className="place-image-preview-box">
            <img
              src={value}
              alt="Previsualización de lugar"
              className="place-image-preview-img"
              onError={() => setImageLoadError(true)}
              onLoad={() => setImageLoadError(false)}
            />
            {imageLoadError && (
              <div className="place-image-load-error">
                <AlertCircle size={16} /> No se pudo cargar la imagen desde este enlace.
              </div>
            )}
          </div>

          {!isDataUrl && (
            <div className="place-image-url-edit-bar">
              <button
                type="button"
                className="btn-text-toggle"
                onClick={() => setShowUrlField(!showUrlField)}
              >
                {showUrlField ? 'Ocultar enlace URL' : 'Editar enlace URL'}
              </button>
              {showUrlField && (
                <div className="input-with-icon mt-2">
                  <LinkIcon size={16} className="input-icon" />
                  <input
                    type="url"
                    value={value}
                    onChange={(e) => {
                      setImageLoadError(false);
                      onChange(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    disabled={disabled}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="place-image-empty-picker">
          <button
            type="button"
            className="place-image-device-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isProcessing}
          >
            <Camera size={20} className="place-image-camera-icon" />
            <div className="place-image-btn-texts">
              <span className="place-image-btn-main">
                {isProcessing ? 'Procesando imagen...' : 'Subir foto del dispositivo o galería'}
              </span>
              <span className="place-image-btn-sub">
                Selecciona una foto desde tus archivos o galería
              </span>
            </div>
          </button>

          <div className="place-image-or-divider">
            <span>o ingresa un enlace web</span>
          </div>

          <div className="input-with-icon">
            <Upload size={16} className="input-icon" />
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={value}
              onChange={(e) => {
                setImageLoadError(false);
                onChange(e.target.value);
              }}
              disabled={disabled || isProcessing}
            />
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="place-image-error-notice">
          <AlertCircle size={15} /> {errorMessage}
        </div>
      )}
    </div>
  );
}
