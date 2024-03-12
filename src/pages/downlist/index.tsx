import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import Taro, { useDidShow, useLoad, useRouter } from '@tarojs/taro'
import './index.scss'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookItem, UIProvider, navigate, setDBData, setHistoryData, setHomeData, useAppSelector, useDispatch, useUI } from '@/_UIHOOKS_';
import {  Header, } from '@/_UIHOOKS_/components';
import lodash from 'lodash';
import jsCrawler, { host } from '@/utils/js-crawler';
import URLParse from 'url-parse';
import classNames from 'classnames';

import Player from './Player'
import delay from 'delay';
import Item from '@/component/Item';
import jssdk from '@htyf-mp/js-sdk'

function Index() {
  const ui = useUI();
  const router = useRouter();
  const params = router.params;
  const apps = useAppSelector(i => i.apps);
  const isDebug = apps?.__ENV__ === 'DEV';
  const url = decodeURIComponent(`${params.url}`);
  const db = useAppSelector(i => i.apps?.db || {});
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [playUrl, setPlayUrl] = useState<string | undefined>()

  const bookInfo = useMemo(() => {
    const urlObj = URLParse(url, true)
    const pathname = urlObj.pathname;
    return lodash.get(db, `${pathname}`, undefined)
  }, [db, url]) as BookItem

  const getData = useCallback(async () => {
    return new Promise(async (resolve) => {
      if (!url) {
        return;
      }
      if (jssdk) {
        ui.showToast({
          content: '加载数据中...'
        })
        setLoading(true)
        const urlObj = new URLParse(url, true);
        const data = await jssdk?.puppeteer({
          url: urlObj.set('origin', host?.replace(/\/$/gi, '')).toString(),
          jscode: `${jsCrawler}`,
          debug: isDebug,
          wait: 2000,
          timeout: 1000 * 30,
          callback: () => {},
        })
        resolve(data)
        console.error(data)
        if (data?.playList?.length) {
          dispatch(setDBData({
            ...data,
            url: url
          }))
        }
        ui.hideToast();
        setLoading(false)
      }
    })
  }, [params, isDebug])

  const init = useCallback(lodash.debounce(() => {
    getData();
  }, 0), [params])

  useEffect(() => {
    init();
  }, [])
  
  const list = useMemo(() => {
    return lodash.cloneDeep(bookInfo?.playList || []).splice(0, 100 * page)
  }, [page, bookInfo])

  const historyInfo = useMemo(() => {
    return lodash.get(apps?.history, `${url}`, undefined)
  }, [apps?.history, url])

  return (
    <View className='pages-downlist-wrap'>
      <Header 
        backIcon="white"
        title={<Text style={{color: '#fff'}}>详情</Text>}
        style={{
          backgroundColor: '#222222'
        }}
      />
      <View className='pages-downlist-body-wrap'>
        <ScrollView
          className='pages-downlist-scroll-view'
          scrollY
          onRefresherRefresh={() => {
            getData();
          }}
          onScrollToLower={lodash.debounce(() => {
            setPage((_page) => {
              return _page+1
            })
          }, 500)}
        >
          <View
            className='pages-downlist-scroll-body'
          >
            <View className='pages-downlist-book-info-wrap'>
              <View className='pages-downlist-book-info-header'>
                <View className='pages-downlist-book-info-left'>
                  <Item key={url} item={bookInfo} hideTitle />
                </View>
                <View className='pages-downlist-book-info-right'>
                  <View className='pages-downlist-book-info-name-wrap'>
                    <Text numberOfLines={1} className='pages-downlist-book-info-name-text'>{bookInfo?.name}</Text>
                  </View>
                  <View className='pages-downlist-book-moviedteail-wrap'>
                    {
                      bookInfo?.moviedteail_list?.map((item) => {
                        const v = item?.value?.join();
                        if (!v) {
                          return undefined;
                        }
                        return <View key={item.label} className='pages-downlist-book-info-moviedteail-list-wrap'>
                          <Text numberOfLines={2} className='pages-downlist-book-moviedteail-text'>{item.label} {item?.value?.join(', ') || '---'}</Text>
                        </View>
                      })
                    }
                  </View>
                </View>
              </View>
              <View className='pages-downlist-book-info-context-wrap'>
                <View>
                  <Text className='pages-downlist-box-title'>简介</Text>
                </View>
                <View>
                  <Text className='pages-downlist-yp-context'>
                    {bookInfo?.yp_context}
                  </Text>
                </View>
              </View>
            </View>
            <View className='pages-downlist-play-list-wrap'>
              <View className='pages-downlist-play-list-header'>
                <View>
                  <Text className='pages-downlist-box-title'>
                    播放列表
                  </Text>
                </View>
              </View>
              <View className='paegs-downlist-play-items-wrap'>
                {
                  list?.map((item) => {
                    const itemUrlObj = new URLParse(`${item.url}`)
                    const hisUrlObj = new URLParse(`${historyInfo?.playUrl}`)
                    const hisBtn = itemUrlObj.pathname === hisUrlObj.pathname
                    return <View 
                      key={item.url}
                      className={classNames('paegs-downlist-play-item-wrap', hisBtn ? 'paegs-downlist-play-item-wrap-on' : '')}
                      onClick={async () => {
                        dispatch(setHistoryData({
                          url: url,
                          playUrl: item.url,
                          time: Date.now(),
                        }))
                        setPlayUrl(undefined)
                        await delay(300)
                        setPlayUrl(`${item.url}`);
                      }}
                    >
                      <View
                        className='paegs-downlist-play-item-name-wrap'
                      >
                        <Text
                          numberOfLines={1}
                          className={classNames('paegs-downlist-play-item-name', hisBtn ? 'paegs-downlist-play-item-name-on' : '')}
                        >
                          {item.name}
                        </Text>
                      </View>
                    </View>
                  })
                }
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
      {
        playUrl && <Player bookUrl={`${url}`} url={`${playUrl}`} />
      }
    </View>
  )
}

export default () => <UIProvider><Index/></UIProvider>