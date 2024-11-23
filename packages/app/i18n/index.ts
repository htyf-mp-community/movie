import { I18n } from "i18n-js";
import { NativeModules } from 'react-native'

// For Android
const locale = 'zh'

type Translation = {
    search: string
    searchResult: string
    more: string
    nextEp: string
    fav: string
    addFav: string
    ok: string
    cancel: string
    exitTitle: string
    exitMsg: string
    downloads: string
    download: string
    wifiOnly: string
    autoDownload: string
    noItemsFound: string
    noVideoDownloaded: string
    explore: string
    downloadPaused: string
    storageUsed: string
    clearStorage: string
    allItemDelete: string
    selectItems: string
    selected: string
    all: string
    delete: string
    deleteDownload: string
    itemsWillBeDeleted: string
    processingFiles: string
    failed: string
    connecting: string
    downloading: string
    home: string
    web: string
    library: string
    loadMedia: string
}

const en: Translation = {
    search: 'Search',
    searchResult: 'Search Result',
    more: 'More',
    nextEp: 'Next Ep',
    fav: 'Fav',
    addFav: 'Add Fav',
    ok: 'OK',
    cancel: 'Cancel',
    exitTitle: 'Hold on!',
    exitMsg: 'Are you sure you want to go back?',
    downloads: 'Downloads',
    download: 'Download',
    wifiOnly: 'Wi-Fi Only',
    autoDownload: 'Auto Download',
    noItemsFound: 'No items found',
    noVideoDownloaded: "Looks like you haven't download any video yet",
    explore: 'Explore',
    downloadPaused: 'Download paused',
    storageUsed: 'Storage Used',
    clearStorage: 'Clear storage',
    allItemDelete: 'All item(s) will be deleted.',
    selectItems: 'Select items',
    selected: 'selected',
    all: 'All',
    delete: 'Delete',
    deleteDownload: 'Delete Download?',
    itemsWillBeDeleted: 'item(s) will be deleted.',
    processingFiles: 'Processing files',
    failed: 'Failed',
    connecting: 'Connecting',
    downloading: 'Downloading',
    home: 'Home',
    web: 'Web',
    library: 'Library',
    loadMedia: 'Load Media'
};

const zh: Translation = {
    search: '搜索',
    searchResult: '搜索结果',
    more: '更多',
    nextEp: '下集',
    fav: '最爱',
    addFav: '加入最爱',
    ok: '确定',
    cancel: '取消',
    exitTitle: '稍等!',
    exitMsg: '是否退出程序?',
    downloads: '下载列表',
    download: '下载',
    wifiOnly: "仅限 Wi-Fi",
    autoDownload: '自动下载',
    noItemsFound: '未找到任何项目',
    noVideoDownloaded: "您似乎还没有下载任何视频",
    explore: '探索',
    downloadPaused: '下载已暂停',
    storageUsed: '已用存储',
    clearStorage: '清除存储',
    allItemDelete: '所有项目都将被删除.',
    selectItems: '选择项目',
    selected: '已选择',
    all: '全部',
    delete: '删除',
    deleteDownload: '删除下载?',
    itemsWillBeDeleted: '项目将会删除.',
    processingFiles: '处理文件',
    failed: '失败',
    connecting: '连接中',
    downloading: '下载中',
    home: '主页',
    web: '游览器',
    library: '媒体库',
    loadMedia: '加载媒体'
};

export const i18n = new I18n({
    en,
    zh,
});

// fallback to defaultLocale if translation does not exist for current locale
i18n.enableFallback = true;
i18n.defaultLocale = "en";
i18n.locale = locale