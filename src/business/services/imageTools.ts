// business/services/imageTools.ts
//
// Convierte una imagen (archivo o cuadro de la cámara) en una foto de perfil:
// cuadrada, pequeña (256 px) y liviana, lista para guardar.

const AVATAR_SIZE = 256;

export const squareCropToDataUrl = (
  source: CanvasImageSource,
  width: number,
  height: number,
  mirror = false,
  size = AVATAR_SIZE
): string => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo preparar la imagen");

  // fondo blanco (por si la imagen tiene partes transparentes)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // recorte cuadrado desde el centro
  const side = Math.min(width, height);
  const sx = (width - side) / 2;
  const sy = (height - side) / 2;

  // la cámara se ve como espejo; se guarda igual a como se veía
  if (mirror) {
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(source, sx, sy, side, side, 0, 0, size, size);

  return canvas.toDataURL("image/jpeg", 0.85);
};

export const fileToAvatarDataUrl = async (file: File): Promise<string> => {
  const bitmap = await createImageBitmap(file);

  try {
    return squareCropToDataUrl(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
};

// ---------- fotos del chat ----------
// Se reducen a 800 px de lado mayor para que pesen poco (≈ 50-120 KB).
const CHAT_MAX_SIDE = 800;

export const fileToChatImage = async (file: File): Promise<string> => {
  const bitmap = await createImageBitmap(file);

  try {
    const scale = Math.min(1, CHAT_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo preparar la imagen");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", 0.78);
  } finally {
    bitmap.close();
  }
};

// ---------- foto de perfil desde un enlace ----------

// Acepta https://..., http://... o www...  Todo lo demás (javascript:, ftp:, texto suelto) se rechaza.
export const normalizeImageUrl = (raw: string): string | null => {
  let value = raw.trim();
  if (!value) return null;

  if (/^www\./i.test(value)) value = `https://${value}`;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
};

const loadImage = (src: string, withCors: boolean): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    if (withCors) img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer"; // algunos sitios bloquean si ven de dónde se pide
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = src;
  });

/*
  Devuelve la foto lista para guardar:
   • local: true  → se descargó, se recortó y se guardó dentro de la app (lo mejor).
   • local: false → el sitio no deja copiarla; se guarda el enlace tal cual
                    (si el sitio borra la imagen, dejará de verse).
  Lanza un error si el enlace no es una imagen.
*/
export const imageFromUrl = async (
  url: string
): Promise<{ photo: string; local: boolean }> => {
  try {
    const img = await loadImage(url, true);
    return {
      photo: squareCropToDataUrl(img, img.naturalWidth, img.naturalHeight),
      local: true
    };
  } catch {
    /* el sitio no da permiso para copiarla: se prueba el enlace directo */
  }

  await loadImage(url, false); // si esto falla, no es una imagen
  return { photo: url, local: false };
};
