export interface ReviewRequest {
  userId: string;
  placeId: string;
  rating?: number;
  text: string;
}

export interface ReviewUpdateRequest {
  rating?: number | null;
  text?: string;
}

export interface BackendReview {
  id: string;
  placeId?: string;
  place_id?: string;
  userId?: string | null;
  user_id?: string | null;
  authorName?: string;
  author_name?: string;
  rating?: number | null;
  comment?: string;
  text?: string;
  createdAt?: string;
  created_at?: string;
  User?: { fullName?: string };
  places?: {
    name?: string;
    address?: string;
    image_url?: string;
    images?: string[];
  } | null;
}

export class ReviewsApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ReviewsApiError';
    this.status = status;
  }
}

function getErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === 'string' && payload.trim()) return payload;

  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = payload.message;
    if (typeof message === 'string' && message.trim()) return message;
    if (Array.isArray(message)) {
      const messages = message.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0
      );
      if (messages.length > 0) return messages.join(' ');
    }
  }

  return `No se pudo procesar la reseña (error ${status}).`;
}

function isBackendReview(value: unknown): value is BackendReview {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string'
  );
}

export function createReviewsService(
  apiUrl: string | undefined,
  fetcher: typeof fetch = fetch,
  createTextField: 'text' | 'comment' = 'comment'
) {
  const baseUrl = apiUrl?.trim().replace(/\/+$/, '');
  if (!baseUrl) {
    throw new Error('Configura VITE_API_URL con la URL de tu backend para publicar reseñas.');
  }

  const reviewsUrl = `${baseUrl}/reviews`;

  const request = async (
    url: string,
    method: 'GET' | 'POST' | 'PATCH',
    body?: object
  ) => {
    const response = await fetcher(url, {
      method,
      headers: body
        ? { Accept: 'application/json', 'Content-Type': 'application/json' }
        : { Accept: 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const responseText = await response.text();
    let responseBody: unknown;

    if (responseText) {
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = responseText;
      }
    }

    if (!response.ok) {
      throw new ReviewsApiError(getErrorMessage(responseBody, response.status), response.status);
    }

    return responseBody;
  };

  return {
    list: async (): Promise<BackendReview[]> => {
      const responseBody = await request(reviewsUrl, 'GET');
      if (!Array.isArray(responseBody) || !responseBody.every(isBackendReview)) {
        throw new Error('El backend devolvió una lista de reseñas con formato inesperado.');
      }
      return responseBody;
    },
    create: (review: ReviewRequest) => {
      if (!review.userId.trim() || !review.placeId.trim() || !review.text.trim()) {
        throw new Error('La reseña necesita usuario, lugar y comentario.');
      }
      if (!isValidUuid(review.placeId)) {
        throw new Error(
          'El lugar seleccionado tiene un ID que no es un UUID válido. Selecciona un lugar existente del backend.'
        );
      }
      if (
        review.rating !== undefined &&
        (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5)
      ) {
        throw new Error('La calificación debe ser un número entero entre 1 y 5.');
      }
      return request(reviewsUrl, 'POST', {
        userId: review.userId,
        placeId: review.placeId,
        rating: review.rating,
        [createTextField]: review.text
      });
    },
    update: (id: string, review: ReviewUpdateRequest) => {
      if (!id.trim()) throw new Error('Se necesita el identificador de la reseña.');
      if (
        review.rating !== undefined &&
        review.rating !== null &&
        (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5)
      ) {
        throw new Error('La calificación debe ser un número entero entre 1 y 5.');
      }
      return request(`${reviewsUrl}/${encodeURIComponent(id)}`, 'PATCH', {
        rating: review.rating,
        comment: review.text
      });
    }
  };
}

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export function listReviews() {
  return createReviewsService(getReviewsApiUrl()).list();
}

export function createReview(review: ReviewRequest) {
  return createReviewsService(
    getReviewsApiUrl(),
    fetch,
    import.meta.env.DEV ? 'text' : 'comment'
  ).create(review);
}

export function updateReview(id: string, review: ReviewUpdateRequest) {
  return createReviewsService(getReviewsApiUrl()).update(id, review);
}

function getReviewsApiUrl(): string | undefined {
  return import.meta.env.PROD ? '/api' : import.meta.env.VITE_API_URL;
}
