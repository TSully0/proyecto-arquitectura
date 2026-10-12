import { Modal } from "../ui/Modal";

type ChatMediaViewerProps = {
  image: string | null;
  onClose: () => void;
};

export function ChatMediaViewer({
  image,
  onClose,
}: ChatMediaViewerProps) {
  if (!image) return null;

  return (
    <Modal
      isOpen={Boolean(image)}
      title="Imagen ampliada"
      onClose={onClose}
    >
      <div className="chat-media-viewer">
        <button
          type="button"
          className="chat-icon-btn"
          onClick={onClose}
          aria-label="Cerrar imagen"
          title="Cerrar"
        >
          ×
        </button>

        <img
          src={image}
          alt="Imagen ampliada"
          className="chat-lightbox-img"
        />
      </div>
    </Modal>
  );
}
