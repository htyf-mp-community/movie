import { View, Text, Image, ScrollView, Button, Input } from '@tarojs/components'
import Taro, { useDidShow, useLoad, useRouter } from '@tarojs/taro'
import './index.scss'
import { BookItem, UIProvider, appStoreInit, copy, navigate, setAppData, setEnv, setHomeData, useAppSelector, useDispatch, useUI } from '@/_UIHOOKS_';
import {  Header } from '@/_UIHOOKS_/components';
import { useState } from 'react';

function Index() {
  const ui = useUI();
  const apps = useAppSelector(i => i.apps);
  const isDebug = apps?.__ENV__ === 'DEV';
  const dispatch = useDispatch();
  const [appDataString, setAppDataString] = useState('/mock.json')

  return (
    <View className='pages-setting-wrap'>
      <Header left={false} title='设置' />
      <View className='pages-setting-body-wrap'>
        <ScrollView
          className='pages-setting-scroll-view'
          scrollY
        >
          <View
            className='pages-setting-scroll-body'
          >
           <View>
            <View>
              <View className='pages-setting-app-data-string-ipt-wrap'>
                <Input 
                  placeholderTextColor='#333'
                  placeholder='请输入json url'
                  className='pages-setting-app-data-string-ipt'
                  value={appDataString}
                  onInput={(e) => {
                    setAppDataString(e.detail.value)
                  }}
                />
              </View>
              <Button
                onClick={async () => {
                  if (appDataString) {
                    try {
                      const data = await Taro.request({
                        url: appDataString,
                        method: 'GET',
                      })
                      const obj = data.data || {}
                      debugger
                      dispatch(setAppData(obj))
                      ui.showModal({
                        title: '提示',
                        content: '导入数据成功！',
                        type: 'success',
                        theme: 'theme1',
                        onOk: () => {
                          
                        }
                      })
                    } catch (error) {
                      console.error(error)
                      ui.showModal({
                        title: '提示',
                        content: '导入数据失败！',
                        type: 'success',
                        theme: 'theme2',
                        onOk: () => {
                          
                        }
                      })
                    }
                  } else {
                    ui.showModal({
                      title: '提示',
                      content: '请输入正确json URL',
                      type: 'success',
                      theme: 'theme2',
                      onOk: () => {
                        
                      }
                    })
                  }
                }}
              >
                <Text>导入数据</Text>
              </Button>
            </View>
            <View>
              <Button
                onClick={() => {
                  try {
                    copy(JSON.stringify(apps))
                    ui.showModal({
                      title: '提示',
                      content: '导出数据成功！',
                      type: 'success',
                      theme: 'theme1',
                      onOk: () => {
                        
                      }
                    })
                  } catch (error) {
                    ui.showModal({
                      title: '提示',
                      content: '导出数据失败！',
                      type: 'success',
                      theme: 'theme2',
                      onOk: () => {
                        
                      }
                    })
                  }
                  
                }}
              >
                <Text>导出数据</Text>
              </Button>
            </View>
            <View>
              <Button
                onClick={() => {
                  dispatch(appStoreInit())
                  ui.showModal({
                    title: '提示',
                    content: '清空数据成功！',
                    type: 'success',
                    theme: 'theme1',
                    onOk: () => {
                      
                    }
                  })
                }}
              >
                <Text>清空数据</Text>
              </Button>
            </View>
            <View>
              <Button
                onClick={() => {
                  dispatch(setEnv(isDebug ? 'MASTER' : 'DEV'))
                }}
              >
                <Text>debuger({isDebug ? 'YES' : 'NO'})</Text>
              </Button>
            </View>
          </View>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

export default () => <UIProvider><Index/></UIProvider>