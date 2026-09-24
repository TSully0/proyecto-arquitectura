export type CategoryId = 'inicio' | 'cines' | 'comida' | 'historicos' | 'extremos' | 'naturaleza';

export type PriceRange = 'CHEAP' | 'MODERATE' | 'EXPENSIVE';

export interface CategoryItem {
  id: CategoryId;
  name: string;
  slug?: string;
  iconName: string;
}

export interface Place {
  id: string;
  name: string;
  category_id: CategoryId;
  description: string;
  address?: string;
  image_url: string;
  images?: string[];
  rating: number;
  review_count: number;
  price_range?: PriceRange;
  has_student_discount: boolean;
  is_study_friendly?: boolean;
  has_wifi: boolean;
  is_open: boolean;
  is_pet_friendly?: boolean;
  is_accessible?: boolean;
  is_night_spot?: boolean;
  latitude?: number;
  longitude?: number;
  likes_count?: number;
}

export interface Review {
  id: string;
  place_id: string;
  user_id?: string;
  author_name: string;
  author_avatar?: string;
  rating?: number;
  has_visited?: boolean;
  comment: string;
  created_at?: string;
}

export interface CommunityComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
  hasVisited?: boolean;
  rating?: number;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  timestamp: string;
  locationName: string;
  content: string;
  imageUrl: string;
  place: Place;
  likesCount: number;
  isLiked?: boolean;
  commentsCount: number;
  comments: CommunityComment[];
}

// Retrocompatibilidad de alias si es necesario
export type FacebookPost = CommunityPost;

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  avatarUrl?: string;
  type?: 'review' | 'system' | 'discount';
}
