export type TVideosRec = { title: string, href: string, videos: TVideo[] }
export type TVideo = {
    title: string
    href: string
    img: string
    status: string
}
export type TVideoWithSource = TVideo & { source: TVideoSources };
export type TVideoSourcesItem = { href: string, ep: string };
export type TVideoSources = Record<string, TVideoSourcesItem[]>
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
    getVideoSources(path: string): Promise<TVideoSources>

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

    /**
     * Called when favourite videos are loaded from local storage
     * to ensure videos status are up to date
     * @param video favourite video stored in local
     */
    updateVideoStatus(video: TVideo): Promise<TVideo>
}
export type TProviderServices = Record<string, TVideoProvider>