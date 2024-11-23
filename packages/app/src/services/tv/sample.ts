import type { TVideoProvider } from './types';
import jssdk from '@htyf-mp/js-sdk';
import jsCrawler, { host } from '@/utils/js-crawler';
import URLParse from 'url-parse';

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
    let data = await jssdk?.puppeteer({
        url: `${host}`,
        jscode: `${jsCrawler}`,
        debug: false,
        wait: 2000,
        timeout: 1000 * 10,
        callback: () => {},
    });
    return [
        {
            href: '', title: '热门', videos: data?.items?.map(i => {
                return {
                    href: i.url,
                    img: i.img,
                    title: i.title,
                    status: ''
                }
            })
        },
    ]
};
export const getVideoCategory: TVideoProvider['getVideoCategory'] = getHomeVideoList
export const getVideoCategoryMore: TVideoProvider['getVideoCategoryMore'] = async (path, page) => {
    return { href: path, title: '', videos: [] }
}

export const getVideoSources: TVideoProvider['getVideoSources'] = async (path) => {
    const urlObj = new URLParse(path, true);
    console.log(urlObj)
    const data = await jssdk?.puppeteer({
        url: urlObj.set('origin', host?.replace(/\/$/gi, '')).toString(),
        jscode: `${jsCrawler}`,
        debug: false,
        wait: 2000,
        timeout: 1000 * 30,
        callback: () => {},
    });
    
    return {
        'source 1': data?.playList?.map(i => {
            return {
                href: i.url,
                ep: i.name,
            }
        }),
    }
}

export const getVideoUrl: TVideoProvider['getVideoUrl'] = async (path: string) => {
    const urlObj = new URLParse(path, true);
    const data = await jssdk?.puppeteer({
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
        const iframeData = await jssdk?.puppeteer({
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
    const __headers__ = encodeURI(JSON.stringify({
        // ...(item.headers || {}),
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Origin': item?.headers?.Host || `${urlObj.origin}`,
    }));
    const sourceObj = URLParse(item.source, true);
    sourceObj.set('query', {
        ...sourceObj.query,
        __headers__: __headers__,
    })
    return sourceObj.toString();
}