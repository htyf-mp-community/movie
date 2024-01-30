import { View, Text, Image, ScrollView, Button, Video } from '@tarojs/components'
import './index.scss'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AudioItem, BookItem, UIProvider, setAduioData, setHistoryData, setHomeData, useAppSelector, useDispatch, useUI } from '@/_UIHOOKS_';
import lodash from 'lodash';
import { useImmer } from 'use-immer';
import Player, { PlayRef } from './utils'
import URLParse from 'url-parse';
import jsCrawler, { host } from '@/utils/js-crawler';
import delay from 'delay';

function Index(props: {url: string, bookUrl: string}) {
  const ui = useUI();
  const apps = useAppSelector(i => i.apps);
  const isDebug = apps?.__ENV__ === 'DEV';
  const bookUrl = `${props.bookUrl}`;
  const url = `${props.url}`;
  const db = useAppSelector(i => i.apps?.db);
  const audios = useAppSelector(i => i.apps?.audios);
  const dispatch = useDispatch();
  const playRef = useRef<PlayRef>();
  const [loading, setLoading] = useState(false)
  const [nextList, setNextList] = useImmer([])


  const bookInfo = useMemo(() => {
    const urlObj = URLParse(bookUrl, true)
    const pathname = urlObj.pathname;
    return lodash.get(db, `${pathname}`, undefined)
  }, [db, bookUrl]) as BookItem

  const jscode = `${jsCrawler}`;

  const getData = useCallback(async (url: string, hasPlay: boolean = false): Promise<any> => {
    return new Promise(async (resolve) => {
      if (!url) {
        resolve('')
        return;
      }
      if (global['__GLOBAL_MINI_APP_SDK__']) { 
        ui.showToast({
          content: '加载视频信息中...'
        })
        setLoading(true)
        const urlObj = new URLParse(url, true);
        const data = await global['__GLOBAL_MINI_APP_SDK__']?.puppeteer({
          url: urlObj.set('origin', host?.replace(/\/$/gi, '')).toString(),
          jscode: `${jsCrawler}`,
          debug: isDebug,
          wait: 2000,
          timeout: 1000 * 30,
        })
        const item = {
          time: Date.now(),
          url: url,
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
        } else {
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
          const iframeOright = URLParse(data.url).origin;
          let iframeHtml = await getHtml(data.url);
          iframeHtml = `${iframeHtml}`.replace(/src="\/\//gi, `src="https://`).replace(/src="\//gi, `src="${iframeOright}/`)
          const res = await getIframData(data.url, iframeHtml, {
            "referer": `${host}`,
            "sec-fetch-dest": `iframe`,
            "sec-fetch-mode": `navigate`,
            "sec-fetch-site": `cross-site`,
          })
         
          item['source'] = res?.source;
          item['headers'] = {
            ...(item['headers'] || {}),
            Host: URLParse(res?.url).host,
            "user-agent": res?.userAgent,
            Referer: res?.referer,
            Cookie: res?.cookie,
          };
        }
        dispatch(setAduioData(item))
        resolve(item)
        if (hasPlay && item.source) {
          console.error('xxxxxx', item.source)
          await playRef.current?.play({
            url: item.source,
            title: item.name,
            artist: `test`,
            artwork: `${bookInfo?.img}`,
            duration: 143,
            userAgent: data.userAgent,
            headers: {
              ...(item?.headers || {}),
            },
            onPlayEnd: () => {
              const list = lodash.cloneDeep(bookInfo?.playList || [])
              const index = list.findIndex(i => i.url === url)
              const nextObj = lodash.get(list, `${index+1}`, {})
              if (nextObj.url) {
                getData(nextObj.url, true)
                dispatch(setHistoryData({
                  url: bookUrl,
                  playUrl: nextObj.url,
                  time: Date.now(),
                }))
              }
              console.error('jjjjj', list, index, nextObj)
            },
            onPlayError: () => {

            }
          })
          // if (bookInfo?.playList && bookInfo?.playList?.length) {
          //   for (const key in book Info?.playList) {
          //     if (isShow.current) {
          //       const element = bookInfo?.playList[key];
          //       await getData(element.url)
          //     }
          //   }
          // }
        }
        ui.hideToast()
      }
    })
  }, [bookInfo, props, isDebug])

  const getIframData = useCallback(async (url: string, html: string, headers?: {[key: string]: string;}): Promise<any> => {
    return new Promise(async (resolve) => {
      if (!url) {
        resolve('')
        return;
      }
      if (global['__GLOBAL_MINI_APP_SDK__']) {
        setLoading(true)
        const htmlEncodeString = encodeURIComponent(`${html}`)
        const data = await global['__GLOBAL_MINI_APP_SDK__']?.puppeteer({
          url: `${url}`,
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
            (${jscode})(callback)
          }`,
          headers: {
            'userAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ...(headers || {}),
          },
          debug: isDebug,
          wait: 2000,
          timeout: 1000 * 30,
        })
        resolve({
          source: data?.url,
        })
      }
    })
  }, [bookInfo, props, isDebug])

  useEffect(() => {
    if (url) {
      getData(url, true);
    } 
  }, [url])
  if (!url) {
    return undefined
  }
  return (
    <View className='pages-downlist-player-wrap'>
     <Player ref={playRef} />
    </View>
  )
}

export default (props: any) => <UIProvider><Index {...props}/></UIProvider>