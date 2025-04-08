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

export type TVideoProvider = {
    /**
     * 获取首页数据
     */
    getHomeVideoList(): Promise<TVideosRec[]>

    /**
     *  获取分类列表数据
     * @param path url to the video category
     */
    getVideoCategory(path: string): Promise<TVideosRec[]>

    /**
     * 获取分类列表数据
     * @param path url to the video category list
     * @param page next page to load
     */
    getVideoCategoryMore(path: string, page: number): Promise<TVideosRec>

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
    getVideoSearchResult(keyword: string, page?: number): Promise<{page: number, list: TVideo[]}>
}
export type TProviderServices = Record<string, TVideoProvider>