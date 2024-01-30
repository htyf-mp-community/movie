import { View, Text, Image, ScrollView, Button, Input } from '@tarojs/components'
import Taro, { useDidShow, useLoad, useRouter } from '@tarojs/taro'
import './index.scss'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UIProvider, navigate, setAppData, setHomeData, useAppSelector, useDispatch, useUI, copy, appStoreInit, setEnv, setDBData } from '@/_UIHOOKS_';
import jsCrawler, {host} from '@/utils/js-crawler';
import Header from './Header';
import URLParse from 'url-parse';
import lodash from 'lodash';
import Item from '@/component/Item';

console.log(jsCrawler)

function Index() {
  const ui = useUI();
  const apps = useAppSelector(i => i.apps);
  const home = apps?.home;
  const isDebug = apps?.__ENV__ === 'DEV';
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false)
  const getData = useCallback(async () => {
    return new Promise(async (resolve) => {
      if (global['__GLOBAL_MINI_APP_SDK__']) {
        ui.showToast({
          content: '加载数据中...'
        })
        setLoading(true)
        const data = await global['__GLOBAL_MINI_APP_SDK__']?.puppeteer({
          url: `${host}`,
          jscode: `${jsCrawler}`,
          debug: isDebug,
          wait: 2000,
          timeout: 1000 * 30,
        })
        resolve(data)
        if (data?.items?.length) {
          
          dispatch(setHomeData({
            ...data,
            items: data?.items?.map(i => i.url),
          }))
          dispatch(setDBData(data?.items))
        }
        setLoading(false)
        ui.hideToast();
      }
    })
  }, [isDebug])

  useEffect(() => {
    // initSearch();
    getData();
  }, [])

  const hisList = useMemo(() => {
    if (apps?.history) {
      return lodash.orderBy(Object.values(apps.history), ['time'], ['desc'])
    }
    return []
  }, [apps?.history])

  return (
    <View className='pages-index-wrap'>
      <Header />
      <View className='pages-index-body-wrap'>
        <ScrollView
          className='pages-index-scroll-view'
          scrollY
        >
          <View
            className='pages-index-scroll-body'
          >
            <View>
              <View
                onClick={() => {
                  getData();
                }}
              >
                <Text>刷新</Text>
              </View>
            </View>
            {
              hisList?.length ? <>
                <View className='pages-index-box-title-wrap'>
                  <Text className='pages-index-box-title-text'>历史记录</Text>
                </View>
                <View className='pages-index-scroll-y-wrap'>
                  <ScrollView
                    className='pages-index-scroll-y-view'
                    scrollX
                  >
                    <View className='pages-index-scroll-y-body-wrap'>
                      {
                        hisList?.map(({url}) => {
                          const urlObj = new URLParse(url, true)
                          const item = lodash.get(apps?.db || {}, `${urlObj.pathname}`, undefined)
                          if (!item) {
                            return <Text key={url}>{url}</Text>
                          }
                          return <Item key={url} item={item} />
                        })
                      }
                    </View>
                  </ScrollView>
                </View>
              </> : undefined
            }
            
            <View className='pages-index-box-title-wrap'>
              <Text className='pages-index-box-title-text'>热门推荐</Text>
            </View>
            <View className='pages-index-items-wrap'>
              {
                home?.items?.map((url) => {
                  const urlObj = new URLParse(url, true)
                  const item = lodash.get(apps?.db || {}, `${urlObj.pathname}`, undefined)
                  if (!item) {
                    return undefined
                  }
                  return <Item key={item.url} item={item} />
                })
              }
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

export default () => <UIProvider><Index/></UIProvider>