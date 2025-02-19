import URLParse from 'url-parse';
import jssdk from '@htyf-mp/js-sdk';
import type { TVideoProvider } from '../types';
import jsCrawler, { host } from '@js-crawler/movie/dist/index.umd.string';

export const updateVideoStatus: TVideoProvider['updateVideoStatus'] = async (video) => {
  return video
}
/**
 * 获取搜索数据
 * @param keyword 
 * @returns 
 */
export const getVideoSearchResult: TVideoProvider['getVideoSearchResult'] = async (keyword, page) => {
  const url = `${host}daoyongjiek0shibushiyoubing?q=${keyword}&f=_all&p=${page || 1}`;
  const data = await jssdk.puppeteer({
    url: url,
    jscode: `${jsCrawler}`,
    debug: false,
    wait: 2000,
    timeout: 1000 * 10,
    callback: () => {},
  });
  const list = data?.items?.map(i => {
    return {
      href: i.url,
      img: i.img,
      title: i.name,
      status: ''
    }
  })
  return {
    page: page || 1,
    list: list,
  }
}

/**
 * 获取首页数据
 * @returns 
 */
export const getHomeVideoList: TVideoProvider['getHomeVideoList'] = async () => {
  let data = await jssdk.puppeteer({
    url: `${host}`,
    jscode: `${jsCrawler}`,
    debug: false,
    wait: 2000,
    timeout: 1000 * 10,
    callback: () => {},
  });
  return [
    {
      href: '', 
      title: '热门',
      videos: data?.items?.map(i => {
        return {
          href: i.url,
          img: i.img,
          title: i.name,
          status: ''
        }
      })
    },
  ]
};

/**
 * 获取分类列表数据
 */
export const getVideoCategory: TVideoProvider['getVideoCategory'] = getHomeVideoList

/**
 * 获取分类列表数据
 * @param path 
 * @param page 
 * @returns 
 */
export const getVideoCategoryMore: TVideoProvider['getVideoCategoryMore'] = async (path, page) => {
  return { href: path, title: '', videos: [] }
}

/**
 * 获取视频详情
 * @param path 
 * @returns 
 */
export const getVideoSources: TVideoProvider['getVideoSources'] = async (path) => {
  const urlObj = new URLParse(path, true);
  console.log(urlObj)
  const data = await jssdk.puppeteer({
    url: urlObj.set('origin', host?.replace(/\/$/gi, '')).toString(),
    jscode: `${jsCrawler}`,
    debug: false,
    wait: 2000,
    timeout: 1000 * 30,
    callback: () => {},
  });
  
  return {
    'source': data?.playList?.map(i => {
      return {
        href: i.url,
        ep: i.name,
      }
    }),
  }
}
/**
 * 获取播放地址
 * @param path 
 * @returns 
 */
export const getVideoUrl: TVideoProvider['getVideoUrl'] = async (path: string) => {
  const urlObj = new URLParse(path, true);
  const data = await jssdk.puppeteer({
    url: urlObj.set('origin', host?.replace(/\/$/gi, '')).toString(),
    jscode: `${jsCrawler}`,
    debug: false,
    wait: 2000,
    timeout: 1000 * 30,
    callback: () => {}
  })
  const item = {
    time: Date.now(),
    url: path,
    name: data?.name,
    source: data.isIframe ? '' : data?.url,
    file: '',
    headers: {
      Host: URLParse(data?.url).host,
      "user-agent": data?.userAgent,
      Referer: data?.referer,
      Cookie: data?.cookie,
    },
  }
  if (!data.isIframe && data.url) {
  // playback();
  } else if (data.url) {
    const getHtml = (htmUrl: string): Promise<string> => {
      return new Promise(async (resolve, reject) => {
        try {
          const res = await fetch(htmUrl, {
            headers: {
              "content-type": "text/html; charset=UTF-8",
              "referer": `${host}`,
              "sec-ch-ua": `"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"`,
              "sec-ch-ua-mobile": `?0`,
              "sec-ch-ua-platform": `"macOS"`,
              "sec-fetch-dest": `iframe`,
              "sec-fetch-mode": `navigate`,
              "sec-fetch-site": `cross-site`,
            }
          })
          resolve(res.text())
        } catch (error) {
          reject(error)
        }
      })
    }
    let iframeHtml = await getHtml(data.url);
    const htmlEncodeString = encodeURIComponent(`${iframeHtml}`)
    const iframeData = await jssdk.puppeteer({
      url: `${data.url}`,
      jscode: `function(callback) {
        try {
          if (!window.__global_document_write__) {
            var html = decodeURIComponent("${htmlEncodeString}");
            document.write(html);
            window.__global_document_write__ = true;
          }
        } catch (error) {
          alert(error)  
        }
        (${jsCrawler})(callback)
      }`,
      headers: {
        'userAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...({
            "referer": `${host}`,
            "sec-fetch-dest": `iframe`,
            "sec-fetch-mode": `navigate`,
            "sec-fetch-site": `cross-site`,
        }),
      },
      debug: false,
      wait: 2000,
      timeout: 1000 * 30,
      callback: () => {}
    })
    item['source'] = iframeData?.source;
    item['headers'] = {
      ...(item['headers'] || {}),
      Host: URLParse(iframeData?.url).host,
      "user-agent": iframeData?.userAgent,
      Referer: iframeData?.referer,
      Cookie: iframeData?.cookie,
    };
  }
  console.error(data)
  const headers = {
    'cookie': data?.cookie,
    'referer': data?.referer,
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Origin': data?.headers?.Host || `${urlObj.origin}`,
  }
  return {
    url: data.url,
    headers: headers,
  }
}