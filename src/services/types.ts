/**
 * 视频播放项类型
 */
export type TVideoPlayItem = {
    /** 播放项标题 */
    title: string;
    /** 播放项URL */
    url: string;
}

/**
 * 视频详细信息类型
 */
export type TVideoDetails = {
    /** 视频类型 */
    type: string;
    /** 地区 */
    region: string;
    /** 年份 */
    year: string;
    /** 别名列表 */
    alias: string[];
    /** 发布日期 */
    releaseDate: string;
    /** 导演列表 */
    director: string[];
    /** 编剧列表 */
    writer: string[];
    /** 演员列表 */
    actors: string[];
    /** 语言 */
    language: string;
}

/**
 * 视频信息类型
 */
export type TVideo = {
    /** 视频链接 */
    href: string;
    /** 视频标题 */
    title: string;
    /** 视频年份 */
    year: string;
    /** 视频封面 */
    cover: string;
    /** 视频评分 */
    rating?: string;
    /** 视频详细信息 */
    details: TVideoDetails;
    /** 视频描述 */
    description: string;
    /** 播放列表 */
    playList: TVideoPlayItem[];
}

/**
 * 视频URL类型
 */
export type TVideoURL = {
    /** 视频URL地址 */
    url: string;
    /** 请求头信息 */
    headers: Record<string, string>;
}

/**
 * 分类项类型
 */
export interface CategoryItem {
    /** 分类标识 */
    slug: string;
    /** 分类名称 */
    text: string;
    /** 分类URL */
    url: string;
}

/**
 * 分类类型
 */
export interface Category {
    /** 分类标签 */
    label: string;
    /** 分类项列表 */
    items: CategoryItem[];
    /** 选中的分类项 */
    selected: CategoryItem | null;
}

/**
 * 所有分类类型
 */
export interface Categories {
    /** 年份分类 */
    year: Category;
    /** 标签分类 */
    tags: Category;
    /** 系列分类 */
    series: Category;
}

/**
 * 电影信息类型
 */
export interface MovieInfo {
    /** 电影标题 */
    title: string;
    /** 评分 */
    rating: string;
    /** 演员 */
    actors: string;
    /** 类型 */
    type: string;
    /** 集数 */
    episodes: string;
    /** 链接 */
    url: string;
    /** 图片 */
    image: string;
}

/**
 * 分页信息类型
 */
export interface PageInfo {
    /** 页码 */
    number: number;
    /** 页面URL */
    url: string;
    /** 是否为当前页 */
    isCurrent: boolean;
}

/**
 * 分页类型
 */
export interface Pagination {
    /** 当前页码 */
    currentPage: number;
    /** 总页数 */
    totalPages: number;
    /** 分页信息列表 */
    pages: PageInfo[];
}

/**
 * 分类响应类型
 */
export interface CategoryResponse {
    /** 分类信息 */
    categories: Categories;
    /** 分页信息 */
    pagination: Pagination;
    /** 视频列表 */
    list: TVideo[];
}

/**
 * 搜索结果的完整返回类型
 */
export interface SearchResult {
    /** 分页信息 */
    pagination: Pagination;
    /** 视频列表 */
    list: TVideo[];
}

/**
 * 视频提供者接口
 */
export interface TVideoProvider {
    /**
     * 检查WebView授权状态
     * @returns Promise<boolean> 授权状态
     */
    checkWebViewAuth(): Promise<boolean>;

    /**
     * 搜索视频
     * @param keyword - 搜索关键词
     * @param page - 页码
     * @returns Promise<SearchResult> 搜索结果
     */
    getVideoSearchResult(keyword: string, page?: number): Promise<SearchResult>;

    /**
     * 获取首页视频列表
     * @returns Promise<TVideo[]> 视频列表
     */
    getHomeVideoList(): Promise<TVideo[]>;

    /**
     * 获取分类视频列表
     * @param path - 分类路径
     * @returns Promise<CategoryResponse> 分类响应
     */
    getVideoCategory(path?: string): Promise<CategoryResponse>;

    /**
     * 获取视频详情
     * @param path - 视频路径
     * @returns Promise<TVideo> 视频信息
     */
    getVideoSources(path: string): Promise<TVideo>;

    /**
     * 获取视频播放地址
     * @param path - 视频路径
     * @returns Promise<TVideoURL> 视频URL信息
     */
    getVideoUrl(path: string): Promise<TVideoURL>;

}

/**
 * 视频提供者服务集合类型
 */
export type TProviderServices = Record<string, TVideoProvider>;