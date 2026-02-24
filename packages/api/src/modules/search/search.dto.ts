export interface SearchQueryDTO {
  q: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SuggestQueryDTO {
  q: string;
  limit?: number;
}
