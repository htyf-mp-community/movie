import { View, Text, Image, ScrollView, Button, Input } from '@tarojs/components'
import Taro, { useDidShow, useLoad, useRouter } from '@tarojs/taro'
import './index.scss'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { BookItem, UIProvider, navigate, setDBData, setHomeData, useAppSelector, useDispatch, useUI } from '@/_UIHOOKS_';
import lodash from 'lodash';
import { useImmer } from 'use-immer';
import jsCrawler, {host} from '@/utils/js-crawler';
import Header from './Header';
import Item from '@/component/Item'
import jssdk from '@htyf-mp/js-sdk'

enum TypeEnum {
  'movie_bt' = '全部', 
  'dbtop250' = '豆瓣电影Top250', 
  'zuixindianying' = '最新电影', 
  'dongmanjuchangban' = '剧场版', 
  'benyueremen' = '热映中', 
  'gcj' = '国产剧', 
  'meijutt' = '美剧', 
  'hanjutv' = '韩剧', 
  'fanju' = '番剧', 
}

function Index() {
  const ui = useUI();
  const router = useRouter();
  const params = router.params;
  const dispatch = useDispatch();
  const apps = useAppSelector(i => i.apps);
  const isDebug = apps?.__ENV__ === 'DEV';
  const [top, setTop] = useState(-1);
  const [dataObj, setDataObj] = useImmer<{[key: string]: any[]}>({});
  const [searchword, setSearchword] = useState<keyof typeof TypeEnum>('movie_bt')
  const [loading, setLoading] = useState(false)
  const getData = useCallback(async (page: number = 1, type: keyof typeof TypeEnum  = 'movie_bt') => {
    return new Promise(async (resolve) => {
      let url = page <= 1 ? `${host}movie_bt/movie_bt_series/dyy` : `${host}movie_bt/movie_bt_series/dyy/page/${page}`
      if (type === 'movie_bt') {
        url = page <= 1 ? `${host}movie_bt/movie_bt_series/dyy` : `${host}movie_bt/movie_bt_series/dyy/page/${page}`
      }
      if (type === 'dbtop250') {
        url = page <= 1 ? `${host}dbtop250` : `${host}dbtop250/page/${page}`
      }
      if (type === 'zuixindianying') {
        url = page <= 1 ? `${host}zuixindianying` : `${host}zuixindianying/page/${page}`
      }
      if (type === 'dongmanjuchangban') {
        url = page <= 1 ? `${host}dongmanjuchangban` : `${host}dongmanjuchangban/page/${page}`
      }
      if (type === 'benyueremen') {
        url = page <= 1 ? `${host}benyueremen` : `${host}benyueremen/page/${page}`
      }
      if (type === 'gcj') {
        url = page <= 1 ? `${host}gcj` : `${host}gcj/page/${page}`
      }
      if (type === 'meijutt') {
        url = page <= 1 ? `${host}meijutt` : `${host}meijutt/page/${page}`
      }
      if (type === 'hanjutv') {
        url = page <= 1 ? `${host}hanjutv` : `${host}hanjutv/page/${page}`
      }
      if (type === 'fanju') {
        url = page <= 1 ? `${host}fanju` : `${host}fanju/page/${page}`
      }
      if (jssdk) {
        setLoading(true)
        ui.showToast({
          content: '加载数据中...'
        })
        const data = await jssdk?.puppeteer({
          url: url,
          jscode: `${jsCrawler}`,
          debug: isDebug,
          wait: 2000,
          timeout: 1000 * 30,
          callback: () => {}
        })
        resolve(data)
        if (data?.items?.length) {
          dispatch(setDBData(data?.items))
          setDataObj((_dataObj) => {
            if (page === 1) {
              setTop(0)
              setTimeout(() => {
                setTop(-1)
              })
              return {
                1: data
              };
            }
            _dataObj[page] = data;
            return _dataObj;
          })
        }
        ui.hideToast()
        setLoading(false)
      }
    })
  }, [params])

  useEffect(() => {
    getData(1, searchword);
  }, [searchword])

  const list = useMemo(() => {
    const _list: Array<BookItem> = []
    for (const key in dataObj) {
      const items: any = lodash.get(dataObj, `[${key}]['items']`, []);
      _list.push(...items)
    }
    return _list
  }, [dataObj])

  const scProps = useMemo(() => {
    if (top === 0) {
      return {
        scrollTop: 0
      }
    }
    return {}
  }, [top])

  return (
    <View className='pages-type-wrap'>
      <Header />
      <View className='pages-type-select-wrap'>
        {
          Object.keys(TypeEnum).filter(i => !/^\d/.test(i)).map((item) => {
            const on = item === searchword
            return <View
              key={item}
              className={classNames('pages-type-select-item-btn', on && 'pages-type-select-item-btn-on')}
              onClick={() => {
                setSearchword(item)
              }}
            > 
              <Text className={classNames('pages-type-select-item-text', on && 'pages-type-select-item-text-on')}>{TypeEnum[item]}</Text>
            </View>
          })
        }
      </View>
      {
        loading ? <View>
          <Text>loading...</Text>
        </View> : undefined
      }
      <View className='pages-type-body-wrap'>
        <ScrollView
          {...scProps}
          className='pages-type-scroll-view'
          scrollY
          onScrollToLower={() => {
            const nextPage = (Object.keys(dataObj || {})?.length || 1) + 1;
            console.error('nextPage: ', nextPage)
            getData(nextPage, searchword)
          }}
        >
          <View
            className='pages-type-scroll-body'
          >
           <View className='pages-type-items-wrap'>
              {
                list?.map((item: any = {}) => {
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