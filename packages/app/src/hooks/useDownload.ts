import React, { useEffect, useReducer, useRef, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob, { FetchBlobResponse, StatefulPromise } from "react-native-blob-util";

import { i18n } from "../../i18n";
import { Enc, VIDEO_EXT, loadVideoChunks } from '../utils/m3u8'

type DownloadTaskHandler<T> = (item: string, taskGroupName: string, taskName: string, id: number, singleUpdate: boolean) => Promise<T>

export type TDownloadContext = ReturnType<typeof useDownload>
export const DownloadContext = React.createContext<TDownloadContext>({} as TDownloadContext);
export const useDownloadContext = () => React.useContext(DownloadContext);

export type Download = {
    name: string
    ep: string
    href: string
    provider: string
    webview?: boolean
    // download is considered done once path is defined
    path?: string
    failed?: boolean
}
export type DownloadList = Record<string, Download>

const WIFI_KEY = 'wifi'
const AUTO_DOWNLOAD_KEY = 'auto'
const DOWNLOAD_KEY = 'download'
const FETCH_BLOB = RNFetchBlob
const FS = RNFetchBlob.fs
const DOWNLOAD_DIR = FS.dirs.DownloadDir

enum DownloadListActionType {
    NEW,
    COMPLETE,
    DELETE,
    MISSING,
    FAILED
}
type NewDownloadListAction = { type: DownloadListActionType.NEW, payload: DownloadList }
type CompleteDownloadListAction = { type: DownloadListActionType.COMPLETE, payload: { href: string, path: string } }
type DeleteDownloadListAction = { type: DownloadListActionType.DELETE, payload: string[] }
type MissingDownloadListAction = { type: DownloadListActionType.MISSING, payload: string }
type FailedDownloadListAction = { type: DownloadListActionType.FAILED, payload: string }
type DownloadListAction =
    | NewDownloadListAction
    | CompleteDownloadListAction
    | DeleteDownloadListAction
    | MissingDownloadListAction
    | FailedDownloadListAction

const downloadListReducer = (state: DownloadList, action: DownloadListAction): DownloadList => {
    switch (action.type) {
        case DownloadListActionType.NEW: {
            return {
                ...action.payload,
                ...state,
            };
        }

        case DownloadListActionType.COMPLETE: {
            return {
                ...state,
                [action.payload.href]: {
                    ...state[action.payload.href],
                    path: action.payload.path
                }
            };
        }

        case DownloadListActionType.DELETE: {
            const stateClone = JSON.parse(JSON.stringify(state))
            for (const d of action.payload) {
                delete stateClone[d]
            }
            return stateClone
        }

        case DownloadListActionType.MISSING: {
            return {
                ...state,
                [action.payload]: {
                    ...state[action.payload],
                    path: undefined
                }
            };
        }

        case DownloadListActionType.FAILED: {
            return {
                ...state,
                [action.payload]: {
                    ...state[action.payload],
                    failed: true
                }
            };
        }

    }
}

type Props = {
    getVideoUrl: (url: string, provider: string) => Promise<string | undefined>
    decrypt: (enc: Enc, encryptedBytes: string) => Promise<string>
}

export const useDownload = (props: Props) => {

    const [downloadList, dispatch] = useReducer(downloadListReducer, {} as DownloadList)
    const [wifiOnly, setWifiOnly] = useState(true)
    const [autoDownload, setAutoDownload] = useState(false)
    const [downloading, setDownloading] = useState('')
    const [progress, setProgress] = useState('')
    const [storage, setStorage] = useState('')

    const tasksRef = useRef<(StatefulPromise<FetchBlobResponse> | null)[]>([])
    const pauseCh = useRef<((_: unknown) => void) | null>(null)
    const mountedRef = useRef(false)

    useEffect(() => {
        (async () => {
            await updateStorage()

            const wifiStr = await AsyncStorage.getItem(WIFI_KEY)
            if (wifiStr === 'false') {
                setWifiOnly(false)
            }

            const autoDownloadStr = await AsyncStorage.getItem(AUTO_DOWNLOAD_KEY)
            const autoDownload = autoDownloadStr === 'true'
            if (autoDownload) {
                setAutoDownload(true)
            }

            const existingDownloadsStr = await AsyncStorage.getItem(DOWNLOAD_KEY)
            if (existingDownloadsStr) {
                const existingDownloads: DownloadList = JSON.parse(existingDownloadsStr)
                dispatch({ type: DownloadListActionType.NEW, payload: existingDownloads })
            }
            mountedRef.current = true
        })()
    }, [])

    useEffect(() => {
        if (!mountedRef.current) {
            return
        }
        (async () => {
            const downloadListStr = JSON.stringify(downloadList)
            await AsyncStorage.setItem(DOWNLOAD_KEY, downloadListStr)
            if (!downloading && !pauseCh.current && autoDownload) {
                const keys = Object.keys(downloadList)
                const nextDownloadKey = keys.find(k => {
                    return !downloadList[k].path
                })

                if (nextDownloadKey) {
                    startDownload({ ...downloadList[nextDownloadKey] })
                }
            }
        })()
    }, [downloadList, autoDownload])

    const updateStorage = async () => {
        const groupStats = await FS.lstat(DOWNLOAD_DIR)
        let size = 0
        for (const stats of groupStats) {
            const stat = await FS.lstat(stats.path)
            for (const s of stat) {
                size += +s.size
            }
        }

        let unit = 'MB'
        size /= (1024 * 1024)
        if (size > 1000) {
            size /= 1024
            unit = 'GB'
        }

        setStorage(`${size.toFixed(2)} ${unit}`)
    }

    const startTasks = async<T = any>(
        taskGroupName: string,
        taskName: string,
        taskList: string[],
        taskHandlePromise: DownloadTaskHandler<T>,
        updateFunc: (completed: number, total: number) => void,
        limit = 3
    ) => {
        const results: T[] = []

        let total = taskList.length
        let completed = 0

        const _runTask = async (arr: {
            t: string;
            id: number;
        }[]): Promise<any> => {

            const item = arr.shift()
            if (!item) {
                return
            }

            try {
                const r = await taskHandlePromise(item.t, taskGroupName, taskName, item.id, total === 1)
                results[item.id] = r
                completed++
                updateFunc(completed, total)
                if (arr.length !== 0 && !pauseCh.current) {
                    return _runTask(arr);
                }

            } catch (err) {
                if (pauseCh.current) {
                    return
                }
                arr.push(item);
                return _runTask(arr);
            }
        };

        const idTaskList = taskList.map((t, idx) => ({
            t,
            id: idx
        }))

        const asyncTaskList: Promise<string>[] = [];
        let thread = Math.min(limit, idTaskList.length)
        while (thread > 0) {
            asyncTaskList.push(_runTask(idTaskList));
            thread--;
        }

        await Promise.all(asyncTaskList);

        return results
    };

    const mergeFiles = async (dirname: string, videoname: string, files: string[]) => {
        console.log('merging...')
        setProgress(i18n.t('processingFiles') + '...')

        const outFile = `${DOWNLOAD_DIR}/${dirname}/${videoname}${VIDEO_EXT}`
        const exist = await FS.exists(outFile)
        if (exist) {
            await FS.unlink(outFile)
        }

        for (const f of files) {
            await FS.appendFile(outFile, f, 'uri')
        }

        await FS.unlink(`${DOWNLOAD_DIR}/${dirname}/${videoname}`)

        console.log('done.')
        return outFile
    }

    const downloadVideoFile = (enc: Enc): DownloadTaskHandler<string> => async (url, dirname, videoname, id, singleUpdate) => {
        const dir = DOWNLOAD_DIR + `/${dirname}/${videoname}`
        const path = dir + `/${id}${VIDEO_EXT}`
        const exist = await FS.exists(path)
        if (exist) {
            return path
        }

        const task = FETCH_BLOB
            .config({
                wifiOnly: wifiOnly,
                // save to path directly when file is not encrypted
                path: !enc ? path : undefined,
            })
            .fetch("GET", url, {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            })
            .progress((completed, total) => {
                // console.log('prog:', received, total)
                if (singleUpdate) {
                    setProgress(`${i18n.t('downloading')}... ${(+completed / +total * 100).toFixed(2)}%`)
                }
            })

        tasksRef.current[id] = task
        return task.then(async (res) => {
            if (enc) {
                // decrypt and save the decrypted content to file
                const decrypted = await props.decrypt(enc, res.base64())
                try {
                    // avoid directory not exists error
                    await FS.mkdir(dir)
                } catch { }
                return FS.createFile(path, decrypted, 'base64').then(() => {
                    tasksRef.current[id] = null
                    return path
                })
            } else {
                tasksRef.current[id] = null
                return res.path()
            }
        })
    }

    const downloadFailed = (d: Download) => {
        dispatch({ type: DownloadListActionType.FAILED, payload: d.href })
        setProgress(i18n.t('failed'))
        setDownloading('')
    }

    const startDownload = async (d?: Download, manual = false) => {
        if (!d) {
            console.log('no download')
            return
        }

        if (manual && downloading) {
            // pause current download if another download is started manually 
            await pauseDownload()
        }

        setProgress(i18n.t('connecting') + '...')
        setDownloading(d.href)

        try {
            let vidUrl: string
            if (d.webview) {
                vidUrl = d.href
            } else {
                vidUrl = await props.getVideoUrl(d.href, d.provider) || ''
            }

            if (!vidUrl) {
                downloadFailed(d)
                return
            }
            const [videoChunks, enc] = await loadVideoChunks(vidUrl)
            if (videoChunks.length === 0) {
                // failed to get chunks, probably some weird extension
                downloadFailed(d)
                return
            }

            const videoName = `${d.name} ${d.ep}`

            const downloadTaskHandler = downloadVideoFile(enc)
            const files = await startTasks(
                d.name,
                videoName,
                videoChunks,
                downloadTaskHandler,
                (completed, total) => {
                    setProgress(`${i18n.t('downloading')}... ${(completed / total * 100).toFixed(2)}%`)
                    // console.log("Progress: ", videoName, (completed / total * 100).toFixed(2))
                },
                enc ? 1 : 5
            )

            if (releasePause()) {
                return
            }

            const path = await mergeFiles(d.name, videoName, files)
            d.path = path
            await updateStorage()
            setDownloading('')
            dispatch({ type: DownloadListActionType.COMPLETE, payload: { href: d.href, path: d.path! } })
            releasePause()
        } catch (err) {
            downloadFailed(d)
            console.error(err)
        }
    }

    const releasePause = () => {
        if (pauseCh.current) {
            pauseCh.current(true)
            pauseCh.current = null
            return true
        }
        return false
    }

    const addDownloads = async (downloads: Download[]) => {
        if (downloads.length === 0) {
            return
        }

        const incomingDownloadList: DownloadList = {}
        for (const d of downloads) {
            incomingDownloadList[d.href] = d
        }

        dispatch({ type: DownloadListActionType.NEW, payload: incomingDownloadList })
        return true
    }

    const pauseDownload = async () => {
        if (pauseCh.current) {
            // can't have multiple pause
            return
        }

        console.log('pause')
        const wait = new Promise((res) => {
            pauseCh.current = res
        })

        for (const t of tasksRef.current) {
            if (t) {
                await t.cancel()
            }
        }

        tasksRef.current = []
        await wait
        setDownloading('')
        console.log('pause ok')
    }

    const deleteDownload = async (dl: DownloadList) => {
        const keys = Object.keys(dl)
        const deleteDownloading = keys.find(k => {
            return downloadList[k].href === downloading
        })

        if (deleteDownloading) {
            // make sure the downloading has been paused before delete
            await pauseDownload()
        }

        for (const k of keys) {
            const d = downloadList[k]
            try {
                if (d.path) {
                    // delete video file
                    await FS.unlink(d.path)
                } else {
                    // delete video chunks
                    const chunksDir = DOWNLOAD_DIR + `/${d.name} ${d.ep}`
                    const chunksExist = await FS.exists(chunksDir)
                    if (chunksExist) {
                        await FS.unlink(chunksDir)
                    }
                }
            } catch (err) {
                console.error('error remove files:', err)
            }
        }
        await updateStorage()
        dispatch({ type: DownloadListActionType.DELETE, payload: keys })
    }

    const clearStorage = async () => {
        if (downloading) {
            await pauseDownload()
        }
        dispatch({ type: DownloadListActionType.DELETE, payload: Object.keys(downloadList) })
        await FS.unlink(DOWNLOAD_DIR)
        await FS.mkdir(DOWNLOAD_DIR)
        await updateStorage()
    }

    const checkDownloadExist = async (d: Download) => {
        if (!d.path) {
            return false
        }
        return await FS.exists(d.path)
    }

    const markDownloadMissing = async (d: Download) => {
        dispatch({ type: DownloadListActionType.MISSING, payload: d.href })
    }

    const toggleWifiOnly = async () => {
        setWifiOnly(w => !w)
        await AsyncStorage.setItem(WIFI_KEY, `${!wifiOnly}`)
    }

    const toggleAutoDownload = async () => {
        setAutoDownload(w => !w)
        await AsyncStorage.setItem(AUTO_DOWNLOAD_KEY, `${!autoDownload}`)
    }

    return {
        state: {
            storage,
            downloading,
            progress,
            downloadList,
            wifiOnly,
            autoDownload
        },

        actions: {
            addDownloads,
            startDownload,
            pauseDownload,
            clearStorage,
            deleteDownload,
            checkDownloadExist,
            markDownloadMissing,
            toggleWifiOnly,
            toggleAutoDownload
        }
    }
}