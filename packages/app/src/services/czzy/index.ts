import type { TVideoProvider } from '../types';

export const updateVideoStatus: TVideoProvider['updateVideoStatus'] = async (video) => {
    return video
}

export const getVideoSearchResult: TVideoProvider['getVideoSearchResult'] = async (keyword) => {
    return [
        { href: '', img: '', title: 'search 1', status: 'status 1' },
        { href: '', img: '', title: 'search 2', status: 'status 2' },
        { href: '', img: '', title: 'search 3', status: 'status 3' },
    ]
}

export const getHomeVideoList: TVideoProvider['getHomeVideoList'] = async () => {
    return [
        {
            href: 'movie', title: 'movie', videos: [
                { href: '', img: '', title: 'movie 1', status: 'status 1' },
                { href: '', img: '', title: 'movie 2', status: 'status 2' },
                { href: '', img: '', title: 'movie 3', status: 'status 3' }
            ]
        },
        {
            href: 'drama', title: 'drama', videos: [
                { href: '', img: '', title: 'drama 1', status: 'status 1' },
                { href: '', img: '', title: 'drama 2', status: 'status 2' },
            ]
        }
    ]
};
export const getVideoCategory: TVideoProvider['getVideoCategory'] = getHomeVideoList
export const getVideoCategoryMore: TVideoProvider['getVideoCategoryMore'] = async (path, page) => {
    return { href: path, title: '', videos: [] }
}

export const getVideoSources: TVideoProvider['getVideoSources'] = async (path) => {
    return {
        'source 1': [
            { href: '', ep: 'ep 1' },
            { href: '', ep: 'ep 2' },
            { href: '', ep: 'ep 3' },
        ],
        'source 2': [
            { href: '', ep: 'ep 1' }
        ]
    }
}

export const getVideoUrl: TVideoProvider['getVideoUrl'] = async (path: string) => {
    return 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
}