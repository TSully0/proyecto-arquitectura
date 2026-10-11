import { useEffect, useRef, useState } from "react";
import { Camera, Link2, Trash2, Upload } from "lucide-react";

import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { UserAvatar } from "../ui/UserAvatar";
import { useToast } from "../ui/toast-context";
import {
  fileToAvatarDataUrl,
  imageFromUrl,
  normalizeImageUrl,
  squareCropToDataUrl
} from "../../../business/services/imageTools";
import {
  removeProfilePhoto,
  saveProfilePhoto
} from "../../../data/repositories/profilePhoto";

import "../../../styles/avatar.css";

type Mode = "choose" | "camera" | "link" | "preview";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

interface ProfilePhotoModalProps {
  userId: string;
  name: string;
  hasPhoto: boolean;
  onClose: () => void;
}

/*
  Se monta solo cuando está abierto ({abierto && <ProfilePhotoModal ... />}),
  así siempre empieza en "elegir" y la cámara se apaga al cerrarlo.

  Formas de poner la foto: subir un archivo, tomar una foto o pegar un enlace.
*/
export function ProfilePhotoModal({ userId, name, hasPhoto, onClose }: ProfilePhotoModalProps) {
  const { success, error } = useToast();

  const [mode, setMode] = useState<Mode>("choose");
  const [preview, setPreview] = useState<string | null>(null);
  const [previewIsLink, setPreviewIsLink] = useState(false); // la foto es el enlace tal cual
  const [linkUrl, setLinkUrl] = useState("");
  const [loadingLink, setLoadingLink] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* =========================
     CÁMARA: se enciende solo en modo "camera"
     y siempre se apaga al salir de ese modo o al cerrar
  ========================= */
  useEffect(() => {
    if (mode !== "camera") return;

    let cancelled = false;
    let stream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }

        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => {
        if (cancelled) return;
        error("No se pudo usar la cámara. Revisa los permisos del navegador.");
        setMode("choose");
      });

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [mode, error]);

  /* =========================
     ACCIONES
  ========================= */
  const showPreview = (photo: string, isLink: boolean) => {
    setPreview(photo);
    setPreviewIsLink(isLink);
    setMode("preview");
  };

  const startCamera = () => {
    // la cámara solo funciona en https o en localhost
    if (!navigator.mediaDevices?.getUserMedia) {
      error("Tu navegador no permite usar la cámara en esta página.");
      return;
    }

    setMode("camera");
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    showPreview(squareCropToDataUrl(video, video.videoWidth, video.videoHeight, true), false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite elegir el mismo archivo otra vez

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      error("Ese archivo no es una imagen.");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      error("La imagen pesa más de 5 MB. Elige una más liviana.");
      return;
    }

    try {
      showPreview(await fileToAvatarDataUrl(file), false);
    } catch {
      error("No se pudo leer esa imagen. Prueba con JPG o PNG.");
    }
  };

  const handleLoadLink = async () => {
    if (loadingLink) return;

    const url = normalizeImageUrl(linkUrl);
    if (!url) {
      error("Pega un enlace válido, que empiece por https://");
      return;
    }

    setLoadingLink(true);

    try {
      const result = await imageFromUrl(url);
      showPreview(result.photo, !result.local);
    } catch {
      error("No se pudo cargar una imagen desde ese enlace. Usa la dirección directa de la imagen (mejor si empieza por https://).");
    } finally {
      setLoadingLink(false);
    }
  };

  const handleSave = () => {
    if (!preview) return;

    if (saveProfilePhoto(userId, preview)) {
      success("Foto de perfil actualizada");
      onClose();
    } else {
      error("No hay espacio para guardar la foto. Prueba con otra más pequeña.");
    }
  };

  const handleRemove = () => {
    removeProfilePhoto(userId);
    success("Foto eliminada. Se mostrará tu inicial.");
    onClose();
  };

  /* =========================
     UI
  ========================= */
  const footer =
    mode === "camera" ? (
      <>
        <Button variant="secondary" onClick={() => setMode("choose")}>
          Cancelar
        </Button>
        <Button icon={<Camera size={16} />} onClick={capture}>
          Capturar
        </Button>
      </>
    ) : mode === "link" ? (
      <>
        <Button variant="secondary" onClick={() => setMode("choose")}>
          Volver
        </Button>
        <Button onClick={handleLoadLink} disabled={loadingLink || !linkUrl.trim()}>
          {loadingLink ? "Cargando..." : "Cargar imagen"}
        </Button>
      </>
    ) : mode === "preview" ? (
      <>
        <Button variant="secondary" onClick={() => setMode("choose")}>
          Elegir otra
        </Button>
        <Button onClick={handleSave}>Usar esta foto</Button>
      </>
    ) : (
      <Button variant="secondary" onClick={onClose}>
        Cancelar
      </Button>
    );

  return (
    <Modal
      isOpen
      title="Foto de perfil"
      tag="Tu perfil"
      maxWidth={440}
      onClose={onClose}
      footer={footer}
    >
      {mode === "choose" && (
        <>
          <div className="photo-current">
            <UserAvatar userId={userId} name={name} size={96} />
          </div>

          <div className="photo-options">
            <button
              type="button"
              className="photo-option"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={20} />
              <div>
                Subir desde mi dispositivo
                <small>JPG, PNG o WebP, hasta 5 MB</small>
              </div>
            </button>

            <button type="button" className="photo-option" onClick={startCamera}>
              <Camera size={20} />
              <div>
                Tomar foto
                <small>Usa la cámara de tu dispositivo</small>
              </div>
            </button>

            <button type="button" className="photo-option" onClick={() => setMode("link")}>
              <Link2 size={20} />
              <div>
                Usar un enlace
                <small>Pega la dirección de una imagen de internet</small>
              </div>
            </button>

            {hasPhoto && (
              <button type="button" className="photo-option danger" onClick={handleRemove}>
                <Trash2 size={20} />
                <div>
                  Quitar foto
                  <small>Volverás a mostrar tu inicial</small>
                </div>
              </button>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="photo-file-input"
            onChange={handleFile}
          />
        </>
      )}

      {mode === "camera" && (
        <>
          <video ref={videoRef} className="photo-video" autoPlay playsInline muted />
          <div className="photo-hint">Encuadra tu cara y pulsa "Capturar".</div>
        </>
      )}

      {mode === "link" && (
        <>
          <label className="photo-link-label" htmlFor="photo-link">
            Dirección (URL) de la imagen
          </label>
          <input
            id="photo-link"
            className="photo-link-input"
            type="url"
            placeholder="https://ejemplo.com/mi-foto.jpg"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLoadLink();
            }}
            autoFocus
          />
          <div className="photo-hint">
            Tip: en una imagen de internet, clic derecho → "Copiar dirección de imagen".
          </div>
        </>
      )}

      {mode === "preview" && preview && (
        <>
          <img src={preview} alt="Vista previa de tu foto" className="photo-preview" referrerPolicy="no-referrer" />
          <div className="photo-hint">Así se verá tu foto de perfil.</div>
          {previewIsLink && (
            <div className="photo-hint">
              Se usará el enlace directamente: si la página original borra la imagen, dejará de verse.
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
