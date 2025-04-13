/**
 * 视频信息接口
 * @interface TVideo
 */
export interface TVideo {
  href: string;
  title: string;
  cover: string;
  year?: string;
  details?: TVideoDetails;
  playList?: TVideoPlayItem[];
}

/**
 * 视频详情接口
 * @interface TVideoDetails
 */
export interface TVideoDetails {
  url: string;
  type?: string;
  region?: string;
  year?: string;
  alias?: string;
  releaseDate?: string;
  director?: string;
  writer?: string;
  actors?: string[];
  language?: string;
  description?: string;
}

/**
 * 视频播放项接口
 * @interface TVideoPlayItem
 */
export interface TVideoPlayItem {
  url: string;
  title: string;
}

/**
 * 分类接口
 * @interface Categories
 */
export interface Categories {
  year: CategoryGroup;
  tags: CategoryGroup;
  series: CategoryGroup;
}

/**
 * 分类组接口
 * @interface CategoryGroup
 */
export interface CategoryGroup {
  items: CategoryItem[];
}

/**
 * 分类项接口
 * @interface CategoryItem
 */
export interface CategoryItem {
  slug: string;
  text: string;
  url: string;
}

/**
 * 分页信息接口
 * @interface Pagination
 */
export interface Pagination {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * 数据对象接口
 * @interface DataObject
 */
export interface DataObject<T> {
  [key: string]: T;
}

/**
 * 电影列表项接口
 * @interface MovieItem
 */
export interface MovieItem {
  url: string;
  name: string;
  img?: string;
  year?: string;
  details?: TVideoDetails;
  [key: string]: any;
} 