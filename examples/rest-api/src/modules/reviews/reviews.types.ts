export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface CreateReviewDto {
  rating: number;
  comment: string;
}

export interface ProductReviewsSummary {
  productId: string;
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
}
