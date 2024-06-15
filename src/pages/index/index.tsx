import { View, Text } from '@tarojs/components';
import './index.scss';
import { useCallback, useEffect, useState } from 'react';
import {
  UIProvider,
  setHomeData,
  useAppSelector,
  useDispatch,
  useUI,
  setDBData,
  navigate,
} from '@/_UIHOOKS_';
import jsCrawler, { host } from '@/utils/js-crawler';
import jssdk from '@htyf-mp/js-sdk';
import routes from '@/routes';

console.log(jsCrawler);

function Index() {
  const ui = useUI();
  const apps = useAppSelector(i => i.apps);
  const isDebug = apps?.__ENV__ === 'DEV';
  const dispatch = useDispatch();
  const [msg, setMsg] = useState('验证资源...');
  const getData = useCallback(async () => {
    return new Promise(async resolve => {
      if (jssdk) {
        let data = await jssdk?.puppeteer({
          url: `${host}`,
          jscode: `${jsCrawler}`,
          debug: isDebug,
          wait: 2000,
          timeout: 1000 * 30,
          callback: () => {},
        });
        if (!data) {
          setMsg('请先进行验证真人操作...');
          data = await jssdk?.puppeteer({
            url: `${host}`,
            jscode: `${jsCrawler}`,
            debug: true,
            wait: 2000,
            timeout: 1000 * 60 * 10,
            callback: () => {},
          });
        }
        resolve(data);
        navigate.relaunch({
          url: routes.pages.home,
        });
        if (data?.items?.length) {
          dispatch(
            setHomeData({
              ...data,
              items: data?.items?.map(i => i.url),
            }),
          );
          dispatch(setDBData(data?.items));
        }
      }
    });
  }, [isDebug]);

  useEffect(() => {
    // initSearch();
    getData();
  }, []);

  return (
    <View className="pages-index-wrap">
      <Text className="pages-index-loading">{msg}</Text>
    </View>
  );
}

export default () => (
  <UIProvider>
    <Index />
  </UIProvider>
);
