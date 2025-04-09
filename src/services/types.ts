export type TVideosRec = { title: string, href: string, videos: TVideo[] }
export type TVideo = {
    href: string;
    // 基本信息
    title: string;
    year: string;
    cover: string;
    // 详细信息
    details: {
        type: string;
        region: string;
        year: string;
        alias: string[];
        releaseDate: string;
        director: string[];
        writer: string[];
        actors: string[];
        language: string;
    },
    // 剧情简介
    description: string;
    // 播放列表
    playList: { title: string, url: string }[];
}
export type TVideoPlay = { url: string, title: string, index: number, source: string, sourceEps: { href: string, ep: string }[] }
export type TVideoURL = { url: string, headers: any }

// 分类项类型
export interface CategoryItem {
    slug: string;
    text: string;
    url: string;
}

// 分类类型
export interface Category {
    label: string;
    items: CategoryItem[];
    selected: CategoryItem | null;
}

// 所有分类类型
export interface Categories {
    year: Category;
    tags: Category;
    series: Category;
}

// 电影信息类型
export interface MovieInfo {
    title: string;
    rating: string;
    actors: string;
    type: string;
    episodes: string;
    url: string;
    image: string;
}

// 分页信息类型
export interface PageInfo {
    number: number;
    url: string;
    isCurrent: boolean;
}

// 分页类型
export interface Pagination {
    currentPage: number;
    totalPages: number;
    pages: PageInfo[];
}

// 完整响应类型
export interface CategoryResponse {
    categories: Categories;
    pagination: Pagination;
    list: MovieInfo[];
}

// 分页信息类型
interface PaginationInfo {
    currentPage: number;      // 当前页码
    totalPages: number;       // 总页数
    pages: {                 // 分页链接数组
      number: number;        // 页码
      url: string;          // 对应的URL
    }[];
  }
  
  // 视频项类型
  interface VideoItem {
    title: string;          // 视频标题
    link: string;           // 视频链接
    image: string;          // 封面图片
    actors: string;         // 演员信息
  }
  
  // 搜索结果的完整返回类型
export interface SearchResult {
    pagination: PaginationInfo;  // 分页信息
    list: VideoItem[];          // 视频列表
}

export type TVideoProvider = {
    /**
     * 获取首页数据
     */
    getHomeVideoList(): Promise<TVideosRec[]>

    /**
     *  获取分类列表数据
     * @param path url to the video category
     */
    getVideoCategory(path?: string): Promise<CategoryResponse>

    /**
     * 获取视频详情
     * @param path url to the video
     */
    getVideoSources(path: string): Promise<TVideo>

    /**
     * 获取播放地址
     * @param path url
     */
    getVideoUrl(path: string): Promise<TVideoURL>

    /**
     * 获取搜索数据
     * @param keyword video search keyword
     */
    getVideoSearchResult(keyword: string, page?: number): Promise<SearchResult>
}
export type TProviderServices = Record<string, TVideoProvider>