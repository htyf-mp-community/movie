import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TVideo, TVideosRec, TVideoWithSource, TVService, TVideoProvider, TVideoPlay } from "../services";

export type TVideoContext = ReturnType<typeof useVideo>
export const VideoContext = React.createContext<TVideoContext>({} as TVideoContext);
export const useVideoContext = () => React.useContext(VideoContext);

export const useVideo = () => {
    const [init, setInit] = useState(false)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [provider, setProvider] = useState<string>(Object.keys(TVService)[0])
    const [videos, setVideos] = useState<TVideosRec[]>([]);
    const [searchVideos, setSearchVideos] = useState<TVideo[]>([]);
    const [favouriteVideos, setFavouriteVideos] = useState<TVideo[]>([]);

    const tvService = TVService[provider]

    useEffect(() => {
        (async () => {
            if (!provider) {
                return
            }

            const videos = await withErrBound(tvService.getHomeVideoList())
            setVideos(videos || [])
            await loadFavourite()
            setSearchVideos([])
            if (!init) {
                setInit(true)
            }
        })()
    }, [provider]);

    const withErrBound = async<T extends keyof TVideoProvider, P = ReturnType<TVideoProvider[T]>>(
        p: P, checkFunc?: (res: Awaited<P>) => void) => {
        setLoading(true)
        try {
            const result = await p
            if (checkFunc) {
                checkFunc(result)
            }
            return result
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Something went wrong.')
            }
        } finally {
            setLoading(false)
        }
    }

    const refreshHomeList = async () => {
        const videos = await withErrBound(tvService.getHomeVideoList())
        setVideos(videos || [])
    }

    const getVideoCategory = async (path: string) => {
        const videos = await withErrBound(tvService.getVideoCategory(path))
        if (!videos) {
            return []
        }
        return videos
    }

    const getVideoCategoryMore = async (path: string, page: number) => {
        const videos = await withErrBound(tvService.getVideoCategoryMore(path, page))
        if (!videos) {
            return null
        }
        return videos
    }

    const getVideoUrl = (url: string, prov = provider) => {
        return TVService[prov].getVideoUrl(url)
    }

    const playOfflineVideo = async (path: string, title: string) => {
        return {
            url: `file://${path}`,
            playTitle: title,
            title,
            index: 0,
            source: '',
            sourceEps: []
        } as TVideoPlay
    }

    const playVideo = async (
        v: {
            title: string,
            source: string,
            ep: string,
            url: string,
            eps: { href: string, ep: string }[],
            index: number,
        },
    ) => {
        const { url, title, eps, index, source, ep } = v
        const vidUrl = await withErrBound(tvService.getVideoUrl(url),
            (res) => {
                if (!res) {
                    throw new Error('Something went wrong.')
                }
            })

        if (!vidUrl) {
            return
        }

        await setWatched({
            key: watchedKey(title, source),
            value: ep
        })

        return {
            url: vidUrl,
            playTitle: `${title} ${ep}`,
            title,
            index,
            source,
            sourceEps: eps
        } as TVideoPlay
    }

    const setWatched = async (data: { key: string, value: string }) => {
        const watchedStr = await AsyncStorage.getItem(data.key)
        let watched: Set<string>
        if (!watchedStr) {
            watched = new Set()
        } else {
            watched = JSON.parse(watchedStr)
            watched = new Set(watched)
        }
        watched.add(data.value)
        await AsyncStorage.setItem(data.key, JSON.stringify([...watched]))
    }

    const getWatched = async (key: string, vids: { ep: string, watched: boolean }[]) => {
        const watchedStr = await AsyncStorage.getItem(key)
        if (!watchedStr) {
            return
        }
        let watched = JSON.parse(watchedStr) as Set<string>
        watched = new Set(watched)
        for (const e of vids) {
            e.watched = watched.has(e.ep)
        }
    }

    const watchedKey = (title: string, source: string) => {
        return `${title}:${source}`
    }

    const getVideoDetail = async (v: TVideo) => {
        const source = await withErrBound(tvService.getVideoSources(v.href))
        if (!source) {
            return { ...v, source: {} } as TVideoWithSource
        }

        return { ...v, source } as TVideoWithSource
    }

    const searchVideo = async (keyword: string) => {
        const result = await withErrBound(tvService.getVideoSearchResult(keyword))
        if (!result) {
            return
        }

        setSearchVideos(result);
    }

    const loadFavourite = async () => {
        setFavouriteVideos([])

        const favouriteVideosStr = await AsyncStorage.getItem(provider)
        if (!favouriteVideosStr) {
            return
        }

        const favVids = JSON.parse(favouriteVideosStr) as (TVideo & { invalid: boolean })[]

        setFavouriteVideos(favVids)
        const promises = favVids.map(async (v) => {
            try {
                await tvService.updateVideoStatus(v)
            } catch (err) {
                v.invalid = true
            }
            return true
        })
        Promise.all(promises).then(async () => {
            const updatedFavVids = favVids.filter(v => !v.invalid)
            await AsyncStorage.setItem(provider, JSON.stringify(updatedFavVids))
            setFavouriteVideos(updatedFavVids)
        })
    }

    const saveFavourite = async (video: TVideo) => {
        const favVids: TVideo[] = [
            ...favouriteVideos,
            { href: video.href, img: video.img, title: video.title, status: video.status }
        ]

        await AsyncStorage.setItem(provider, JSON.stringify(favVids))
        setFavouriteVideos(favVids)
    }

    const removeFavourite = async (video: TVideo) => {
        const favVids = favouriteVideos.filter(v => v.href !== video.href)
        await AsyncStorage.setItem(provider, JSON.stringify(favVids))
        setFavouriteVideos(favVids)
    }

    const isFavourite = (video: { href: string }) => {
        return !!favouriteVideos.find(v => v.href === video.href)
    }

    return {
        state: {
            init,
            error,
            videos,
            loading,
            provider,
            searchVideos,
            favouriteVideos,
            providers: Object.keys(TVService),
        },

        actions: {
            watchedKey,
            getWatched,
            setError,
            getVideoUrl,
            playOfflineVideo,
            playVideo,
            searchVideo,
            setProvider,
            getVideoCategory,
            getVideoCategoryMore,
            getVideoDetail,
            saveFavourite,
            isFavourite,
            removeFavourite,
            refreshHomeList
        }
    } as const
}