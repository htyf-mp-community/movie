import { View, Text, Image, ScrollView, Button, Input } from '@tarojs/components'
import Taro, { useDidShow, useLoad, useRouter } from '@tarojs/taro'
import './index.scss'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookItem, UIProvider, navigate, setDBData, setHomeData, useAppSelector, useDispatch, useUI } from '@/_UIHOOKS_';
import {  Header } from '@/_UIHOOKS_/components';
import lodash from 'lodash';
import { useImmer } from 'use-immer';
import jsCrawler, {host} from '@/utils/js-crawler';
import Item from '@/component/Item';
import jssdk from '@htyf-mp/js-sdk'

function Index() {
  const ui = useUI();
  const router = useRouter();
  const params = router.params;
  const dispatch = useDispatch();
  const apps = useAppSelector(i => i.apps);
  const isDebug = apps?.__ENV__ === 'DEV';
  const [dataObj, setDataObj] = useImmer<{[key: string]: any[]}>({});
  const [searchword, setSearchword] = useState('梦')
  const [loading, setLoading] = useState(false)
  const getData = useCallback(async (searchword: string = '梦', page: number = 1) => {
    return new Promise(async (resolve) => {
      if (jssdk) {
        const url = `${host}xssearrbch?q=${searchword}&f=_all&p=${page}`
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
  }, [params, isDebug])

  useEffect(() => {
    getData();
  }, [])

  const list = useMemo(() => {
    const _list: Array<BookItem> = []
    for (const key in dataObj) {
      const items: any = lodash.get(dataObj, `[${key}]['items']`, []);
      _list.push(...items)
    }
    return _list
  }, [dataObj])

  return (
    <View className='pages-search-wrap'>
      <Header title='搜索' />
      <View 
        className='pages-search-search-wrap'
      >
        <View className='pages-search-ipt-wrap'>
          <Input 
            autoCapitalize="none"
            className='pages-search-ipt'
            type="text"
            onInput={(e) => {
              setSearchword(e.detail.value)
            }}
            onConfirm={(e) => {
              setSearchword(e.detail.value)
              getData(searchword, 1);
            }}
          />
        </View>
        <View
          className='pages-search-ipt-btn'
          onClick={() => {
            getData(searchword, 1);
          }}
        >
          <Text className='pages-search-ipt-btn-text'>搜索</Text>
        </View>
      </View>
      {
        loading ? <View>
          <Text>loading...</Text>
        </View> : undefined
      }
      <View className='pages-search-body-wrap'>
        <ScrollView
          className='pages-search-scroll-view'
          scrollY
          onScrollToLower={() => {
            const nextPage = (Object.keys(dataObj || {})?.length || 1) + 1;
            console.error('nextPage: ', nextPage)
            getData(searchword, nextPage)
          }}
        >
          <View
            className='pages-search-scroll-body'
          >
           <View className='pages-search-items-wrap'>
              {
                list?.map((item: any) => {
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