import URLParse from 'url-parse';
import jssdk from '@htyf-mp/js-sdk';
import type { TVideoProvider } from '../types';
import jsCrawler, { host } from './index.umd.string';

// 视频项接口
interface VideoItem {
  href: string;
  img: string;
  title: string;
  status: string;
}

// 视频源接口
interface VideoSource {
  href: string;
  ep: string;
}

// 视频播放信息接口
interface VideoPlayInfo {
  url: string;
  headers: Record<string, string>;
}

// 视频详情接口
interface VideoDetail {
  [key: string]: VideoSource[];
}

// 搜索结果接口
interface SearchResult {
  page: number;
  list: VideoItem[];
}

// 首页视频列表接口
interface HomeVideoList {
  href: string;
  title: string;
  videos: VideoItem[];
}

/**
 * WebView 授权检查接口
 */
interface WebViewAuthResponse {
  items?: any[];
  [key: string]: any;
}

/**
 * 首页数据响应接口
 */
interface HomeDataResponse {
  items?: Array<{
    url: string;
    img: string;
    name: string;
  }>;
  [key: string]: any;
}

/**
 * 检查 WebView 是否已授权
 * 通过访问首页并检查返回数据来判断授权状态
 * @returns Promise<boolean> - 返回授权状态，true 表示已授权，false 表示未授权
 */
export const checkWebViewAuth = async (): Promise<boolean> => {
  try {
    const url = `${host}`;
    const data: WebViewAuthResponse = await jssdk.puppeteer({
      url,
      jscode: `${jsCrawler}`,
      debug: false, // 生产环境关闭调试
      wait: 1000, // 减少等待时间
      timeout: 1000 * 60 * 5, // 减少超时时间到5分钟
      callback: () => {},
    });
    return Array.isArray(data?.items) && data.items.length > 0;
  } catch (error) {
    console.error('WebView 授权检查失败:', error);
    return false;
  }
};

/**
 * 更新视频状态
 * @param video - 视频对象
 * @returns 更新后的视频对象
 */
export const updateVideoStatus: TVideoProvider['updateVideoStatus'] = async (video) => {
  return video;
};

/**
 * 获取视频搜索结果
 * @param keyword - 搜索关键词
 * @param page - 页码，默认为1
 * @returns 搜索结果，包含视频列表和页码信息
 */
export const getVideoSearchResult: TVideoProvider['getVideoSearchResult'] = async (
  keyword: string,
  page: number = 1
): Promise<SearchResult> => {
  try {
    const url = `${host}daoyongjiek0shibushiyoubing?q=${encodeURIComponent(keyword)}&f=_all&p=${page}`;
    const data = await jssdk.puppeteer({
      url,
      jscode: `${jsCrawler}`,
      debug: false,
      wait: 2000,
      timeout: 1000 * 10,
      callback: () => {},
    });

    const list: VideoItem[] = data?.items?.map((i: any) => ({
      href: i.url,
      img: i.img,
      title: i.name,
      status: '',
    })) || [];

    return {
      page,
      list,
    };
  } catch (error) {
    console.error('搜索视频失败:', error);
    return {
      page,
      list: [],
    };
  }
};

/**
 * 获取首页视频列表
 * 首先检查 WebView 授权状态，然后获取首页视频数据
 * @returns Promise<HomeVideoList[]> - 返回首页视频列表数据
 * @throws Error - 当未授权或获取数据失败时抛出错误
 */
export const getHomeVideoList: TVideoProvider['getHomeVideoList'] = async (): Promise<HomeVideoList[]> => {
  try {
    // 检查授权状态
    const isAuth = await checkWebViewAuth();
    if (!isAuth) {
      throw new Error('WebView 未授权，无法获取首页数据');
    }

    // 获取首页数据
    const data: HomeDataResponse = await jssdk.puppeteer({
      url: `${host}`,
      jscode: `${jsCrawler}`,
      debug: false,
      wait: 2000,
      timeout: 1000 * 10,
      callback: () => {},
    });

    // 处理返回数据
    const videos: VideoItem[] = Array.isArray(data?.items) 
      ? data.items.map((item) => ({
          href: item.url,
          img: item.img,
          title: item.name,
          status: '',
        }))
      : [];

    return [{
      href: '',
      title: '热门',
      videos,
    }];
  } catch (error) {
    console.error('获取首页视频列表失败:', error);
    // 返回空列表而不是抛出错误，保持接口稳定性
    return [{
      href: '',
      title: '热门',
      videos: [],
    }];
  }
};

/**
 * 获取视频分类列表
 * @returns 视频分类列表数据
 */
export const getVideoCategory: TVideoProvider['getVideoCategory'] = getHomeVideoList;

/**
 * 获取分类下的更多视频
 * @param path - 分类路径
 * @param page - 页码
 * @returns 分类下的视频列表
 */
export const getVideoCategoryMore: TVideoProvider['getVideoCategoryMore'] = async (
  path: string,
  page: number
): Promise<HomeVideoList> => {
  return {
    href: path,
    title: '',
    videos: [],
  };
};

/**
 * 视频详情响应接口
 */
interface VideoDetailResponse {
  playList?: Array<{
    url: string;
    name: string;
  }>;
  [key: string]: any;
}

/**
 * 获取视频详情和播放源
 * @param path - 视频路径
 * @returns Promise<VideoDetail> - 返回视频详情信息，包含播放源列表
 * @throws Error - 当获取数据失败时抛出错误
 */
export const getVideoSources: TVideoProvider['getVideoSources'] = async (path: string): Promise<VideoDetail> => {
  try {
    const urlObj = new URLParse(path, true);
    const data: VideoDetailResponse = await jssdk.puppeteer({
      url: urlObj.set('origin', host?.replace(/\/$/gi, '')).toString(),
      jscode: `${jsCrawler}`,
      debug: false,
      wait: 2000,
      timeout: 1000 * 30,
      callback: () => {},
    });

    // 处理播放源数据
    const sources: VideoSource[] = Array.isArray(data?.playList)
      ? data.playList.map((item) => ({
          href: item.url,
          ep: item.name,
        }))
      : [];

    return {
      source: sources,
    };
  } catch (error) {
    console.error('获取视频详情失败:', error);
    // 返回空播放源列表而不是抛出错误，保持接口稳定性
    return {
      source: [],
    };
  }
};

/**
 * 视频播放信息响应接口
 */
interface VideoPlayResponse {
  url?: string;
  name?: string;
  isIframe?: boolean;
  userAgent?: string;
  referer?: string;
  cookie?: string;
  headers?: {
    Host?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * 获取视频播放地址
 * @param path - 视频路径
 * @returns Promise<VideoPlayInfo> - 返回视频播放信息和请求头
 * @throws Error - 当无法获取播放地址时抛出错误
 */
export const getVideoUrl: TVideoProvider['getVideoUrl'] = async (path: string): Promise<VideoPlayInfo> => {
  try {
    const urlObj = new URLParse(path, true);
    const data: VideoPlayResponse = await jssdk.puppeteer({
      url: urlObj.set('origin', host?.replace(/\/$/gi, '')).toString(),
      jscode: `${jsCrawler}`,
      debug: false,
      wait: 2000,
      timeout: 1000 * 30,
      callback: () => {},
    });

    // 处理直接播放的情况
    if (!data.isIframe && data.url) {
      return {
        url: data.url,
        headers: {
          cookie: data.cookie || '',
          referer: data.referer || '',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          Origin: data.headers?.Host || urlObj.origin,
        },
      };
    }

    // 处理 iframe 播放的情况
    if (data.url) {
      const getHtml = async (htmUrl: string): Promise<string> => {
        try {
          const res = await fetch(htmUrl, {
            headers: {
              'content-type': 'text/html; charset=UTF-8',
              referer: host,
              'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
              'sec-ch-ua-mobile': '?0',
              'sec-ch-ua-platform': '"macOS"',
              'sec-fetch-dest': 'iframe',
              'sec-fetch-mode': 'navigate',
              'sec-fetch-site': 'cross-site',
            },
          });
          return res.text();
        } catch (error) {
          console.error('获取 iframe 内容失败:', error);
          return '';
        }
      };

      const iframeHtml = await getHtml(data.url);
      const htmlEncodeString = encodeURIComponent(iframeHtml);
      
      const iframeData: VideoPlayResponse = await jssdk.puppeteer({
        url: data.url,
        jscode: `function(callback) {
          try {
            if (!window.__global_document_write__) {
              var html = decodeURIComponent("${htmlEncodeString}");
              document.write(html);
              window.__global_document_write__ = true;
            }
          } catch (error) {
            console.error(error);
          }
          (${jsCrawler})(callback)
        }`,
        headers: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          referer: host,
          'sec-fetch-dest': 'iframe',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'cross-site',
        },
        debug: false,
        wait: 2000,
        timeout: 1000 * 30,
        callback: () => {},
      });

      return {
        url: iframeData.source || '',
        headers: {
          Host: URLParse(iframeData.url || '').host,
          'user-agent': iframeData.userAgent || '',
          Referer: iframeData.referer || '',
          Cookie: iframeData.cookie || '',
        },
      };
    }

    throw new Error('无法获取视频播放地址');
  } catch (error) {
    console.error('获取视频播放地址失败:', error);
    throw error;
  }
};