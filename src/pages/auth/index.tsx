import { View, Text, Button } from '@tarojs/components';
import './index.scss';
import { useCallback, useEffect, useState } from 'react';
import { UIProvider, useAppSelector, navigate } from '@/_UIHOOKS_';
import jssdk from '@htyf-mp/js-sdk';
import routes from '@/routes';
import { auth } from '@/server/api';

function Index() {
  const apps = useAppSelector(i => i.apps);
  const isDebug = apps?.__ENV__ === 'DEV';
  const [msg, setMsg] = useState('为了数据安全, 请先验证真人操作!!!');
  const getData = useCallback(async () => {
    return new Promise(async resolve => {
      if (jssdk) {
        setMsg('正在验证真人操作...');
        let data = await auth();
        resolve(data);
        if (data) {
          navigate.redirectTo({
            url: routes.pages.search,
          });
        } else {
          setMsg('验证真人操作失败, 请重新验证！');
        }
      }
    });
  }, [isDebug]);

  return (
    <View className="pages-index-wrap">
      <Text className="pages-index-loading">{msg}</Text>
      <Text className="pages-index-loading">请耐心等待~</Text>
      <View className="pages-index-btn-wrap">
        <Button
          className="pages-index-btn"
          onClick={() => {
            getData();
          }}>
          立即验证
        </Button>
        <Button
          className="pages-index-btn"
          onClick={() => {
            navigate.navigateBack();
          }}>
          返回上一页
        </Button>
      </View>
    </View>
  );
}

export default () => (
  <UIProvider>
    <Index />
  </UIProvider>
);
