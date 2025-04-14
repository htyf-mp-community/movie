export interface CategoryItem {
  text: string;
  slug: string;
  url: string;
}

export interface CategoryGroup {
  items: CategoryItem[];
}

export interface Categories {
  year: CategoryGroup;
  tags: CategoryGroup;
  series: CategoryGroup;
}

export interface MovieInfo {
  title: string;
  href: string;
  cover?: string;
  year: string;
  type: string;
  rating?: string;
  description: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
} 