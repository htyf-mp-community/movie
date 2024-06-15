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
import { auth, getSearch } from '@/server/api';

function Index() {
  const ui = useUI();
  const apps = useAppSelector(i => i.apps);
  const isDebug = apps?.__ENV__ === 'DEV';
  const [msg, setMsg] = useState('验证资源...');
  const getData = useCallback(async () => {
    return new Promise(async resolve => {
      if (jssdk) {
        setMsg('正在验证真人操作...');
        let data = await auth();
        resolve(data);
        navigate.relaunch({
          url: routes.pages.home,
        });
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
