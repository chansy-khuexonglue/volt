export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
}
